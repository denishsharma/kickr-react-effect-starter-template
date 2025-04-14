import type { ReactComponentProps } from '~/core/react/types/react_component'
import { Schema } from 'effect'
import { useEffect } from 'react'
import ReactComponent from '~/core/react/factories/react_component'
import { runPromise } from '~/core/runtime/runtime_execution'
import broadcastCountEvent from '~/modules/welcome/events/broadcast_count_event'

const CounterButtonPropsSchema = Schema.Struct({
  id: Schema.Literal('counter_one', 'counter_two'),
  defaultCount: Schema.optionalWith(Schema.Number, { nullable: true, default: () => 0 }),
})

const CounterButtonLocalStateSchema = Schema.Struct({
  count: Schema.Number,
})

const CounterButtonComponent = (props: ReactComponentProps<typeof CounterButtonPropsSchema.fields, typeof CounterButtonLocalStateSchema.fields>) => {
  useEffect(() => {
    const timeout = setTimeout(() => {
      broadcastCountEvent.dispatch({
        id: props.id,
        count: props.state.value.count,
      }).pipe(runPromise())
    })

    return () => {
      clearTimeout(timeout)
    }
  }, [props.state.value.count]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <button
      type={'button'}
      className={'bg-white dark:bg-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-700/50 text-sm w-full h-8 rounded-lg px-3 cursor-pointer ring ring-inset ring-gray-200 dark:ring-neutral-700/50'}
      onClick={() => {
        props.state.update((draft) => {
          draft.count += 1
        })
      }}
    >
      Count is
      {' '}
      {props.state.value.count}
    </button>
  )
}

const CounterButton = ReactComponent('welcome/counter_button')({
  props: {
    schema: CounterButtonPropsSchema,
  },
  state: {
    schema: CounterButtonLocalStateSchema,
    initial: (props) => {
      return {
        count: props.defaultCount,
      }
    },
  },
  component: CounterButtonComponent,
})

export default CounterButton
