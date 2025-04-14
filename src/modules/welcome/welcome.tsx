import type { ReactComponentProps } from '~/core/react/types/react_component'
import { Schema } from 'effect'
import ReactComponent from '~/core/react/factories/react_component'
import cn from '~/core/tailwind/cn'
import CounterButton from '~/modules/welcome/components/counter-button'
import ThemeSwitcher from '~/modules/welcome/components/theme-switcher'

const WelcomePropsSchema = Schema.Struct({
  credits: Schema.Struct({
    name: Schema.String,
    url: Schema.String,
    socials: Schema.Record({
      key: Schema.Literal('github', 'linkedin'),
      value: Schema.Struct({
        url: Schema.String,
        icon: Schema.String,
      }),
    }),
  }),
  technologies: Schema.ArrayEnsure(
    Schema.Struct({
      name: Schema.String,
      url: Schema.String,
    }),
  ),
})

const WelcomeComponent = (props: ReactComponentProps<typeof WelcomePropsSchema.fields>) => {
  return (
    <div className={'h-full overflow-hidden relative flex flex-col items-center justify-center p-4 select-none'}>
      <div className={'z-10 relative motion-translate-y-in-[30px] bg-white dark:bg-neutral-900 max-w-sm w-full rounded-xl ring ring-gray-200 dark:ring-neutral-800 flex flex-col overflow-clip shadow-[0_10px_20px_-3px_rgba(0,0,0,0.05)]'}>
        <div className={'bg-neutral-50 dark:bg-neutral-800/30 p-2 flex items-stretch justify-between'}>
          <div className={'flex gap-x-2 items-center'}>
            <div className={'bg-teal-700 size-8 rounded-lg flex items-center justify-center text-white'}>
              <span className={'icon-[tabler--brand-react] size-5.5'} />
            </div>

            <div className={'flex flex-col h-8'}>
              <span className={'text-xs font-medium'}>
                Kickr - React Starter Template
              </span>

              <a
                href={props.credits.url}
                target={'_blank'}
                rel={'noreferrer'}
                className={'text-xs text-gray-500 hover:text-gray-700 dark:text-neutral-400 dark:hover:text-neutral-200'}
              >
                By
                {' '}
                {props.credits.name}
              </a>
            </div>
          </div>
        </div>

        <div className={'h-px bg-gray-200 dark:bg-neutral-800 will-change-transform translate-z-0'} />

        <div className={'flex flex-col'}>
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

          <div className={'h-px bg-gray-200 dark:bg-neutral-800 will-change-transform translate-z-0'} />

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
                <CounterButton />
                <CounterButton defaultCount={10} />
              </div>

              <div className={'mt-3 text-xs leading-relaxed opacity-70'}>
                This counter is a using local state powered by Jotai and Effect Schema.
              </div>
            </div>
          </div>
        </div>

        <div className={'h-px bg-gray-200 dark:bg-neutral-800 will-change-transform translate-z-0'} />

        <div className={'px-2 py-1.5 bg-neutral-100/50 dark:bg-neutral-800/30 flex items-center justify-between gap-x-2'}>
          <div className={'flex items-center gap-x-1'}>
            {Object.entries(props.credits.socials).map(([key, value]) => (
              <a
                key={key}
                href={value.url}
                target={'_blank'}
                rel={'noreferrer'}
                className={'size-5 flex items-center justify-center rounded-md text-gray-500 hover:text-gray-700 dark:text-neutral-400 dark:hover:text-neutral-200'}
              >
                <span className={cn('size-4', value.icon)} />
              </a>
            ))}
          </div>

          <div className={'flex items-center gap-x-1'}>
            <a
              href={props.credits.socials.linkedin.url}
              target={'_blank'}
              rel={'noreferrer'}
              className={'text-xs font-medium bg-gradient-to-r from-teal-100 to-lime-100 dark:from-teal-900 dark:to-lime-900/50 px-1.5 py-0.5 rounded-md'}
            >
              &copy;
              {' '}
              {new Date().getFullYear()}
              {' '}
              {props.credits.name}
            </a>
          </div>
        </div>
      </div>

      <div className={'mt-4 -motion-translate-y-in-25 motion-opacity-in-0 motion-duration-300 motion-delay-75'}>
        <ThemeSwitcher />
      </div>
    </div>
  )
}

const Welcome = ReactComponent('welcome')({
  props: {
    schema: WelcomePropsSchema,
  },
  component: WelcomeComponent,
})

export default Welcome
