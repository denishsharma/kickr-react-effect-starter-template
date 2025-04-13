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
    },
  ],
})

export default head
