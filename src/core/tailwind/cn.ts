import type { CnOptions } from 'tailwind-variants'
import { cn as className } from 'tailwind-variants'

const cn = <T extends CnOptions>(...args: T) => className(...args)({}) as string

export default cn
