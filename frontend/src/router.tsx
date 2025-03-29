import {
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider as TanStackRouterProvider,
  Outlet
} from '@tanstack/react-router';
import { RootLayout } from '@/layouts/root';
import AuthPage from './app/auth/page';
import { AuthenticatedRoute } from '@/layouts/authenticated';
import { Dashboard } from './app/dashboard/page';
import { WalletSection } from './components/wallet-section';
import { CreateContract } from './app/create/page';
import { ActiveContracts } from './app/contracts/active';
import { ClosedContracts } from './app/contracts/closed';
import { OfferList } from './components/offer-list';
import { Transactions } from './app/wallet/transactions';
import { Utxos } from './app/wallet/utxos';

// Create the root route
const rootRoute = createRootRoute({
  component: () => (
    <RootLayout>
      <Outlet />
    </RootLayout>
  ),
});

// Public routes
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: AuthPage,
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: AuthPage,
});

// Create a parent route for authenticated routes
const authenticatedParentRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'authenticated',
  component: () => (
    <AuthenticatedRoute>
      <Outlet />
    </AuthenticatedRoute>
  )
});

export const createContractRoute = createRoute({
  getParentRoute: () => authenticatedParentRoute,
  path: '/create/$contractType',
  component: CreateContract,
});

export const contractsRoute = createRoute({
  getParentRoute: () => authenticatedParentRoute,
  path: '/contracts/active',
  component: ActiveContracts,
});

export const closedContractsRoute = createRoute({
  getParentRoute: () => authenticatedParentRoute,
  path: '/contracts/closed',
  component: ClosedContracts,
});

const offersRoute = createRoute({
  getParentRoute: () => authenticatedParentRoute,
  path: '/offers',
  component: OfferList,
});

// Protected routes using the authenticated parent route
const dashboardRoute = createRoute({
  getParentRoute: () => authenticatedParentRoute,
  path: '/',
  component: Dashboard,
});

export const walletRoute = createRoute({
  getParentRoute: () => authenticatedParentRoute,
  path: '/wallet',
  component: WalletSection,
});

const transactionsRoute = createRoute({
  getParentRoute: () => authenticatedParentRoute,
  path: '/transactions',
  component: Transactions,
});

const utxosRoute = createRoute({
  getParentRoute: () => authenticatedParentRoute,
  path: '/utxos',
  component: Utxos,
});

// export const accountRoute = createRoute({
//   getParentRoute: () => authenticatedParentRoute,
//   path: '/account',
//   component: AccountPage,
// });

const NotFoundPage = () => {
  return <div>Not Found</div>;
};

// 404 route
const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '*',
  component: NotFoundPage,
});

// Create the route tree
const routeTree = rootRoute.addChildren([
  loginRoute,
  registerRoute,
  authenticatedParentRoute.addChildren([
    dashboardRoute,
    walletRoute,
    createContractRoute,
    contractsRoute,
    closedContractsRoute,
    offersRoute,
    transactionsRoute,
    utxosRoute,
    // accountRoute,
  ]),
  notFoundRoute,
]);

// Create the router
const router = createRouter({ routeTree });

// Register the router for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

// Export the RouterProvider component
export function RouterProvider() {
  return <TanStackRouterProvider router={router} />;
}

export default router; 