import type { Effect } from 'effect'
import type { UnsubscribeFunction } from 'emittery'
import type { R } from '~/core/runtime/runtime_execution'

export type EventHandlerFunction<A = never, E = never> = (data: [A] extends [never] ? void : A, unsubscribe: UnsubscribeFunction) => Effect.Effect<void, E, R>

export interface EventHandlerOptions {
  id?: string;
}

export type EventHandlerParameters<A = never, E = never> = [
  handler: EventHandlerFunction<A, E>,
  options?: EventHandlerOptions,
]
