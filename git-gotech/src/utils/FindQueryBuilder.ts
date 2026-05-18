import { Query } from "mongoose"
import { excludeField } from "../constants"

export class FindQueryBuilder<T> {
    public modelQuery: Query<T[], T>
    public readonly query: Record<string, string>

    constructor(modelQuery: Query<T[], T>, query: Record<string, string>) {
        this.modelQuery = modelQuery
        this.query = query
    }

    filter(): this {
        const filter = { ...this.query }

        excludeField.forEach((field) => delete filter[field])

        // remove empty values
        Object.keys(filter).forEach((key) => {
            if (filter[key] === "" || filter[key] === undefined) {
                delete filter[key]
            }
        })

        if (Object.keys(filter).length > 0) {
            this.modelQuery = this.modelQuery.find(filter)
        }

        return this
    }

    search(searchableField: string[]): this {
        const searchTerm = this.query.searchTerm

        if (!searchTerm) return this

        const searchQuery = {
            $or: searchableField.map((field) => ({
                [field]: { $regex: searchTerm, $options: "i" }
            }))
        }

        this.modelQuery = this.modelQuery.find(searchQuery)

        return this
    }

    dateRange(dateField: string = "createdAt"): this {
        const startDate = this.query.startDate;
        const endDate = this.query.endDate;

        if (startDate && endDate) {
            this.modelQuery = this.modelQuery.find({
                [dateField]: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate),
                },
            });
        }

        return this;
    }

    sort(): this {
        const sort = this.query.sort || "-createdAt"

        this.modelQuery = this.modelQuery.sort(sort)

        return this
    }

    fields(): this {
        const fields = this.query.fields?.split(",").join(" ") || ""

        this.modelQuery = this.modelQuery.select(fields)

        return this
    }

    paginate(): this {
        const page = Number(this.query.page) || 1
        const limit = Number(this.query.limit) || 10
        const skip = (page - 1) * limit

        this.modelQuery = this.modelQuery.skip(skip).limit(limit)

        return this
    }

    build() {
        return this.modelQuery
    }

    async getMeta() {
        const page = Number(this.query.page ?? 1);
        const limit = Number(this.query.limit ?? 10);

        const total = await this.modelQuery.model.countDocuments(
            this.modelQuery.getFilter()
        );

        return {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async buildWithMeta() {
        const page = Number(this.query.page ?? 1);
        const limit = Number(this.query.limit ?? 10);

        // data already paginated by .paginate()
        const data = await this.modelQuery;

        // count must use same filter/search but WITHOUT skip/limit
        const total = await this.modelQuery.model.countDocuments(
            this.modelQuery.getFilter()
        );

        return {
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
            data,
        };
    }


}