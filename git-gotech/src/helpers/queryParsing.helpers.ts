type AnyQuery = Record<string, any>;

export const parsePagination = (q: AnyQuery) => {
  const page = Math.max(1, Number(q.page ?? 1));
  const limit = Math.max(1, Math.min(100, Number(q.limit ?? 10)));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

export const parseSort = (q: AnyQuery, fallback = "-createdAt") => {
  // supports ?sort=-createdAt or ?sort=createdAt
  const sort = (q.sort as string) || fallback;
  // for aggregate we convert it to object
  const sortObj: Record<string, 1 | -1> = {};
  sort.split(",").forEach((s) => {
    const key = s.trim();
    if (!key) return;
    if (key.startsWith("-")) sortObj[key.slice(1)] = -1;
    else sortObj[key] = 1;
  });
  return { sort, sortObj };
};

export const parseFields = (q: AnyQuery) => {
  const fieldsStr = (q.fields as string) || "";
  const fields = fieldsStr
    .split(",")
    .map((f) => f.trim())
    .filter(Boolean);
  return { fieldsStr, fields };
};
