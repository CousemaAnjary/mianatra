import { z } from "zod";

export type SerializableJsonSchema = Record<string, unknown>;

export function toSerializableJsonSchema(schema: z.ZodType<unknown>): SerializableJsonSchema {
  const converted = z.toJSONSchema(schema) as SerializableJsonSchema;
  const { $schema: _schema, ...withoutRootSchema } = converted;
  return JSON.parse(JSON.stringify(withoutRootSchema)) as SerializableJsonSchema;
}
