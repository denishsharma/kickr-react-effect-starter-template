import { createHead } from '@unhead/react/client'

const head = createHead({
  init: [
    {
      htmlAttrs: {
        lang: 'en',
      },
      title: 'Kickr - React Starter Template',
      titleTemplate(title) {
        return title ? `${title} - Kickr` : 'Kickr'
      },
      link: [
        {
          rel: 'preconnect',
          href: 'https://rsms.me/',
        },
        {
          rel: 'stylesheet',
          href: 'https://rsms.me/inter/inter.css',
        },
      ],
    },
  ],
})

export default head
