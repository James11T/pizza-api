import { Request, Response, NextFunction, Handler } from "express";

class APIError extends Error {
  readonly code: number;
  readonly details: Record<string, any>;

  constructor(
    code: number,
    message: string,
    details: Record<string, any> = {}
  ) {
    super(message);
    this.code = code;
    this.details = details;
  }

  json() {
    return {
      code: this.code,
      message: this.message,
      ...this.details,
    };
  }
}

const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error: APIError;

  if (err instanceof APIError) {
    error = err;
  } else if (err instanceof SyntaxError) {
    // Usually when express.json fails
    const newError = new APIError(400, "Body contained invalid JSON");

    error = newError;
  } else {
    error = new APIError(500, "Unexpected server error");
    console.error(err);
  }

  return res.status(error.code).json(error.json());
};

const asyncController =
  (controller: Handler) =>
  (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(controller(req, res, next)).catch(next);
  };

export default errorHandler;
export { APIError, asyncController };
