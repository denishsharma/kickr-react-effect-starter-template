import type { Schema } from 'effect'
import type { ITaggedError, TaggedError } from '~/core/error/factories/tagged_error'
import { isClass, isObject, isString } from '@sindresorhus/is'
import { ERROR_MARKER } from '~/core/error/constants/error_marker'

/**
 * Checks if the given value is a tagged error.
 *
 * Narrows down the type of the error by providing:
 * - a tag
 * - a tagged error class
 *
 * Providing a tag checks if the error has the given tag.
 * Providing a tagged error class checks if the given value is an instance of the error class.
 *
 * @param tagOrTaggedErrorClass - The tag or tagged error class to check against.
 */
export function isTaggedError<T extends string, F extends Schema.Struct.Fields | undefined>(tagOrTaggedErrorClass?: string | ITaggedError<T, F> | undefined) {
  return (value: unknown): value is TaggedError<T, F> => {
    if (!isObject(value) && !isClass(value)) { return false }

    const proto = Object.getPrototypeOf(value)
    const isInstance = isClass(value)
    const constructor = isInstance ? (value as any) : proto?.constructor

    if (!constructor || constructor[ERROR_MARKER] !== ERROR_MARKER) {
      return false
    }

    if (!tagOrTaggedErrorClass) { return true }

    if (isString(tagOrTaggedErrorClass)) {
      const tag = tagOrTaggedErrorClass.startsWith('@error/')
        ? tagOrTaggedErrorClass
        : `@error/${tagOrTaggedErrorClass}`

      return isInstance
        ? (value as any).__tag__ === tag
        : '_tag' in value
          && isString((value as any)._tag)
          && (value as any)._tag.startsWith('@error/')
          && proto.name === tag
    }

    return value instanceof tagOrTaggedErrorClass
  }
}
