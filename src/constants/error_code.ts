import type { InferValue } from 'better-enums'
import { Enum } from 'better-enums'

/**
 * The error codes that are used in the application.
 */
export const ERROR_CODE = Enum({
  E_SCHEMA_PARSE_ERROR: 'E_SCHEMA_PARSE_ERROR',
  E_UNKNOWN_ERROR: 'E_UNKNOWN_ERROR',
  E_UNEXPECTED_RUNTIME_EXIT_RESULT: 'E_UNEXPECTED_RUNTIME_EXIT_RESULT',
  E_EVENT_DISPATCH: 'E_EVENT_DISPATCH',
  E_EVENT_HANDLER: 'E_EVENT_HANDLER',
})

export type ErrorCode = InferValue<typeof ERROR_CODE>
export const ErrorCode = ERROR_CODE.accessor

/**
 * Metadata for the error codes.
 * This is used to provide additional information about the error codes.
 */
export interface ErrorCodeMetadata {
  message: string;
}

export const ERROR_CODE_METADATA: Record<ErrorCode, ErrorCodeMetadata> = {
  [ErrorCode.E_SCHEMA_PARSE_ERROR]: {
    message: 'Unknown error occurred while parsing the schema.',
  },
  [ErrorCode.E_UNKNOWN_ERROR]: {
    message: 'Unknown error occurred in the application which is not handled by the application.',
  },
  [ErrorCode.E_UNEXPECTED_RUNTIME_EXIT_RESULT]: {
    message: 'Unexpected runtime exit result returned from the application runtime and not able to be handled.',
  },
  [ErrorCode.E_EVENT_DISPATCH]: {
    message: 'Unexpected error occurred while emitting the event.',
  },
  [ErrorCode.E_EVENT_HANDLER]: {
    message: 'Unexpected error occurred while handling the event.',
  },
}
