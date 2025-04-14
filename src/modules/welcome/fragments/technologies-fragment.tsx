import type { ReactComponentProps } from '~/core/react/types/react_component'
import { Schema } from 'effect'
import ReactComponent from '~/core/react/factories/react_component'

const TechnologiesFragmentProps = Schema.Struct({
  technologies: Schema.ArrayEnsure(
    Schema.Struct({
      name: Schema.String,
      url: Schema.String,
    }),
  ),
})

const TechnologiesFragmentComponent = (props: ReactComponentProps<typeof TechnologiesFragmentProps.fields>) => {
  return (
    <div className={'px-2.5 py-3 flex flex-col gap-y-1'}>
      <div className={'text-xs font-medium text-gray-700 dark:text-neutral-200'}>
        Technologies
      </div>

      <div className={'flex flex-row gap-x-1 gap-y-1.5 flex-wrap mt-1 pr-6'}>
        {props.technologies.map(technology => (
          <a
            href={technology.url}
            target={'_blank'}
            rel={'noreferrer'}
            className={'text-[11px] font-normal bg-neutral-200 dark:bg-neutral-700 hover:text-white hover:bg-teal-800 px-1.5 py-px rounded-md'}
            key={technology.name}
          >
            {technology.name}
          </a>
        ))}
      </div>
    </div>
  )
}

const TechnologiesFragment = ReactComponent('welcome/fragment/technologies')({
  props: {
    schema: TechnologiesFragmentProps,
  },
  component: TechnologiesFragmentComponent,
})

export default TechnologiesFragment
