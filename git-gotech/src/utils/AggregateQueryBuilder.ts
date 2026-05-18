import { Model } from "mongoose";
import { excludeField } from "../constants";
import { parsePagination, parseSort, parseFields } from "../helpers/queryParsing.helpers";
import { endOfDay, parseDDMMYY, startOfDay } from "./dateRange";

type AnyQuery = Record<string, any>;

export class AggregateQueryBuilder<T> {
  public pipeline: any[];
  public readonly query: AnyQuery;
  private readonly model: Model<T>;

  private stripPaginationStages(pipeline: any[]) {
    return pipeline.filter(
      (stage) => !stage.$skip && !stage.$limit
    );
  }


  private baseMatch: Record<string, any> = {};
  private searchMatch: Record<string, any> = {};

  constructor(model: Model<T>, basePipeline: any[], query?: AnyQuery) {
    this.model = model;
    this.pipeline = [...basePipeline];
    this.query = query ?? {};
  }

  filter(): this {
    const filter: Record<string, any> = { ...this.query };
    for (const field of excludeField) {
      delete filter[field];
    }

    // Convert string "true"/"false" to actual booleans
    for (const key in filter) {
      if (filter[key] === "true") filter[key] = true;
      if (filter[key] === "false") filter[key] = false;
    }

    this.baseMatch = filter;

    if (Object.keys(this.baseMatch).length) {
      this.pipeline.push({ $match: this.baseMatch });
    }
    return this;
  }

  search(searchableField: string[]): this {
    const searchTerm = (this.query.searchTerm as string)?.trim();
    if (!searchTerm) return this;

    const mongoose = require("mongoose");
    const objectIdRegex = /^[a-fA-F0-9]{24}$/;

    const orConditions = searchableField.map((field) => {
      if (field === "_id" && objectIdRegex.test(searchTerm)) {
        return { [field]: new mongoose.Types.ObjectId(searchTerm) };
      }
      return { [field]: { $regex: searchTerm, $options: "i" } };
    });

    this.searchMatch = { $or: orConditions };

    this.pipeline.push({ $match: this.searchMatch });
    return this;
  }

  dateRange(dateField: string = "createdAt"): this {
    const startDateStr = this.query.startDate;
    const endDateStr = this.query.endDate;

    if (!startDateStr || !endDateStr) return this;

    const startDate = parseDDMMYY(startDateStr);
    const endDate = parseDDMMYY(endDateStr);

    if (!startDate || !endDate) return this;

    const from = startOfDay(startDate);
    const to = endOfDay(endDate);

    this.pipeline.push({
      $match: {
        [dateField]: { $gte: from, $lte: to },
      },
    });

    return this;
  }

  sort(defaultSort: string = "-createdAt"): this {
    const { sortObj } = parseSort(this.query, defaultSort);
    this.pipeline.push({ $sort: sortObj });
    return this;
  }

  fields(): this {
    // For aggregate, fields means $project
    const { fields } = parseFields(this.query);
    if (!fields.length) return this;

    const project: Record<string, any> = {};
    fields.forEach((f) => (project[f] = 1));
    this.pipeline.push({ $project: project });

    return this;
  }

  paginate(): this {
    const { skip, limit } = parsePagination(this.query);
    this.pipeline.push({ $skip: skip }, { $limit: limit });
    return this;
  }

  async build() {
    return this.model.aggregate(this.pipeline);
  }

  async getMeta() {
    const { page, limit } = parsePagination(this.query);

    const countPipeline = [
      ...this.stripPaginationStages(this.pipeline),
      { $count: "total" },
    ];

    const countRes = await this.model.aggregate(countPipeline);
    const total = countRes?.[0]?.total ?? 0;

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }


  // BEST meta + data in one DB call (recommended)
  async buildWithMeta() {
    const { page, limit, skip } = parsePagination(this.query);
    const { sortObj } = parseSort(this.query, "-createdAt");

    const baseNoPaginate = this.stripPaginationStages(this.pipeline);

    const facetPipeline = [
      ...baseNoPaginate,
      {
        $facet: {
          data: [
            { $sort: sortObj },
            { $skip: skip },
            { $limit: limit },
          ],
          meta: [{ $count: "total" }],
        },
      },
    ];

    const res = await this.model.aggregate(facetPipeline);
    const data = res?.[0]?.data ?? [];
    const total = res?.[0]?.meta?.[0]?.total ?? 0;

    return {
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      data,
    };
  }

}
