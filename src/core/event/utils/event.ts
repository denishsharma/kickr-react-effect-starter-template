import type { IEmitteryEvent } from '~/core/event/factories/emittery_event'
import type { EventHandlerParameters } from '~/core/event/types/event'
import { runPromise } from '~/core/runtime/runtime_execution'

/**
 * Dispatches an event with the given data.
 *
 * @param event - The event to be dispatched.
 */
export function dispatchEmitteryEvent<T extends string, A = never, I = never>(event: IEmitteryEvent<T, A, I>) {
  /**
   * @param data - The data to be dispatched with the event.
   */
  return (data: [I] extends [never] ? void : I) => {
    const EventClass = event
    const eventInstance = new EventClass()

    return eventInstance.dispatch(data).pipe(runPromise())
  }
}

/**
 * Handles an event with the given data.
 *
 * @param event - The event to be handled.
 */
export function handleEmitteryEvent<T extends string, A = never, I = never>(event: IEmitteryEvent<T, A, I>) {
  /**
   * @param handler - The handler function to be called when the event is dispatched.
   * @param options - The options for the handler.
   */
  return <E = never, O extends boolean = false>(...args: EventHandlerParameters<A, E, O>) => {
    const EventClass = event
    const eventInstance = new EventClass()

    return eventInstance.handle(...args).pipe(runPromise())
  }
}

/**
 * React hook to use an event with the handler function.
 *
 * @param event - The event to be used.
 * @param handler - The handler function to be called when the event is dispatched.
 * @param options - The options for the handler.
 */
export function useEmitteryEvent<T extends string, A = never, I = never, E = never, O extends boolean = false>(event: IEmitteryEvent<T, A, I>, ...args: EventHandlerParameters<A, E, O>) {
  const EventClass = event
  const eventInstance = new EventClass()

  return eventInstance.useEvent(...args)
}
