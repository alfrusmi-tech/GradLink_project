
export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  // Do not attempt to send a second response.
  if (res.headersSent) {
    return next(err);
  }

  let statusCode =
    err.status ||
    err.statusCode ||
    (res.statusCode >= 400 ? res.statusCode : 500);

  let message = err.message || "Internal server error";

  // ==========================================
  // MULTER UPLOAD ERRORS
  // ==========================================

  if (err.code === "LIMIT_FILE_SIZE") {
    statusCode = 413;
    message = "File exceeds the allowed upload size";
  }

  if (
    err.code === "LIMIT_UNEXPECTED_FILE" ||
    err.code === "LIMIT_FILE_COUNT"
  ) {
    statusCode = 400;
    message = "Unexpected or too many uploaded files";
  }

  if (err.code === "LIMIT_PART_COUNT") {
    statusCode = 400;
    message = "Too many multipart form parts";
  }

  // ==========================================
  // MONGOOSE INVALID OBJECT ID
  // ==========================================

  if (
    err.name === "CastError" &&
    err.kind === "ObjectId"
  ) {
    statusCode = 404;
    message = "Resource not found";
  }

  // ==========================================
  // MONGOOSE DUPLICATE KEY
  // ==========================================

  if (err.code === 11000) {
    statusCode = 400;

    const field = Object.keys(
      err.keyValue || {}
    )[0];

    message = `Duplicate value for field: ${field}`;
  }

  // ==========================================
  // MONGOOSE VALIDATION ERROR
  // ==========================================

  if (err.name === "ValidationError") {
    statusCode = 400;

    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
  }
    // ==========================================
  // MALFORMED OR OVERSIZED REQUEST BODY
  // ==========================================

  if (err.type === "entity.parse.failed") {
    statusCode = 400;
    message = "Request body contains invalid JSON";
  }

  if (err.type === "entity.too.large") {
    statusCode = 413;
    message = "Request body is too large";
  }

  // ==========================================
  // FINAL ERROR RESPONSE
  // ==========================================

  res.status(statusCode).json({
    message,
    stack:
      process.env.NODE_ENV === "production"
        ? undefined
        : err.stack,
  });
};

