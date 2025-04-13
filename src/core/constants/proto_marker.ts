/* eslint-disable ts/naming-convention */

/**
 * A unique symbol used to represent internal properties.
 *
 * This marker helps distinguish internal structures, ensuring they are not
 * unintentionally accessed or modified.
 */
export const _internals: unique symbol = Symbol('@marker/proto/internals')

/**
 * A unique symbol used to represent the type or category of an object.
 *
 * This marker allows for reliable type differentiation and identification
 * across various components.
 */
export const _kind: unique symbol = Symbol('@marker/proto/kind')
