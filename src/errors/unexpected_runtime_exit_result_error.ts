import { Schema } from 'effect'
import { ERROR_CODE_METADATA, ErrorCode } from '~/constants/error_code'
import { TaggedError } from '~/core/error/factories/tagged_error'

export default class UnexpectedRuntimeExitResultError extends TaggedError('unexpected_runtime_exit_result')({
  code: ErrorCode.E_UNEXPECTED_RUNTIME_EXIT_RESULT,
  message: ERROR_CODE_METADATA.E_UNEXPECTED_RUNTIME_EXIT_RESULT.message,
  schema: Schema.Struct({
    result: Schema.ExitFromSelf({
      success: Schema.Any,
      defect: Schema.Defect,
      failure: Schema.Any,
    }),
  }),
}) {}
