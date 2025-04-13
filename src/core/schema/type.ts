import type { Schema } from 'effect'

/**
 * Type of schema based on the fields of a struct.
 */
export type SchemaFromFields<F extends Schema.Struct.Fields | undefined, R = never> =
  & Schema.Struct<Exclude<F, undefined>>
  & Schema.Schema<Schema.Schema.Type<Schema.Struct<Exclude<F, undefined>>>, Schema.Schema.Encoded<Schema.Struct<Exclude<F, undefined>>>, R>
