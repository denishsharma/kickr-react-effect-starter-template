import type { ManagedRuntime, Scope } from 'effect'
import { Cause, Effect, Exit, Match, Ref } from 'effect'
import { toKnownErrorOrConvertUnknown } from '~/core/error/utils/error_conversion'
import { isTaggedError } from '~/core/error/utils/error_is'
import { ApplicationRuntime } from '~/core/runtime/runtime'
import UnexpectedRuntimeExitResultError from '~/errors/unexpected_runtime_exit_result_error'

/**
 * The context of the application runtime.
 * It has all the services that are available in the application runtime.
 */
export type C = ManagedRuntime.ManagedRuntime.Context<typeof ApplicationRuntime>

/**
 * The error type of the application runtime.
 * It has all the errors that are available in the application runtime.
 */
export type ER = ManagedRuntime.ManagedRuntime.Error<typeof ApplicationRuntime>

/**
 * Resolves the requirement of the effect.
 * It ensures that the effect has all defined dependencies resolved.
 *
 * Ensure that effect already has `Scope` as a dependency.
 */
type ResolveRequirement<T, L> = [T] extends [never] ? L : T extends L ? T : T | L
export type R = ResolveRequirement<C, Scope.Scope>

/**
 * Ensures that the effect has all of its dependencies resolved
 * before executing the effect.
 *
 * This provides only a type-level guarantee that the effect has
 * all of its dependencies resolved. It does not provide a runtime
 * guarantee that the effect has all of its dependencies resolved.
 */
export const ensureApplicationRuntimeDependencies = () => <A, E, RD extends R | never>(self: Effect.Effect<A, E, RD>): Effect.Effect<A, E, RD> => self

/**
 * Handles the runtime exit result and returns the value if the exit result
 * is successful. If the exit result is a failure, it throws the error.
 *
 * If the exit result is a defect, it throws an `UnknownError`.
 */
export function handleRuntimeExitResult<A, E>(self: Exit.Exit<A, ER | E>) {
  if (Exit.isFailure(self) && Cause.isFailType(self.cause)) {
    throw self.cause.error
  }

  if (Exit.isFailure(self) && Cause.isDieType(self.cause)) {
    throw toKnownErrorOrConvertUnknown(self.cause.defect)
  }

  if (Exit.isSuccess(self)) {
    return self.value
  }

  throw new UnexpectedRuntimeExitResultError({ result: self })
}

/**
 * Wraps the effectful program in a managed runtime.
 *
 * It ensures that the effectful program is managed
 * and all of its dependencies are resolved.
 *
 * It also logs any errors that occur during the processing
 * of the content.
 */
export function manageEffect<A, E>(self: Effect.Effect<A, E, Exclude<R, Scope.Scope>>) {
  return self.pipe(
    /**
     * Tap into the effectful program to log any
     * errors that occur during the processing
     * of the content.
     */
    Effect.tapErrorCause(cause => Effect.gen(function* () {
      const causeRef = yield* Ref.make<Cause.Cause<unknown>>(cause)

      /**
       * Convert defects to failures.
       */
      yield* Ref.set(causeRef, Cause.fail((cause as Cause.Die).defect)).pipe(
        Effect.when(() => Cause.isDieType(cause)),
      )

      const fail = (yield* causeRef.get) as Cause.Fail<unknown>

      yield* Match.value(fail.error).pipe(
        Match.when(
          isTaggedError<string, any>(),
          error => Effect.sync(() => {
            console.error(
              `[effectful] ${error.toString()}`,
              '\n',
              error.toJSON(),
              '\n',
              error.stack,
            )
          }),
        ),
        Match.orElse(
          Effect.fn(function* (error: unknown) {
            const err = toKnownErrorOrConvertUnknown(error)
            console.error(
              `[effectful] ${err.toString()}`,
              '\n',
              err.toJSON(),
              '\n',
              err.stack,
            )
          }),
        ),
      )
    })),
    /**
     * Catch all defects and convert them to
     * known errors or unknown errors.
     */
    Effect.catchAllDefect(defect => Effect.fail(toKnownErrorOrConvertUnknown(defect))),
  )
}

export function scopedManageEffect<A, E>(self: Effect.Effect<A, E, R>) {
  return self.pipe(
    Effect.scoped,
    manageEffect,
  )
}

/**
 * Options to run the effectful program in the application runtime.
 */
interface RuntimeExecutionOptions {
  signal?: AbortSignal;
}

/**
 * Runs the effectful program in the application runtime.
 *
 * @param options The options to run the effectful program
 */
export function runPromise<A, E>(options?: RuntimeExecutionOptions) {
  return async (self: Effect.Effect<A, E, R>) => {
    const result = await ApplicationRuntime.runPromiseExit(scopedManageEffect(self), options)
    return handleRuntimeExitResult(result)
  }
}

/**
 * Runs the effectful program synchronously in the application runtime.
 */
export function runSync<A, E>() {
  return (self: Effect.Effect<A, E, R>) => {
    const result = ApplicationRuntime.runSyncExit(scopedManageEffect(self))
    return handleRuntimeExitResult(result)
  }
}

export function runFork<A, E>() {
  return (self: Effect.Effect<A, E, R>) => {
    return ApplicationRuntime.runFork(scopedManageEffect(self))
  }
}
