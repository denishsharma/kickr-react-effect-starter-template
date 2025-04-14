import type { ReactComponentProps } from '~/core/react/types/react_component'
import { Effect, Schema } from 'effect'
import ReactComponent from '~/core/react/factories/react_component'
import broadcastCountEvent from '~/modules/welcome/events/broadcast_count_event'

const EmitteryEventFragmentLocalStateSchema = Schema.Struct({
  counter: Schema.Struct({
    one: Schema.Number,
    two: Schema.Number,
  }),
})

const EmitteryEventFragmentComponent = (props: ReactComponentProps<undefined, typeof EmitteryEventFragmentLocalStateSchema.fields>) => {
  broadcastCountEvent.useEvent(
    Effect.fn(function* (data) {
      props.state.update((draft) => {
        if (data.id === 'counter_one') {
          draft.counter.one = data.count
        } else if (data.id === 'counter_two') {
          draft.counter.two = data.count
        }
      })
    }),
  )

  return (
    <div className={'px-2.5 py-2.5'}>
      <div className={'flex flex-col gap-y-px mb-2.5'}>
        <div className={'text-sm font-medium'}>
          Emittery Event
        </div>
        <p className={'pr-6 text-xs leading-snug opacity-70'}>
          Simple example of global event handling using Emittery without needing to pass props.
        </p>
      </div>

      <div className={'px-2.5 py-2 rounded-lg flex flex-col ring ring-inset ring-neutral-200 dark:ring-neutral-800 bg-neutral-200/50 dark:bg-neutral-800/50'}>
        <div className={'text-xs leading-relaxed opacity-70'}>
          The count values of the above two counters are
          {' '}
          <span className={'font-semibold'}>{props.state.value.counter.one}</span>
          {' '}
          and
          {' '}
          <span className={'font-semibold'}>{props.state.value.counter.two}</span>
          {' '}
          respectively.
        </div>
      </div>
    </div>
  )
}

const EmitteryEventFragment = ReactComponent('welcome/fragment/emittery_event')({
  props: {
    schema: Schema.Struct({}),
  },
  state: {
    schema: EmitteryEventFragmentLocalStateSchema,
    initial: {
      counter: {
        one: 0,
        two: 0,
      },
    },
  },
  component: EmitteryEventFragmentComponent,
})

export default EmitteryEventFragment
