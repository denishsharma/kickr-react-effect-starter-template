import type { TaggedErrorFromUnknownErrorParameters } from '~/core/error/factories/tagged_error'
import { defu } from 'defu'
import { pipe, Schema } from 'effect'
import { ERROR_CODE_METADATA, ErrorCode } from '~/constants/error_code'
import { TaggedError } from '~/core/error/factories/tagged_error'
import { inferCauseFromUnknownError } from '~/core/error/utils/error_cause'

const EventDispatchErrorDataSchema = Schema.Struct({
  event: Schema.String,
  data: Schema.optional(Schema.Unknown),
})

export default class EventDispatchError extends TaggedError('event_dispatch')({
  code: ErrorCode.E_EVENT_DISPATCH,
  message: ERROR_CODE_METADATA[ErrorCode.E_EVENT_DISPATCH].message,
  schema: EventDispatchErrorDataSchema,
}) {
  /**
   * Creates a new `EventDispatchError` instance from an unknown error
   * with the provided context.
   *
   * @param data - The data that caused the error
   * @param message - Human-readable error message to provide more context
   * @param options - Additional options for configuring the `EventDispatchError`
   */
  static fromUnknownError(...args: TaggedErrorFromUnknownErrorParameters<EventDispatchError>) {
    const [
      data,
      message,
      options,
    ] = args

    return (error: unknown) =>
      pipe(
        error,
        inferCauseFromUnknownError,
        cause => new EventDispatchError(
          data,
          message,
          defu(options, { cause }),
        ),
      )
  }
}
