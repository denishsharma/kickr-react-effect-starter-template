import type { ReactComponentProps } from '~/core/react/types/react_component'
import { Schema } from 'effect'
import ReactComponent from '~/core/react/factories/react_component'
import cn from '~/core/tailwind/cn'
import ThemeSwitcher from '~/modules/welcome/components/theme-switcher'
import EmitteryEventFragment from '~/modules/welcome/fragments/emittert-event-fragment'
import LocalStateFragment from '~/modules/welcome/fragments/local-state-fragment'
import TechnologiesFragment from '~/modules/welcome/fragments/technologies-fragment'

export const WelcomePropsSchema = Schema.Struct({
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

          <div className={'flex items-center'}>
            <a
              href={props.credits.url}
              target={'_blank'}
              rel={'noreferrer'}
              className={'size-8 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-gray-500 hover:text-gray-700 dark:text-neutral-400 dark:hover:text-neutral-200 flex items-center justify-center rounded-lg'}
              title={'Repository on GitHub'}
            >
              <span className={'icon-[tabler--brand-github] size-5'} />
            </a>
          </div>
        </div>

        <div className={'h-px bg-gray-200 dark:bg-neutral-800 will-change-transform translate-z-0'} />

        <div className={'flex flex-col'}>
          <TechnologiesFragment technologies={props.technologies} />

          <div className={'h-px bg-gray-200 dark:bg-neutral-800 will-change-transform translate-z-0'} />

          <LocalStateFragment />

          <div className={'h-px bg-gray-200 dark:bg-neutral-800 will-change-transform translate-z-0'} />

          <EmitteryEventFragment />
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
