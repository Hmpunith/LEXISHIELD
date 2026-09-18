/**
 * Base Application Error class for LexiShield.
 * Every domain failure inherits from this hierarchy.
 */
export class LexiShieldFault extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly timestamp: string;
  public readonly details?: unknown;

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_FAULT', details?: unknown) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    this.timestamp = new Date().toISOString();
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

/** 400: Failed to parse or extract text from document */
export class DocumentParseFault extends LexiShieldFault {
  constructor(message: string, details?: unknown) {
    super(message, 400, 'DOCUMENT_PARSE_ERROR', details);
  }
}

/** 422: Document or schema validation failure */
export class ClauseValidationFault extends LexiShieldFault {
  constructor(message: string, details?: unknown) {
    super(message, 422, 'VALIDATION_ERROR', details);
  }
}

/** 502: AI Counsel / Gemini generation fault with graceful fallback info */
export class CounselServiceFault extends LexiShieldFault {
  constructor(message: string, details?: unknown) {
    super(message, 502, 'AI_SERVICE_FAULT', details);
  }
}

/** 429: Rate limit threshold exceeded */
export class ThrottleFault extends LexiShieldFault {
  constructor(message: string = 'Rate limit exceeded. Please wait a moment before sending more requests.') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
  }
}

/** 403: Security boundary violation */
export class SecurityViolationFault extends LexiShieldFault {
  constructor(message: string = 'Security validation failed.') {
    super(message, 403, 'SECURITY_VIOLATION');
  }
}
