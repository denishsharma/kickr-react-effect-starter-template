import type { ReactNode } from 'react'
import { isBoolean, isNullOrUndefined, isNumber, isObject, isString } from '@sindresorhus/is'
import { Schema } from 'effect'
import { isValidElement } from 'react'

export const ReactNodeFromSelf = Schema.declare(
  (input): input is ReactNode => {
    return (
      isString(input)
      || isNumber(input)
      || isBoolean(input)
      || isNullOrUndefined(input)
      || isValidElement(input)
      || (Array.isArray(input) && input.every(item => isValidElement(item)))
      || (isObject(input) && !isNullOrUndefined(input) && !isValidElement(input) && !Array.isArray(input) && Object.values(input).every(item => isValidElement(item)))
    )
  },
  {
    identifier: 'ReactNodeFromSelf',
    description: 'Validates if the input is a valid ReactNode, including strings, numbers, booleans, null, undefined, valid React elements, arrays of valid React elements, and objects with valid React elements as values.',
    jsonSchema: {
      type: 'object',
      properties: {
        type: { type: 'string' },
        props: { type: 'object' },
        key: { type: 'string' },
      },
      additionalProperties: true,
    },
  },
)
