import { Schema } from 'effect'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import ReactComponent from '~/core/react/factories/react_component'
import cn from '~/core/tailwind/cn'
import useThemeSwitcher, { ApplicationTheme } from '~/hooks/use_theme_switcher'

const APPLICATION_THEME_CHOICE = [
  {
    id: 'light',
    icon: 'icon-[lucide--sun]',
    theme: ApplicationTheme.LIGHT,
  },
  {
    id: 'dark',
    icon: 'icon-[lucide--moon]',
    theme: ApplicationTheme.DARK,
  },
  {
    id: 'system',
    icon: 'icon-[lucide--laptop]',
    theme: ApplicationTheme.SYSTEM,
  },
]

const ThemeSwitcherComponent = () => {
  const { theme, setTheme } = useThemeSwitcher()
  const [mounted, setMounted] = useState(false)

  const buttonRef = useRef<Record<ApplicationTheme, HTMLButtonElement>>({} as Record<ApplicationTheme, HTMLButtonElement>)
  const [buttonUnderlineWidth, setButtonUnderlineWidth] = useState(0)
  const [buttonUnderlineLeft, setButtonUnderlineLeft] = useState(0)

  useLayoutEffect(() => {
    const button = buttonRef.current[theme]
    if (button) {
      setButtonUnderlineWidth(button.clientWidth)
      setButtonUnderlineLeft(button.offsetLeft)
    }
  }, [theme])

  useEffect(() => {
    if (mounted) { return }
    const timeout = setTimeout(() => {
      setMounted(true)
    })

    return () => {
      clearTimeout(timeout)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps -- this should only run once

  return (
    <div className={'bg-white dark:bg-neutral-900 relative flex items-center gap-x-0.5 p-1 ring ring-inset ring-gray-200 dark:ring-neutral-800 rounded-full'}>
      <span
        className={cn('absolute bottom-0 top-0 flex items-center justify-center overflow-hidden rounded-full', mounted && 'transition-all duration-300')}
        style={{ left: buttonUnderlineLeft, width: buttonUnderlineWidth }}
      >
        <span className={'size-7 rounded-full bg-neutral-200 dark:bg-neutral-800'} />
      </span>

      {APPLICATION_THEME_CHOICE.map(themeChoice => (
        <button
          key={themeChoice.id}
          type={'button'}
          ref={(el) => { buttonRef.current[themeChoice.theme] = el as HTMLButtonElement }}
          className={'outline-none flex items-center justify-center bg-transparent dark:text-neutral-400 size-7 cursor-pointer transition rounded-full'}
          onClick={() => {
            setTheme(themeChoice.theme)
          }}
        >
          <span className={cn('size-4', themeChoice.icon)} />
        </button>
      ))}
    </div>
  )
}

const ThemeSwitcher = ReactComponent('welcome/theme_switcher')({
  props: {
    schema: Schema.Struct({}),
  },
  component: ThemeSwitcherComponent,
})

export default ThemeSwitcher
