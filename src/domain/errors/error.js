export class AppError extends Error {
    constructor(code, message, status = 500, details = null) {
        super(message);
        this.code = code;
        this.status = status;
        this.details = details;
        Object.setPrototypeOf(this, AppError.prototype);
    }
}

export class UserExistsError extends AppError {
    constructor(message = "User with this email already exists") {
        super("USER_EXISTS", message, 409);
        Object.setPrototypeOf(this, UserExistsError.prototype);
    }
}

export class InvalidCredentialsError extends AppError {
    constructor(message = "Invalid email or password") {
        super("INVALID_CREDENTIALS", message, 401);
        Object.setPrototypeOf(this, InvalidCredentialsError.prototype);
    }
}

export class TokenInvalidOrExpiredError extends AppError {
    constructor(message = "The token is invalid or has expired") {
        super("TOKEN_INVALID_OR_EXPIRED", message, 400);
        Object.setPrototypeOf(this, TokenInvalidOrExpiredError.prototype);
    }
}

export class TokenTypeMismatchError extends AppError {
    constructor(message = "The token type does not match the expected type") {
        super("TOKEN_TYPE_MISMATCH", message, 400);
        Object.setPrototypeOf(this, TokenTypeMismatchError.prototype);
    }
}

export class ForbiddenError extends AppError {
    constructor(message = "Forbidden") {
        super("FORBIDDEN", message, 403);
        Object.setPrototypeOf(this, ForbiddenError.prototype);
    }
}

export class CalendarNotFoundError extends AppError {
    constructor(message = "Calendar not found") {
        super("NOT_FOUND", message, 404);
        Object.setPrototypeOf(this, CalendarNotFoundError.prototype);
    }
}

export class PrimaryCalendarExistsError extends AppError {
    constructor(message = "Primary calendar already exists") {
        super("PRIMARY_EXISTS", message, 409);
        Object.setPrototypeOf(this, PrimaryCalendarExistsError.prototype);
    }
}

export class EventNotFoundError extends AppError {
    constructor(message = "Event not found") {
        super("NOT_FOUND", message, 404);
        Object.setPrototypeOf(this, EventNotFoundError.prototype);
    }
}