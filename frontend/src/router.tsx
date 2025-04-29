import {
  createRootRouteWithContext,
  createRoute,
  createRouter,
  RouterProvider as TanStackRouterProvider,
  Outlet,
  redirect
} from '@tanstack/react-router';
import { RootLayout } from '@/layouts/root';
import AuthPage from './app/auth/page';
import { Dashboard } from './app/dashboard/page';
import { WalletSection } from './app/wallet/page';
import { CreateContractType } from './app/create/contract-type';
import { ActiveContracts } from './app/contracts/active';
import { ClosedContracts } from './app/contracts/closed';
import { OfferList } from './components/offer-list';
import { Transactions } from './app/wallet/transactions';
import { Utxos } from './app/wallet/utxos';
import { OfferPage } from './app/offers/offer-page';
import { Contracts } from './app/contracts/page';
import { ContractPage } from './app/contracts/contract';
import { AccountPage } from './app/account/page';
import { CreateContract } from './app/create/page';
import { MarketPage } from './app/market/page';
import { CounterpartiesPage } from './app/counterparties/page';
import { FinishProfilePage } from './app/account/finish';
import type { AuthContextType } from '@/hooks/useAuth';
import { ProtectedLayout } from '@/layouts/layout';
import { LoadingSpinner } from '@/components/ui/loading';

// Define Router Context
interface RouterContext {
  auth: AuthContextType;
}

// Create the root route with context
const rootRoute = createRootRouteWithContext<RouterContext>()({
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

// Pending component to show while checking auth
const PendingAuthentication = () => (
  <ProtectedLayout>
    <div className="flex h-full w-full items-center justify-center">
      <LoadingSpinner />
    </div>
  </ProtectedLayout>
);

// Create a parent route for authenticated routes using beforeLoad
const authenticatedParentRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'authenticated',
  beforeLoad: ({ context, location }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href,
        },
        replace: true
      });
    }
    if (context.auth.isAuthenticated && context.auth.user && !context.auth.user.nostr_profile && location.pathname !== '/account/finish') {
      throw redirect({
        to: '/account/finish',
        replace: true
      })
    }
  },
  pendingComponent: PendingAuthentication,
  component: () => (
    <ProtectedLayout>
      <Outlet />
    </ProtectedLayout>
  )
});

export const createContractRoute = createRoute({
  getParentRoute: () => authenticatedParentRoute,
  path: '/create',
  component: CreateContract,
});

export type CreateContractTypeParams = {
  contractType: "parlay" | "price-feed" | "enumeration";
}

export const createContractTypeRoute = createRoute({
  getParentRoute: () => authenticatedParentRoute,
  path: '/create/$contractType',
  component: CreateContractType,
});

export const contractsRoute = createRoute({
  getParentRoute: () => authenticatedParentRoute,
  path: '/contracts',
  component: Contracts,
});

export const contractRoute = createRoute({
  getParentRoute: () => authenticatedParentRoute,
  path: '/contracts/$contractId',
  component: ContractPage,
});

export const activeContractsRoute = createRoute({
  getParentRoute: () => authenticatedParentRoute,
  path: '/contracts/active',
  component: ActiveContracts,
});

export const closedContractsRoute = createRoute({
  getParentRoute: () => authenticatedParentRoute,
  path: '/contracts/closed',
  component: ClosedContracts,
});

export const marketRoute = createRoute({
  getParentRoute: () => authenticatedParentRoute,
  path: '/market',
  component: MarketPage,
});

export const counterpartiesRoute = createRoute({
  getParentRoute: () => authenticatedParentRoute,
  path: '/counterparties',
  component: CounterpartiesPage,
});

const offersRoute = createRoute({
  getParentRoute: () => authenticatedParentRoute,
  path: '/offers',
  component: OfferList,
});

export const offerRoute = createRoute({
  getParentRoute: () => authenticatedParentRoute,
  path: '/offers/$offerId',
  component: OfferPage,
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
  path: '/wallet/transactions',
  component: Transactions,
});

const utxosRoute = createRoute({
  getParentRoute: () => authenticatedParentRoute,
  path: '/wallet/utxos',
  component: Utxos,
});

export const accountRoute = createRoute({
  getParentRoute: () => authenticatedParentRoute,
  path: '/account',
  component: AccountPage,
});

// Add the finish profile route
const finishProfileRoute = createRoute({
  getParentRoute: () => authenticatedParentRoute,
  path: '/account/finish',
  component: FinishProfilePage,
});

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
    counterpartiesRoute,
    marketRoute,
    createContractRoute,
    createContractTypeRoute,
    contractsRoute,
    contractRoute,
    activeContractsRoute,
    closedContractsRoute,
    offersRoute,
    offerRoute,
    transactionsRoute,
    utxosRoute,
    accountRoute,
    finishProfileRoute,
  ]),
  notFoundRoute,
]);

// Create the router, initialize context (auth will be populated by RouterProvider)
const router = createRouter({
  routeTree,
  context: {
    auth: undefined!,
  }
});

// Register the router for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
    routerContext: RouterContext;
  }
}

// Export the RouterProvider component - NOTE: Context should be passed where this is USED
// This export might be removed if RouterProvider is only used in main.tsx/App.tsx
export function RouterProvider({ auth }: { auth: AuthContextType }) {
  // Create a router instance with the provided auth context
  const router = createRouter({
    routeTree,
    context: {
      auth,
    },
    defaultPreload: 'intent',
  });

  return <TanStackRouterProvider router={router} />;
}

// Keep the router export for type registration
export default router; 