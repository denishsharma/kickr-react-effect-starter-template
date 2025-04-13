import { isError } from '@sindresorhus/is'
import { Match } from 'effect'
import { defaultTo, has } from 'lodash-es'
import { isTaggedError } from '~/core/error/utils/error_is'

/**
 * infers the cause of an unknown error.
 *
 * This function is useful for extracting the cause of an error when the error is not
 * explicitly known to be an instance of a specific error class.
 *
 * It uses pattern matching to check if the error is a tagged error, a TypeError, a ReferenceError,
 * or a generic Error. If the error has a cause property, it will return that as the cause.
 * Otherwise, it will return the error itself.
 *
 * @param error - The unknown error to infer the cause from.
 */
export function inferCauseFromUnknownError(error: unknown) {
  return Match.value(error).pipe(
    Match.when(
      isTaggedError<string, any>(),
      err => defaultTo(err.cause, err),
    ),
    Match.whenOr(
      Match.instanceOf(TypeError),
      Match.instanceOf(ReferenceError),
      Match.instanceOf(Error),
      err => defaultTo(has(err, 'cause') ? isError(err.cause) ? err.cause : err : err, err),
    ),
    Match.orElse(() => undefined),
  )
}
