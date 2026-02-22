/**
 * Converts JSON Schema objects to Zod schemas.
 * Used by the ADK adapter which requires Zod for function parameter validation.
 */

import { z, type ZodTypeAny } from 'zod';

interface JsonSchema {
  type?: string;
  description?: string;
  enum?: unknown[];
  properties?: Record<string, JsonSchema>;
  required?: string[];
  items?: JsonSchema;
  additionalProperties?: boolean | JsonSchema;
  oneOf?: JsonSchema[];
}

/**
 * Convert a JSON Schema property to a Zod schema.
 */
function convertProperty(schema: JsonSchema): ZodTypeAny {
  if (schema.oneOf) {
    const schemas = schema.oneOf.map(convertProperty);
    if (schemas.length === 0) return z.unknown();
    if (schemas.length === 1) return schemas[0];
    // z.union requires at least 2 members
    return z.union([schemas[0], schemas[1], ...schemas.slice(2)]);
  }

  switch (schema.type) {
    case 'string': {
      let s = z.string();
      if (schema.description) s = s.describe(schema.description);
      if (schema.enum) {
        const values = schema.enum as string[];
        if (values.length === 1) return z.literal(values[0]);
        return z.enum(values as [string, ...string[]]);
      }
      return s;
    }

    case 'number':
    case 'integer': {
      let n = z.number();
      if (schema.description) n = n.describe(schema.description);
      return n;
    }

    case 'boolean': {
      let b = z.boolean();
      if (schema.description) b = b.describe(schema.description);
      return b;
    }

    case 'array': {
      const items = schema.items ? convertProperty(schema.items) : z.unknown();
      let a = z.array(items);
      if (schema.description) a = a.describe(schema.description);
      return a;
    }

    case 'object': {
      if (!schema.properties || Object.keys(schema.properties).length === 0) {
        // Open object with no defined properties
        return z.record(z.unknown()).describe(schema.description ?? '');
      }

      const shape: Record<string, ZodTypeAny> = {};
      const requiredSet = new Set(schema.required ?? []);

      for (const [key, propSchema] of Object.entries(schema.properties)) {
        let prop = convertProperty(propSchema);
        if (!requiredSet.has(key)) {
          prop = prop.optional();
        }
        shape[key] = prop;
      }

      const obj = z.object(shape);
      if (schema.additionalProperties !== false) {
        const passthrough = obj.passthrough();
        return schema.description ? passthrough.describe(schema.description) : passthrough;
      }
      return schema.description ? obj.describe(schema.description) : obj;
    }

    default:
      return z.unknown();
  }
}

/**
 * Convert a JSON Schema object to a Zod schema.
 */
export function jsonSchemaToZod(schema: JsonSchema): ZodTypeAny {
  return convertProperty(schema);
}
