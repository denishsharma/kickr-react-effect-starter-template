import type { Option, Schema } from 'effect'
import type { ReactNode } from 'react'
import type { ReactComponentProps, ReactComponentPropsWithoutLocalState } from '~/core/react/types/react_component'
import type { R } from '~/core/runtime/runtime_execution'
import type { SchemaFromFields } from '~/core/schema/type'
import type SchemaParseError from '~/errors/schema_parse_error'
import { Effect, Fiber } from 'effect'
import { defaultTo, isEqual } from 'lodash-es'
import { memo, useEffect } from 'react'
import { _internals } from '~/core/constants/proto_marker'
import useReactComponentInternals from '~/core/react/hooks/use_react_component_internals'
import { runFork, runPromise } from '~/core/runtime/runtime_execution'

/**
 * Input type for the local store of the component.
 *
 * This type is used when updating the store of the component or
 * setting the initial state of the store.
 */
export type ReactComponentLocalStoreInput<S extends Schema.Struct.Fields | undefined> = Schema.Schema.Type<SchemaFromFields<S>>

/**
 * Output type for the local store of the component.
 *
 * This type is used in the component to access the store.
 */
export type ReactComponentLocalStoreOutput<S extends Schema.Struct.Fields | undefined> = Schema.Schema.Encoded<Schema.Struct<Exclude<S, undefined>>>

/**
 * Factory options to create a React component.
 */
export interface ReactComponentOptions<
  S extends Schema.Struct.Fields | undefined,
  F extends Schema.Struct.Fields | undefined,
> {
  props: {
    schema: SchemaFromFields<F>;
    onSchemaParseError?: (props: Schema.Schema.Encoded<SchemaFromFields<F>>, error: SchemaParseError) => Effect.Effect<Option.Option<Schema.Schema.Type<SchemaFromFields<F>>>, never, R>;
  };
  component: (props: ReactComponentProps<F, S>) => ReactNode;
  state?: {
    schema: SchemaFromFields<S>;
    initial: Schema.Schema.Encoded<Schema.Struct<Exclude<S, undefined>>> | ((props: ReactComponentPropsWithoutLocalState<F>) => Schema.Schema.Encoded<Schema.Struct<Exclude<S, undefined>>>);
  };
  onMount?: (props: ReactComponentProps<F, S>) => Effect.Effect<void, never, R>;
  onUnmount?: (props: ReactComponentProps<F, S>) => Effect.Effect<void, never, R>;
}

/**
 * Factory function to create a React component with a local store
 * and props validation using Effect and Schema.
 *
 * @param tag - The tag name of the component.
 */
export default function ReactComponent<
  T extends string,
>(tag: T) {
  return <
    S extends Schema.Struct.Fields | undefined = undefined,
    F extends Schema.Struct.Fields | undefined = undefined,
  >(options: ReactComponentOptions<S, F>) => {
    const resolvedTag = `@component/${tag}`

    const Component = (props: Schema.Schema.Encoded<SchemaFromFields<F>>) => {
      const { props: componentProps } = useReactComponentInternals({
        props: {
          schema: options.props.schema,
          value: props,
          modifier: (props) => {
            Object.defineProperty(props, _internals, {
              value: {
                tag,
              },
              enumerable: false,
              writable: false,
            })

            return props
          },
          onSchemaParseError: options.props.onSchemaParseError,
        },
        state: options.state
          ? {
              schema: options.state.schema,
              initial: options.state.initial,
            }
          : undefined,
      })

      useEffect(() => {
        const onMount = defaultTo(options.onMount, () => Effect.void)
        const forked = onMount(componentProps).pipe(runFork())

        return () => {
          Effect.gen(function* () {
            yield* Fiber.join(forked)

            const onUnmount = defaultTo(options.onUnmount, () => Effect.void)
            yield* onUnmount(componentProps)
          }).pipe(runPromise())
        }
      }, []) // eslint-disable-line react-hooks/exhaustive-deps -- this should only run once

      return options.component(componentProps)
    }

    Component.displayName = resolvedTag

    const memoizedComponent = memo(
      Component,
      (prevProps, nextProps) => isEqual(prevProps, nextProps),
    )

    memoizedComponent.displayName = `memo(memoized<${resolvedTag}>)`

    return memoizedComponent
  }
}
