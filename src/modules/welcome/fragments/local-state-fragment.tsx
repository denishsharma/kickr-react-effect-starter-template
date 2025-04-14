import { Schema } from 'effect'
import ReactComponent from '~/core/react/factories/react_component'
import CounterButton from '~/modules/welcome/components/counter-button'

const LocalStateFragmentComponent = () => {
  return (
    <div className={'px-2.5 py-2.5'}>
      <div className={'flex flex-col gap-y-px mb-2.5'}>
        <div className={'text-sm font-medium'}>
          Local State
        </div>
        <p className={'pr-6 text-xs leading-snug opacity-70'}>
          Counter example using local state powered by Jotai and Effect Schema for props and state validation.
        </p>
      </div>

      <div className={'p-2.5 rounded-lg flex flex-col items-center text-center ring ring-inset ring-neutral-200 dark:ring-neutral-800 bg-neutral-200/50 dark:bg-neutral-800/50'}>
        <div className={'grid grid-cols-2 gap-2 w-full'}>
          <CounterButton id={'counter_one'} />
          <CounterButton id={'counter_two'} defaultCount={10} />
        </div>

        <div className={'mt-3 text-xs leading-relaxed opacity-70'}>
          This counter is a using local state powered by Jotai and Effect Schema.
        </div>
      </div>
    </div>
  )
}

const LocalStateFragment = ReactComponent('welcome/fragment/local_state')({
  props: {
    schema: Schema.Struct({}),
  },
  component: LocalStateFragmentComponent,
})

export default LocalStateFragment
