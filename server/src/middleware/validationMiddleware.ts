/**
 * Validation & Sanitization Middleware
 * Built with Google Antigravity & Vertex AI
 *
 * Validates request parameters and sanitizes input to prevent
 * XSS, script injection, and other security threats.
 */
import { Request, Response, NextFunction } from 'express';
import sanitizeHtml from 'sanitize-html';

/**
 * Sanitize a string by removing all HTML tags, script content,
 * and potentially dangerous characters.
 *
 * Property 11: Output contains no executable script content
 * or unescaped HTML.
 */
export function sanitize(input: string): string {
  // First pass: strip all HTML using sanitize-html
  let cleaned = sanitizeHtml(input, {
    allowedTags: [],
    allowedAttributes: {},
    disallowedTagsMode: 'recursiveEscape',
  });

  // Second pass: remove any remaining script-like patterns
  cleaned = cleaned
    .replace(/javascript\s*:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/data\s*:\s*text\/html/gi, '')
    .replace(/vbscript\s*:/gi, '')
    .replace(/expression\s*\(/gi, '')
    .replace(/eval\s*\(/gi, '')
    .replace(/<\s*\/?\s*script/gi, '')
    .replace(/document\s*\.\s*cookie/gi, '')
    .replace(/document\s*\.\s*write/gi, '')
    .replace(/window\s*\.\s*location/gi, '');

  return cleaned.trim();
}

/**
 * Deep sanitize all string values in an object.
 */
function sanitizeObject(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      result[key] = sanitize(value);
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      result[key] = sanitizeObject(value as Record<string, unknown>);
    } else if (Array.isArray(value)) {
      result[key] = value.map((item) =>
        typeof item === 'string'
          ? sanitize(item)
          : typeof item === 'object' && item !== null
          ? sanitizeObject(item as Record<string, unknown>)
          : item
      );
    } else {
      result[key] = value;
    }
  }
  return result;
}

/**
 * Validation schema definition.
 */
interface FieldSchema {
  type: 'string' | 'number' | 'object';
  required: boolean;
  minLength?: number;
  maxLength?: number;
}

interface ValidationSchema {
  body?: Record<string, FieldSchema>;
  query?: Record<string, FieldSchema>;
}

/**
 * Validation schemas for each API endpoint.
 */
export const VALIDATION_SCHEMAS: Record<string, ValidationSchema> = {
  'POST /api/chat': {
    body: {
      message: { type: 'string', required: true, minLength: 1, maxLength: 2000 },
      sessionId: { type: 'string', required: true, minLength: 1, maxLength: 100 },
    },
  },
  'GET /api/timeline': {
    query: {
      format: { type: 'string', required: false, minLength: 1, maxLength: 20 },
    },
  },
  'GET /api/polling-stations': {
    query: {
      location: { type: 'string', required: true, minLength: 1, maxLength: 200 },
    },
  },
  'POST /api/calendar/reminder': {
    body: {
      milestone: { type: 'object', required: true },
    },
  },
};

/**
 * Validate a value against a field schema.
 */
function validateField(
  value: unknown,
  schema: FieldSchema,
  fieldName: string
): string | null {
  if (schema.required && (value === undefined || value === null || value === '')) {
    return `Field "${fieldName}" is required`;
  }

  if (value === undefined || value === null) {
    return null; // Optional field not provided
  }

  if (schema.type === 'string' && typeof value !== 'string') {
    return `Field "${fieldName}" must be a string`;
  }

  if (schema.type === 'number' && typeof value !== 'number') {
    return `Field "${fieldName}" must be a number`;
  }

  if (schema.type === 'object' && (typeof value !== 'object' || Array.isArray(value))) {
    return `Field "${fieldName}" must be an object`;
  }

  if (typeof value === 'string') {
    if (schema.minLength && value.length < schema.minLength) {
      return `Field "${fieldName}" must be at least ${schema.minLength} characters`;
    }
    if (schema.maxLength && value.length > schema.maxLength) {
      return `Field "${fieldName}" must be at most ${schema.maxLength} characters`;
    }
  }

  return null;
}

/**
 * Validation middleware factory.
 * Returns middleware that validates and sanitizes request data
 * based on the endpoint's schema.
 */
export function validationMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const routeKey = `${req.method.toUpperCase()} ${req.path}`;
  const schema = VALIDATION_SCHEMAS[routeKey];

  // Sanitize all input regardless of schema
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  if (req.query) {
    for (const [key, value] of Object.entries(req.query)) {
      if (typeof value === 'string') {
        (req.query as Record<string, string>)[key] = sanitize(value);
      }
    }
  }

  if (!schema) {
    next();
    return;
  }

  const errors: string[] = [];

  // Validate body fields
  if (schema.body) {
    for (const [field, fieldSchema] of Object.entries(schema.body)) {
      const error = validateField(req.body?.[field], fieldSchema, field);
      if (error) errors.push(error);
    }
  }

  // Validate query fields
  if (schema.query) {
    for (const [field, fieldSchema] of Object.entries(schema.query)) {
      const error = validateField(req.query?.[field], fieldSchema, field);
      if (error) errors.push(error);
    }
  }

  if (errors.length > 0) {
    res.status(400).json({
      error: {
        code: 400,
        message: `Validation failed: ${errors.join('; ')}`,
      },
    });
    return;
  }

  next();
}
