import { z } from "zod";

// Path params and query strings arrive as text, hence coerce.
const ID = z.coerce.number().int().positive();
const ID_PARAMS = z.strictObject({ id: ID });
const ISO_DATE = z.iso.date();
const CENTS = z.number().int().nonnegative();
// A rule's "description contains" text.
const DESCRIPTION_PATTERN = z.string().trim().min(2).max(255);

function atLeastOneField(schema) {
  return schema.refine((changes) => Object.keys(changes).length > 0, {
    message: "Send at least one field to change",
  });
}

export { ID, ID_PARAMS, ISO_DATE, CENTS, DESCRIPTION_PATTERN, atLeastOneField };
