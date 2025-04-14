import type { TaggedErrorFromUnknownErrorParameters } from '~/core/error/factories/tagged_error'
import { defu } from 'defu'
import { pipe, Schema } from 'effect'
import { ERROR_CODE_METADATA, ErrorCode } from '~/constants/error_code'
import { TaggedError } from '~/core/error/factories/tagged_error'
import { inferCauseFromUnknownError } from '~/core/error/utils/error_cause'

export default class EventHandlerError extends TaggedError('event_handler')({
  code: ErrorCode.E_EVENT_HANDLER,
  message: ERROR_CODE_METADATA[ErrorCode.E_EVENT_HANDLER].message,
  schema: Schema.Struct({
    event: Schema.String,
    handler: Schema.String,
    data: Schema.optional(Schema.Unknown),
  }),
}) {
  /**
   * Creates a new `EventHandlerError` instance from an unknown error
   * with the provided context.
   *
   * @param data - The data that caused the error
   * @param message - Human-readable error message to provide more context
   * @param options - Additional options for configuring the `EventHandlerError`
   */
  static fromUnknownError(...args: TaggedErrorFromUnknownErrorParameters<EventHandlerError>) {
    const [
      data,
      message,
      options,
    ] = args

    return (error: unknown) =>
      pipe(
        error,
        inferCauseFromUnknownError,
        cause => new EventHandlerError(
          data,
          message,
          defu(options, { cause }),
        ),
      )
  }
}
