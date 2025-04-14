import type { Draft } from 'mutative'
import type { ReactComponentProps } from '~/core/react/types/react_component'
import type { R } from '~/core/runtime/runtime_execution'
import type { SchemaFromFields } from '~/core/schema/type'
import type SchemaParseError from '~/errors/schema_parse_error'
import { isFunction, isNullOrUndefined } from '@sindresorhus/is'
import { Effect, Option, pipe, Schema } from 'effect'
import { useAtom } from 'jotai'
import { atomWithLazy } from 'jotai/utils'
import { cloneDeep, defaultTo } from 'lodash-es'
import { create } from 'mutative'
import { useCallback, useMemo, useRef } from 'react'
import { toSchemaParseError } from '~/core/error/utils/error_conversion'
import { runPromise, runSync } from '~/core/runtime/runtime_execution'

interface UseReactComponentInternalsOptions<
  F extends Schema.Struct.Fields | undefined = undefined,
  S extends Schema.Struct.Fields | undefined = undefined,
> {
  props: {
    schema: SchemaFromFields<F>;
    value: Schema.Schema.Encoded<SchemaFromFields<F>>;
    modifier?: (props: Schema.Schema.Type<SchemaFromFields<F>>) => Schema.Schema.Type<SchemaFromFields<F>>;
    onSchemaParseError?: (props: Schema.Schema.Encoded<SchemaFromFields<F>>, error: SchemaParseError) => Effect.Effect<Option.Option<Schema.Schema.Type<SchemaFromFields<F>>>, never, R>;
  };
  state?: {
    schema: SchemaFromFields<S>;
    initial: Schema.Schema.Encoded<SchemaFromFields<S>> | ((props: Schema.Schema.Type<SchemaFromFields<F>>) => Schema.Schema.Encoded<SchemaFromFields<S>>);
  };
}

export default function useReactComponentInternals<
  F extends Schema.Struct.Fields | undefined = undefined,
  S extends Schema.Struct.Fields | undefined = undefined,
>(options: UseReactComponentInternalsOptions<F, S>) {
  const props = useMemo(
    () => Effect.gen(function* () {
      const decoded = yield* pipe(
        options.props.value,
        Schema.decode(options.props.schema, { errors: 'all' }),
        toSchemaParseError('Unexpected error occurred while decoding component props.', options.props),
      ).pipe(
        Effect.catchTag('@error/schema_parse', error => Effect.gen(function* () {
          if (options.props.onSchemaParseError) {
            return yield* options.props.onSchemaParseError(options.props.value, error).pipe(
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

      const modifier = defaultTo(options.props.modifier, (props: Schema.Schema.Type<SchemaFromFields<F>>) => props)
      return modifier(decoded)
    }).pipe(runSync()),
    [options.props.value], // eslint-disable-line react-hooks/exhaustive-deps -- keep this dependency to avoid unnecessary re-renders
  )

  const internals = useRef({
    state: {
      encoded: options.state ? isFunction(options.state.initial) ? options.state.initial(props) : options.state.initial : undefined,
    },
  })

  const localStateAtomRef = useRef(atomWithLazy(
    () => Effect.gen(function* () {
      if (isNullOrUndefined(options.state) || isNullOrUndefined(internals.current.state.encoded)) { return undefined }

      return yield* Schema.decode(options.state.schema, { errors: 'all' })(internals.current.state.encoded).pipe(
        toSchemaParseError('Unexpected error occurred while decoding the initial state of the component local state.', internals.current.state.encoded),
      )
    }).pipe(runSync()),
  ))

  const [localState, setLocalState] = useAtom(localStateAtomRef.current)

  const updateLocalState = useCallback(
    (updater: (draft: Draft<Schema.Schema.Encoded<SchemaFromFields<S>>>) => void) =>
      Effect.gen(function* () {
        if (isNullOrUndefined(localState) || isNullOrUndefined(options.state)) { return }

        const state = yield* pipe(
          Effect.if(isNullOrUndefined(internals.current.state.encoded), {
            onTrue: () => Schema.encode(options.state!.schema, { errors: 'all' })(localState).pipe(
              toSchemaParseError('Unexpected error occurred while encoding the store.', localState),
            ),
            onFalse: () => Effect.succeed(internals.current.state.encoded as Schema.Schema.Encoded<SchemaFromFields<S>>),
          }),
          Effect.map(encoded => create(encoded, updater)),
          Effect.tap((updated) => { internals.current.state.encoded = updated }),
          Effect.flatMap(Schema.decode(options.state.schema, { errors: 'all' })),
          toSchemaParseError('Unexpected error occurred while decoding the updated store.', localState),
        )

        setLocalState(state)
      }).pipe(runPromise()),
    [
      localState,
      options.state,
      setLocalState,
    ],
  )

  const composedProps = useMemo(
    () => {
      if (options.state && localState) {
        Object.assign(props, {
          state: new Proxy({}, {
            get: (_target, prop) => {
              if (prop === 'value') {
                return localState
              }
              if (prop === 'update') {
                return updateLocalState
              }

              return undefined
            },
          }),
        })
      }

      return props as ReactComponentProps<F, S>
    },
    [props, localState], // eslint-disable-line react-hooks/exhaustive-deps -- keep this dependency to avoid unnecessary re-renders
  )

  return {
    props: composedProps,
    state: localState,
    updateState: updateLocalState,
  }
}
