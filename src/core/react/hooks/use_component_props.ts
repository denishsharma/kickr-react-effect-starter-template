import type { Draft } from 'mutative'
import type { R } from '~/core/runtime/runtime_execution'
import type { SchemaFromFields } from '~/core/schema/type'
import type SchemaParseError from '~/errors/schema_parse_error'
import { Effect, Option, pipe, Schema } from 'effect'
import { cloneDeep, defaultTo } from 'lodash-es'
import { useMemo } from 'react'
import { toSchemaParseError } from '~/core/error/utils/error_conversion'
import { runSync } from '~/core/runtime/runtime_execution'

/**
 * Props type for the component without the store.
 *
 * This type is used when the component does not have a local store.
 */
export type ReactComponentPropsWithoutStore<F extends Schema.Struct.Fields | undefined = undefined> = Schema.Schema.Type<Schema.Struct<Exclude<F, undefined>>>

/**
 * Props type for the component with the store.
 *
 * This type is used when the component has a local store.
 */
export type ReactComponentPropsWithStore<
  F extends Schema.Struct.Fields | undefined = undefined,
  S extends Schema.Struct.Fields | undefined = undefined,
> =
  & Schema.Schema.Type<Schema.Struct<Exclude<F, undefined>>>
  & { store: { readonly state: Schema.Schema.Type<Schema.Struct<Exclude<S, undefined>>>; update: (updater: (draft: Draft<Schema.Schema.Encoded<Schema.Struct<Exclude<S, undefined>>>>) => void) => void } }

export type ReactComponentProps<
  F extends Schema.Struct.Fields | undefined = undefined,
  S extends Schema.Struct.Fields | undefined = undefined,
> = S extends undefined ? ReactComponentPropsWithoutStore<F> : ReactComponentPropsWithStore<F, S>

interface UseComponentPropsOptions<
  F extends Schema.Struct.Fields | undefined = undefined,
  S extends Schema.Struct.Fields | undefined = undefined,
> {
  schema: SchemaFromFields<F>;
  props: Schema.Schema.Encoded<SchemaFromFields<F>>;
  store?: {
    state: Schema.Schema.Type<SchemaFromFields<S>> | undefined;
    updateStore: (updater: (draft: Draft<Schema.Schema.Encoded<SchemaFromFields<S>>>) => void) => void;
  };
  modifier?: (props: Schema.Schema.Type<SchemaFromFields<F>>) => Schema.Schema.Type<SchemaFromFields<F>>;
  onSchemaParseError?: (props: Schema.Schema.Encoded<SchemaFromFields<F>>, error: SchemaParseError) => Effect.Effect<Option.Option<Schema.Schema.Type<SchemaFromFields<F>>>, never, R>;
}

/**
 * Internal hook to manage the props of a component.
 *
 * This hook is used to decode the props using the schema and
 * to provide the store state and update function if available.
 *
 * @param options - The options for the component props, including the schema, props, and store.
 */
export default function useComponentProps<
  F extends Schema.Struct.Fields | undefined = undefined,
  S extends Schema.Struct.Fields | undefined = undefined,
>(options: UseComponentPropsOptions<F, S>) {
  return useMemo(
    () => Effect.gen(function* () {
      const decoded = yield* pipe(
        options.props,
        Schema.decode(options.schema, { errors: 'all' }),
        toSchemaParseError('Unexpected error occurred while decoding component props.', options.props),
      ).pipe(
        Effect.catchTag('@error/schema_parse', error => Effect.gen(function* () {
          if (options.onSchemaParseError) {
            return yield* options.onSchemaParseError(options.props, error).pipe(
              Effect.flatMap(Option.match({
                onSome: props => Effect.succeed(props),
                onNone: () => error,
              })),
            )
          }

          return yield* error
        })),
        Effect.map(cloneDeep),
      )

      const modifier = defaultTo(options.modifier, (props: Schema.Schema.Type<SchemaFromFields<F>>) => props)
      const props = modifier(decoded)

      if (options.store && options.store.state) {
        Object.defineProperty(props, 'store', {
          value: new Proxy(options.store, {
            get: (target, prop) => {
              if (prop === 'state') {
                return target.state
              }

              if (prop === 'update') {
                return target.updateStore
              }

              return undefined
            },
          }),
        })
      }

      return props as ReactComponentProps<F, S>
    }).pipe(runSync()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      options.props,
      options.schema,
      options.store?.state,
      options.onSchemaParseError,
    ],
  )
}
