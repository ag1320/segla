import { ValidationError } from "../utils/errors.js";

// Usage: router.post("/business/x", validate({ body: xSchema }), handler)
// Each of body, params and query is an optional Zod schema. The parsed
// values land on req.validated, because Express 5 makes req.query
// read-only and Zod may convert values (e.g. a string id to a number).
function validate(schemas) {
  return (req, res, next) => {
    req.validated = {};
    for (const part of ["body", "params", "query"]) {
      if (!schemas[part]) continue;
      const result = schemas[part].safeParse(req[part]);
      if (!result.success) {
        throw new ValidationError(describeIssues(part, result.error.issues));
      }
      req.validated[part] = result.data;
    }
    next();
  };
}

function describeIssues(part, issues) {
  return issues
    .map((issue) => `${[part, ...issue.path].join(".")}: ${issue.message}`)
    .join("; ");
}

export { validate };
