import type { Brand } from 'effect'
import type Emittery from 'emittery'
import type { Class } from 'type-fest'
import type { EventHandlerParameters } from '~/core/event/types/event'
import { isFunction, isUndefined } from '@sindresorhus/is'
import { defu } from 'defu'
import { Effect, pipe, Ref, Schema } from 'effect'
import { defaultTo } from 'lodash-es'
import { nanoid } from 'nanoid'
import { useEffect } from 'react'
import { _internals } from '~/core/constants/proto_marker'
import { toSchemaParseError } from '~/core/error/utils/error_conversion'
import { EMITTERY_EVENT_MARKER } from '~/core/event/constants/event_marker'
import globalEmittery from '~/core/event/emittery'
import EventDispatchError from '~/core/event/errors/event_dispatch_error'
import EventHandlerError from '~/core/event/errors/event_handler_error'
import { runCallback, runPromise } from '~/core/runtime/runtime_execution'

/**
 * Represents the internal configuration of an Emittery event.
 */
interface EmitteryEventInternals<A = never, I = never> {
  schema: Schema.Schema<A, I>;
  emittery: Emittery;
}

function baseEmitteryEvent<
  T extends string,
  A = never,
  I = never,
>(tag: T, schema?: Schema.Schema<A, I>, emittery?: Emittery) {
  class Base {
    static get [EMITTERY_EVENT_MARKER]() { return EMITTERY_EVENT_MARKER }

    /**
     * Internal configuration of the Emittery event.
     */
    readonly [_internals]: EmitteryEventInternals<A, I> = {
      schema: defaultTo(schema, Schema.Never as unknown as Schema.Schema<A, I>),
      emittery: defaultTo(emittery, globalEmittery),
    }

    /**
     * Unique tag for this emittery event that can
     * be used to identify the event and is used
     * for debugging and tracing.
     */
    readonly _tag: T = tag

    /**
     * Dispatches an event with the given data.
     *
     * @param data - The data to be dispatched with the event.
     */
    dispatch(data: [I] extends [never] ? void : I) {
      return Effect.gen(this, function* () {
        const internals = this[_internals]

        const eventDataRef = yield* Ref.make<A | undefined>(undefined)
        if (isUndefined(data)) {
          yield* Ref.set(eventDataRef, undefined)
        } else {
          yield* pipe(
            data as I,
            Schema.decode(internals.schema, { errors: 'all' }),
            toSchemaParseError(`Unexpected error occurred while decoding event data for event '${tag}'.`, data),
            Effect.flatMap(_ => Ref.set(eventDataRef, _)),
          )
        }

        return yield* pipe(
          eventDataRef.get,
          Effect.flatMap(data => Effect.tryPromise({
            try: () => internals.emittery.emit(tag, data),
            catch: EventDispatchError.fromUnknownError(
              {
                event: tag,
                data,
              },
              `Unexpected error occurred while dispatching event '${tag}'.`,
            ),
          })),
        )
      })
    }

    handle<E = never>(...args: EventHandlerParameters<A, E>) {
      const [handler, options] = args

      return Effect.gen(this, function* () {
        const internals = this[_internals]
        const resolvedOptions = defu(options, {
          id: nanoid(),
          once: false,
        })

        return yield* Effect.try({
          try: () => {
            const unsubscribe = internals.emittery.on(tag, (data: [A] extends [never] ? void : A) => {
              return handler(data, unsubscribeFunction).pipe(runPromise())
            })

            function unsubscribeFunction() {
              unsubscribe()
            }

            return unsubscribe
          },
          catch: EventHandlerError.fromUnknownError(
            {
              event: tag,
              handler: handler.name || '[anonymous]',
            },
            `Unexpected error occurred while handling event '${tag}' with handler '${handler.name || resolvedOptions.id || '[anonymous]'}'.`,
          ),
        })
      })
    }

    useEvent<E = never>(...args: EventHandlerParameters<A, E>) {
      // eslint-disable-next-line react-hooks/rules-of-hooks -- useEvent is a custom hook
      useEffect(() => {
        const [handler, options] = args
        const id = options?.id || nanoid()

        const cancel = Effect.gen(this, function* () {
          const unsubscribe = yield* this.handle<E>(handler, defu(options, { id }))
          yield* Effect.addFinalizer(() => Effect.sync(() => {
            if (isFunction(unsubscribe)) {
              unsubscribe()
            }
          }))
          yield* Effect.never
        }).pipe(runCallback())

        return () => {
          cancel()
        }
      }, []) // eslint-disable-line react-hooks/exhaustive-deps -- this should only run once
    }

    get [Symbol.toStringTag]() {
      return this._tag
    }
  }
  ; (Base.prototype as any).name = tag

  return Base
}

/**
 * Instance type of the base emittery event.
 *
 * This is used to infer the instance type of the
 * emittery event class created by the `EmitteryEvent` function.
 */
type BaseEmitteryEventInstanceType<T extends string, A = never, I = never> = InstanceType<ReturnType<typeof baseEmitteryEvent<T, A, I>>>

/**
 * Factory function to create a new Emittery event class
 * with a specific tag and optional schema.
 *
 * The provided tag is prefixed with `@event/` to ensure that it is
 * unique and identifiable as an event.
 *
 * @param tag - The tag name of the event.
 */
export function EmitteryEvent<T extends string>(tag: T) {
  type Tag = `@event/${T}`
  const resolvedTag: Tag = `@event/${tag}` as Tag

  return <A = never, I = never>(options?: { schema?: Schema.Schema<A, I>; emittery?: Emittery }) => {
    class EmitteryEvent extends baseEmitteryEvent<Tag, A, I>(resolvedTag, options?.schema, options?.emittery) {}
    ;(EmitteryEvent.prototype as any).name = resolvedTag
    ;(EmitteryEvent as any).__tag__ = resolvedTag

    return EmitteryEvent as unknown as (new () => Brand.Branded<InstanceType<typeof EmitteryEvent>, typeof EMITTERY_EVENT_MARKER>) & { readonly [EMITTERY_EVENT_MARKER]: typeof EMITTERY_EVENT_MARKER }
  }
}

/**
 * Represents the type of an emittery event instance.
 *
 * This type is used to accept a `EmitteryEvent` as
 * an instance type rather than a constructor type.
 *
 * @template T - The tag of the event.
 * @template A - The type of the decoded event data.
 * @template I - The type of the encoded event data.
 */
export type EmitteryEvent<T extends string, A = never, I = never> = Brand.Branded<BaseEmitteryEventInstanceType<T, A, I>, typeof EMITTERY_EVENT_MARKER>

/**
 * Represents the type of an emittery event class.
 *
 * This type is used to accept a `EmitteryEvent` as
 * a constructor type rather than an instance type.
 *
 * @template T - The tag of the event.
 * @template A - The type of the decoded event data.
 * @template I - The type of the encoded event data.
 */
export type IEmitteryEvent<T extends string, A = never, I = never> = Class<EmitteryEvent<T, A, I>> & { readonly [EMITTERY_EVENT_MARKER]: typeof EMITTERY_EVENT_MARKER }
