import type { Schema } from 'effect'
import type { Draft } from 'mutative'
import type { SchemaFromFields } from '~/core/schema/type'

/**
 * Props type for the component without the local state.
 *
 * This type is used when the component does not have a local state.
 */
export type ReactComponentPropsWithoutLocalState<F extends Schema.Struct.Fields | undefined = undefined> = Schema.Schema.Type<SchemaFromFields<F>>

/**
 * Props type for the component with the local state.
 *
 * This type is used when the component has a local state.
 */
export type ReactComponentPropsWithLocalState<
  F extends Schema.Struct.Fields | undefined = undefined,
  S extends Schema.Struct.Fields | undefined = undefined,
> =
  & Schema.Schema.Type<SchemaFromFields<F>>
  & { state: { readonly value: Schema.Schema.Type<SchemaFromFields<S>>; update: (updater: (draft: Draft<Schema.Schema.Encoded<SchemaFromFields<S>>>) => void) => void } }

export type ReactComponentProps<
  F extends Schema.Struct.Fields | undefined = undefined,
  S extends Schema.Struct.Fields | undefined = undefined,
> = S extends undefined ? ReactComponentPropsWithoutLocalState<F> : ReactComponentPropsWithLocalState<F, S>
