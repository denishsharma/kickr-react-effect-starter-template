import { createRouter } from '@tanstack/react-router'
import { routeTree } from '~/../.generated/routeTree.gen'
import RouteNotFoundPage from '~/core/router/pages/route-not-found-page'

const router = createRouter({
  routeTree,
  defaultNotFoundComponent: RouteNotFoundPage,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default router
