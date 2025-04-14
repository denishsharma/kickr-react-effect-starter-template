import type { Effect } from 'effect'
import type { R } from '~/core/runtime/runtime_execution'

export type EventHandlerFunction<A = never, E = never> = (data: [A] extends [never] ? void : A) => Effect.Effect<void, E, R>

export interface EventHandlerOptions<O extends boolean = false> {
  id?: string;
  once?: O;
}

export type EventHandlerParameters<A = never, E = never, O extends boolean = false> = [
  handler: EventHandlerFunction<A, E>,
  options?: EventHandlerOptions<O>,
]
