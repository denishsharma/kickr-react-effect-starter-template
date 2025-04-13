import type { TaggedErrorOptions } from '~/core/error/factories/tagged_error'
import { ParseResult, Schema } from 'effect'
import { ERROR_CODE_METADATA, ErrorCode } from '~/constants/error_code'
import { TaggedError } from '~/core/error/factories/tagged_error'

export default class SchemaParseError extends TaggedError('schema_parse')({
  code: ErrorCode.E_SCHEMA_PARSE_ERROR,
  message: ERROR_CODE_METADATA.E_SCHEMA_PARSE_ERROR.message,
  schema: Schema.Struct({
    issue: Schema.String,
    data: Schema.optional(Schema.Unknown),
  }),
}) {
  readonly [ParseResult.ParseErrorTypeId] = ParseResult.ParseErrorTypeId

  /**
   * The parse issue associated with the error.
   */
  issue: ParseResult.ParseIssue

  constructor(issue: ParseResult.ParseIssue, data?: unknown, message?: string, options?: TaggedErrorOptions) {
    super({ issue: '', data }, message, options)
    this.issue = issue
    this.update((draft) => {
      draft.issue = ParseResult.TreeFormatter.formatIssueSync(issue)
    })
  }

  override toString() {
    return `<${this._tag}> [${this.code}]: ${this.message}\n${ParseResult.TreeFormatter.formatIssueSync(this.issue)}`
  }

  override toJSON() {
    return {
      ...super.toJSON(),
      issue: ParseResult.ArrayFormatter.formatIssueSync(this.issue),
    }
  }

  /**
   * Creates a new `SchemaParseError` instance from a `ParseResult.ParseError`
   * with the provided context.
   *
   * @param data - The data that caused the error
   * @param message - Human-readable error message to provide more context
   * @param options - Additional options for configuring the `SchemaParseError`
   */
  static fromParseError(data?: unknown, message?: string, options?: Omit<TaggedErrorOptions, 'cause'>) {
    return (error: ParseResult.ParseError) => new SchemaParseError(error.issue, data, message, { ...options, cause: error })
  }
}
