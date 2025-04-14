import type { Draft } from 'mutative'
import type { SchemaFromFields } from '~/core/schema/type'
import { isNullOrUndefined } from '@sindresorhus/is'
import { Effect, pipe, Schema } from 'effect'
import { create } from 'mutative'
import { useCallback, useRef, useState } from 'react'
import { toSchemaParseError } from '~/core/error/utils/error_conversion'
import { runPromise, runSync } from '~/core/runtime/runtime_execution'

interface UseComponentLocalStoreOptions<S extends Schema.Struct.Fields | undefined> {
  schema: SchemaFromFields<S>;
  initial: Schema.Schema.Encoded<SchemaFromFields<S>>;
}

/**
 * Internal hook to manage the local store of a React component.
 *
 * This hook is used to create a local store for a React component
 * and provide a way to update the store using a mutative approach.
 *
 * @param options - The options for the local store, including the schema and initial state.
 */
export default function useComponentLocalStore<S extends Schema.Struct.Fields | undefined = undefined>(options?: UseComponentLocalStoreOptions<S>) {
  const internals = useRef({
    encoded: options ? options.initial : undefined,
  })

  const [store, setStore] = useState<Schema.Schema.Type<SchemaFromFields<S>> | undefined>(
    () => Effect.gen(function* () {
      if (isNullOrUndefined(options)) { return undefined }

      return yield* Schema.decode(options.schema, { errors: 'all' })(options.initial).pipe(
        toSchemaParseError('Unexpected error occurred while decoding the initial state of the component local store.', options.initial),
      )
    }).pipe(runSync()),
  )

  const updateStore = useCallback(
    (updater: (draft: Draft<Schema.Schema.Encoded<SchemaFromFields<S>>>) => void) =>
      Effect.gen(function* () {
        if (isNullOrUndefined(store) || isNullOrUndefined(options)) { return }

        const state = yield* pipe(
          Effect.if(isNullOrUndefined(internals.current.encoded), {
            onTrue: () => Schema.encode(options.schema, { errors: 'all' })(store).pipe(
              toSchemaParseError('Unexpected error occurred while encoding the store.', store),
            ),
            onFalse: () => Effect.succeed(internals.current.encoded as Schema.Schema.Encoded<SchemaFromFields<S>>),
          }),
          Effect.map(encoded => create(encoded, updater)),
          Effect.tap((updated) => { internals.current.encoded = updated }),
          Effect.flatMap(Schema.decode(options.schema, { errors: 'all' })),
          toSchemaParseError('Unexpected error occurred while decoding the updated store.', store),
        )

        setStore(state)
      }).pipe(runPromise()),
    [options, store],
  )

  return [store, updateStore] as const
}
