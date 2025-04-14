import { createFileRoute } from '@tanstack/react-router'
import Welcome from '~/modules/welcome/welcome'

export const Route = createFileRoute('/')({
  component: RootPage,
})

function RootPage() {
  return (
    <Welcome
      credits={{
        name: 'Denish Sharma',
        url: 'https://github.com/denishsharma/kickr-react-effect-starter-template',
        socials: {
          github: {
            url: 'https://github.com/denishsharma',
            icon: 'icon-[tabler--brand-github]',
          },
          linkedin: {
            url: 'https://www.linkedin.com/in/denishsharma',
            icon: 'icon-[tabler--brand-linkedin]',
          },
        },
      }}
      technologies={[
        { name: 'React', url: 'https://react.dev/' },
        { name: 'Effect', url: 'https://effect.website/' },
        { name: 'Jotai', url: 'https://jotai.org/' },
        { name: 'TanStack Router', url: 'https://tanstack.com/router/' },
        { name: 'Tailwind CSS', url: 'https://tailwindcss.com/' },
        { name: 'Iconify', url: 'https://iconify.design/' },
        { name: 'Unhead', url: 'https://unhead.unjs.io/' },
        { name: 'Emittery', url: 'https://github.com/sindresorhus/emittery' },
        { name: 'Vite', url: 'https://vite.dev/' },
      ]}
    />
  )
}
