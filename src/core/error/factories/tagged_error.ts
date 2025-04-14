import type { Brand } from 'effect'
import type { Draft } from 'mutative'
import type { Class, Spread } from 'type-fest'
import type { ErrorCode } from '~/constants/error_code'
import type { SchemaFromFields } from '~/core/schema/type'
import { isFunction, isNullOrUndefined, isObject } from '@sindresorhus/is'
import { defu } from 'defu'
import { Data, Effect, Match, Option, Schema } from 'effect'
import { has, omit } from 'lodash-es'
import { create } from 'mutative'
import { _internals } from '~/core/constants/proto_marker'
import { ERROR_MARKER } from '~/core/error/constants/error_marker'

/**
 * The default options for the tagged error
 * to be used when creating a new tagged error.
 */
interface TaggedErrorDefaultOptions {
  /**
   * Unique application-wide error code for
   * this tagged error.
   */
  code: ErrorCode;

  /**
   * A human-readable message that describes the error
   * in more detail and is suitable for logging.
   */
  message: string;
}

/**
 * Options that can be passed to the tagged error
 * constructor to customize the error.
 */
export interface TaggedErrorOptions {
  /**
   * The unique tag for this error that can be
   * used to identify the error type and is used
   * for debugging and tracing.
   */
  code?: ErrorCode;

  /**
   * The original error that caused this
   * error to be thrown.
   */
  cause?: Error;
}

/**
 * Constructor type for the tagged error.
 *
 * If the schema is not provided, then the constructor
 * will only accept a message and options.
 *
 * If the schema is provided, then the constructor
 * will accept a data object that must conform to the
 * schema, a message, and options.
 */
export type TaggedErrorConstructor<F extends Schema.Struct.Fields | undefined = undefined> =
  F extends undefined
    ? [message?: string, options?: TaggedErrorOptions]
    : [data: Schema.Schema.Encoded<SchemaFromFields<F>>, message?: string, options?: TaggedErrorOptions]

/**
 * Represents the internal configuration for the tagged error.
 */
interface TaggedErrorInternals<F extends Schema.Struct.Fields | undefined = undefined> {
  /**
   * The schema that data must conform to.
   *
   * If the data does not conform to the schema, then
   * the error will be thrown.
   *
   * It is used to validate the additional context that
   * can be passed to the error.
   */
  schema?: SchemaFromFields<F>;

  /**
   * Encoded data that is passed to the error
   * and must conform to the schema.
   */
  data?: Schema.Schema.Encoded<SchemaFromFields<F>>;
}

function baseTaggedError<
  T extends string,
  F extends Schema.Struct.Fields | undefined = undefined,
>(tag: T, schema?: SchemaFromFields<F>) {
  class Base extends Data.Error {
    static get [ERROR_MARKER]() { return ERROR_MARKER }

    /**
     * Unique application-wide error code for
     * this tagged error.
     */
    readonly code: ErrorCode

    /**
     * A human-readable message that describes the error
     * in more detail and is suitable for logging.
     */
    readonly message: string

    /**
     * The stack trace of the error.
     *
     * This is useful for debugging and tracing the
     * origin of the error.
     */
    readonly stack?: string

    /**
     * The original error that caused this
     * error to be thrown.
     *
     * This is useful for debugging and tracing the
     * origin of the error.
     */
    readonly cause?: Error

    /**
     * Internal configuration for the tagged error.
     */
    readonly [_internals]: TaggedErrorInternals<F> = { schema }

    /**
     * Unique tag for this error that can be
     * used to identify the error type and is used
     * for debugging and tracing.
     */
    readonly _tag: T = tag

    constructor(defaults: TaggedErrorDefaultOptions, ...args: TaggedErrorConstructor<F>) {
      super()

      /**
       * Destructure the args to get the message and options.
       *
       * If the schema is provided, then the first argument
       * will be the data object that must conform to the
       * schema, the second argument will be the message,
       * and the third argument will be the options.
       */
      const [
        messageOrData,
        messageOrOptions,
        options,
      ] = args

      /**
       * If the first argument is an object, then
       * it is the data context that is attached to
       * the error.
       */
      if (isObject(messageOrData)) {
        this[_internals].data = messageOrData as Schema.Schema.Encoded<SchemaFromFields<F>>
      } else {
        this[_internals].data = undefined
      }

      /**
       * Default options for the error
       * constructor argument if not provided.
       */
      const defaultOptions = {
        code: defaults.code,
        cause: undefined,
      }

      /**
       * Resolve the arguments to determine the
       * message and options for the error based
       * on the first argument type.
       */
      const resolvedArguments = Match.value(!isNullOrUndefined(this[_internals].data)).pipe(
        Match.withReturnType<{ message: string; options: TaggedErrorOptions }>(),
        Match.when(true, () => ({
          message: (messageOrOptions ?? defaults.message) as string,
          options: defu(options, defaultOptions),
        })),
        Match.orElse(() => ({
          message: (messageOrData ?? defaults.message) as string,
          options: defu((messageOrOptions ?? {}) as TaggedErrorOptions, defaultOptions),
        })),
      )

      /**
       * Set the error code, message, and cause
       * based on the resolved arguments.
       */
      this.code = resolvedArguments.options.code
      this.message = resolvedArguments.message
      this.cause = resolvedArguments.options.cause

      /**
       * Capture the stack trace for the error instance.
       */
      if (isNullOrUndefined(this.stack)) {
        Error.captureStackTrace(this, Object.getPrototypeOf(this).constructor)
      }
    }

    get [Symbol.toStringTag]() {
      return this._tag
    }

    /**
     * When the error is converted to a string,
     * it should return the error tag, code, and
     * message.
     */
    toString(): string {
      return `<${this._tag}> [${this.code}]: ${this.message}`
    }

    /**
     * When the error is converted to JSON,
     * it should return the error tag, code,
     * message, cause, and data.
     */
    toJSON() {
      return {
        _tag: this._tag,
        code: this.code,
        message: this.message,
        cause: Match.value(this.cause).pipe(
          Match.whenOr(
            Match.instanceOf(TypeError),
            Match.instanceOf(Error),
            cause => ({
              name: cause.name,
              message: cause.message,
              stack: cause.stack,
            }),
          ),
          Match.orElse(cause => cause),
        ),
        data: (
          (isNullOrUndefined(this[_internals].schema) || isNullOrUndefined(this[_internals].data))
            ? undefined
            : Effect.gen(this, function* () {
                const data = yield* this.data()
                if (Option.isNone(data) || isNullOrUndefined(this[_internals].schema)) {
                  return undefined
                }

                const schemaToEncode = this[_internals].schema
                return yield* Effect.suspend(() => Schema.encode(schemaToEncode)(data.value))
              }).pipe(Effect.runSync)
        ) as F extends undefined ? undefined : Schema.Schema.Encoded<SchemaFromFields<F>>,
        stack: this.stack,
      }
    }

    /**
     * Get the decoded data context that is
     * attached to the error.
     *
     * It will return validated and transformed
     * data context based on the schema.
     */
    data() {
      return Effect.gen(this, function* () {
        if (isNullOrUndefined(this[_internals].schema) || isNullOrUndefined(this[_internals].data)) {
          return Option.none()
        }

        const decoded = yield* Schema.decode(this[_internals].schema, { errors: 'all' })(this[_internals].data)
        return Option.some(decoded)
      })
    }

    /**
     * Update the data context that is attached
     * to the error.
     *
     * It will update the data context based on
     * the updater function provided.
     *
     * @param updater The updater function that will update the data context.
     */
    update(updater: F extends undefined ? never : (draft: Draft<Schema.Schema.Encoded<SchemaFromFields<F>>>) => void) {
      if (isNullOrUndefined(this[_internals].schema) || isNullOrUndefined(this[_internals].data) || !isFunction(updater)) {
        return
      }

      this[_internals].data = create(this[_internals].data, updater)
    }
  }
  ;(Base.prototype as any).name = tag

  return Base
}

/**
 * Instance type of the base tagged error.
 *
 * This is used to infer the instance type of the tagged error
 * class that is created by the `TaggedError` function.
 */
type BaseTaggedErrorInstanceType<T extends string, F extends Schema.Struct.Fields | undefined = undefined> = InstanceType<ReturnType<typeof baseTaggedError<T, F>>>

/**
 * Options for creating a tagged error instance
 * using the `make` method.
 */
type TaggedErrorMakeOptions<F extends Schema.Struct.Fields | undefined = undefined> = Spread<TaggedErrorDefaultOptions & { message?: string }, F extends undefined ? object : { data: Schema.Schema.Encoded<SchemaFromFields<F>> }>

/**
 * Factory function to create a tagged error class with a
 * specific tag and default options.
 *
 * The provided tag is prefixed with `@error/` to ensure that it is unique
 * and does not conflict with other tags.
 *
 * @param tag The unique tag for the error.
 */
export function TaggedError<T extends string>(tag: T) {
  const resolvedTag = `@error/${tag}` as const

  /**
   * @param options The default options for the tagged error.
   */
  return <F extends Schema.Struct.Fields | undefined = undefined>(
    options: TaggedErrorDefaultOptions & { schema?: SchemaFromFields<F> },
  ) => {
    class TaggedError extends baseTaggedError<typeof resolvedTag, F>(resolvedTag, options.schema) {
      constructor(...args: TaggedErrorConstructor<F>) {
        const { schema, ...rest } = options
        super(rest, ...args)
      }

      static make<V extends TaggedError>(this: new (...args: any[]) => V, options: TaggedErrorMakeOptions<F>) {
        if (has(options, 'data') && isObject(options.data)) {
          const args = [
            options.data,
            options.message,
            omit(options, 'data', 'message'),
          ] as unknown as TaggedErrorConstructor<F>
          return new TaggedError(...args) as Brand.Branded<V, typeof ERROR_MARKER>
        }

        const args = [
          options.message,
          omit(options, 'message'),
        ] as unknown as TaggedErrorConstructor<F>
        return new TaggedError(...args) as Brand.Branded<V, typeof ERROR_MARKER>
      }
    }
    ;(TaggedError.prototype as any).name = resolvedTag
    ;(TaggedError as any).__tag__ = resolvedTag

    return TaggedError as unknown as (new (...args: TaggedErrorConstructor<F>) => Brand.Branded<InstanceType<typeof TaggedError>, typeof ERROR_MARKER>) & { make: typeof TaggedError.make; readonly [ERROR_MARKER]: typeof ERROR_MARKER }
  }
}

/**
 * Represents the type for a tagged error instance.
 *
 * This type is used to accept a `TaggedError`
 * as an instance type rather than a class type.
 *
 * @template T - The unique tag for the error.
 * @template F - The schema fields for the additional data context.
 */
export type TaggedError<T extends string, F extends Schema.Struct.Fields | undefined = undefined> = Brand.Branded<BaseTaggedErrorInstanceType<T, F>, typeof ERROR_MARKER>

/**
 * Represents the type for a tagged error class.
 *
 * This type is used to accept a `TaggedError`
 * as a class type rather than an instance type.
 *
 * @template T - The unique tag for the error.
 * @template F - The schema fields for the additional data context.
 */
export type ITaggedError<T extends string, F extends Schema.Struct.Fields | undefined = undefined> = Class<TaggedError<T, F>> & { make: (options: TaggedErrorMakeOptions<F>) => TaggedError<T, F>; readonly [ERROR_MARKER]: typeof ERROR_MARKER }

/**
 * Helper type to extract the additional context
 * from the tagged error.
 */
export type InferTaggedErrorAdditionalContext<T extends TaggedError<any, any>> = T extends TaggedError<any, infer F> ? Schema.Schema.Type<SchemaFromFields<F>> : never

/**
 * Helper type to extract the constructor parameters
 * from the tagged error and convert them to parameters
 * that can be used to create a tagged error instance from
 * an unknown error.
 */
export type TaggedErrorFromUnknownErrorParameters<T extends TaggedError<any, any>> =
  T extends TaggedError<any, infer F>
    ? F extends undefined
      ? [message?: string, options?: Omit<TaggedErrorOptions, 'cause'>]
      : [data: Schema.Schema.Encoded<SchemaFromFields<F>>, message?: string, options?: Omit<TaggedErrorOptions, 'cause'>]
    : never
