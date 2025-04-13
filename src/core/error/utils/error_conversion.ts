import type { UnknownRecord } from 'type-fest'
import type { TaggedErrorOptions } from '~/core/error/factories/tagged_error'
import { defu } from 'defu'
import { Effect, Inspectable, Match, ParseResult, pipe } from 'effect'
import { defaultTo } from 'lodash-es'
import { inferCauseFromUnknownError } from '~/core/error/utils/error_cause'
import { isTaggedError } from '~/core/error/utils/error_is'
import SchemaParseError from '~/errors/schema_parse_error'
import UnknownError from '~/errors/unknown_error'

/**
 * Converts a parse error into a schema parse error.
 * The resulting error includes the issue details, associated data, and a message.
 *
 * @param message - The custom message to include in the schema parse error.
 * @param data - The data relevant to the schema parse error.
 */
export function toSchemaParseError(message?: string, data?: unknown) {
  return <A, E, R>(
    effect: Extract<E, ParseResult.ParseError> extends never
      ? never & { error: 'E must contain ParseResult.ParseError' }
      : Effect.Effect<A, E, R>,
  ) => effect.pipe(
    Effect.catchIf(
      error => error instanceof ParseResult.ParseError,
      error => SchemaParseError.fromParseError(data, message)(error),
    ),
  )
}

/**
 * Converts an unknown error into an a standardized unknown error.
 *
 * @param message - The custom message to include in the unknown error.
 * @param options - Additional options for configuring the unknown error.
 */
export function toUnknownError(message?: string, options?: Omit<TaggedErrorOptions, 'cause'> & { data?: UnknownRecord }) {
  const resolvedOptions = defu(
    options,
    {
      data: undefined,
      code: undefined,
    },
  )

  return (error: unknown) =>
    Match.value(error).pipe(
      Match.when(
        isTaggedError<string, any>(),
        err => pipe(
          err,
          inferCauseFromUnknownError,
          cause => new UnknownError(
            defaultTo(message, err.message),
            {
              cause,
              data: defaultTo(Inspectable.toJSON(resolvedOptions.data) as UnknownRecord, {}),
              code: defaultTo(resolvedOptions.code, err.code),
            },
          ),
        ),
      ),
      Match.orElse(err => pipe(
        err,
        inferCauseFromUnknownError,
        cause => new UnknownError(
          message,
          {
            cause: defaultTo(cause, new Error(Inspectable.toStringUnknown(err))),
            data: Inspectable.toJSON(resolvedOptions.data) as UnknownRecord,
            code: resolvedOptions.code,
          },
        ),
      )),
    )
}

/**
 * Converts an unknown error into a known error or a standardized unknown error.
 *
 * If the error cannot be identified, it will be converted into an `UnknownError`.
 *
 * @param error - The unknown error to convert.
 */
export function toKnownErrorOrConvertUnknown(error: unknown) {
  return Match.value(error).pipe(
    Match.when(isTaggedError<string, any>(), err => err),
    Match.when(ParseResult.isParseError, SchemaParseError.fromParseError()),
    Match.orElse(err => pipe(
      err,
      toUnknownError(),
    )),
  )
}
