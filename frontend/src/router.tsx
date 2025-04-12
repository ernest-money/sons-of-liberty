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