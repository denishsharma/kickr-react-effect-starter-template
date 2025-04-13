import { Layer, ManagedRuntime } from 'effect'

/**
 * Register all the dependencies needed to run any
 * effectful program in the application runtime.
 */
export const ApplicationRuntimeDependencyLayer = Layer.empty

/**
 * The application runtime is the runtime that is used to run
 * the effectful programs in the application.
 */
export const ApplicationRuntime = ManagedRuntime.make(ApplicationRuntimeDependencyLayer)
