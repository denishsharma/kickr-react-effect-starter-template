import type { UnknownRecord } from 'type-fest'
import type { TaggedErrorOptions } from '~/core/error/factories/tagged_error'
import { isNullOrUndefined, isObject } from '@sindresorhus/is'
import { Effect, Option, Schema } from 'effect'
import { defaultTo } from 'lodash-es'
import { ERROR_CODE_METADATA, ErrorCode } from '~/constants/error_code'
import { TaggedError } from '~/core/error/factories/tagged_error'
import { toSchemaParseError } from '~/core/error/utils/error_conversion'

export default class UnknownError extends TaggedError('unknown')({
  code: ErrorCode.E_UNKNOWN_ERROR,
  message: ERROR_CODE_METADATA.E_UNKNOWN_ERROR.message,
}) {
  constructor(
    message?: string,
    options?: TaggedErrorOptions & {
      /**
       * Additional data to include in the error.
       */
      data?: UnknownRecord;
    },
  ) {
    const { data, ...rest } = defaultTo(options, {})
    super(message, rest)

    /**
     * If data is not provided, then return none
     * otherwise, decode the data and return it
     */
    Object.assign(this, {
      data: () => Effect.gen(function* () {
        if (isNullOrUndefined(data) || !isObject(data)) {
          return Option.none()
        }

        const decoded = yield* Effect.suspend(() => Schema.decode(Schema.Object, { errors: 'all' })(data).pipe(
          toSchemaParseError('Unexpected error while decoding data context for unknown error.', { error: ErrorCode.E_UNKNOWN_ERROR, context: data }),
        ))

        return Option.some(decoded)
      }),
    })
  }
}
