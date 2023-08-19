import type { ValidationSchema } from "../types.js";
import type { Request } from "express";
import type { z } from "zod";
import { APIError } from "../error.js";

const validate = async <T extends ValidationSchema>(
  schema: T,
  req: Request
): Promise<z.infer<T>> => {
  const parseResult = await schema.safeParseAsync(req);

  if (!parseResult.success) {
    const processedErrors = parseResult.error.issues.map((issue) => ({
      location: issue.path.join("."),
      message: issue.message,
      type: issue.code,
    }));

    throw new APIError(400, "Invalid parameters", {
      problems: processedErrors,
    });
  }
  return parseResult.data;
};

export { validate };
