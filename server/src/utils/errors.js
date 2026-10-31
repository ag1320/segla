// Errors the client is allowed to see. The central handler in app.js sends
// their status and message; every other error becomes a generic 500.
class AppError extends Error {
  constructor(message, status) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
  }
}

class NotFoundError extends AppError {
  constructor(message) {
    super(message, 404);
  }
}

class ConflictError extends AppError {
  constructor(message) {
    super(message, 409);
  }
}

export { AppError, ValidationError, NotFoundError, ConflictError };
