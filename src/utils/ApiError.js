class ApiError extends Error {
  constructor(
    statusCode,
    message = "An error occurred",
    error = [],
    stack = ""
  ) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.success = statusCode >= 400 && statusCode < 600; // Error codes are typically in the 4xx and 5xx range
    this.error = error; // Array of errors, useful for validation errors
    if (stack) {
      this.stack = stack; // Optional stack trace for debugging
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
