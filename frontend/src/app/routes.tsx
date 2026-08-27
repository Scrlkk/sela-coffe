import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { CashSessionSkeleton } from "@/components/cash-session/CashSessionSkeleton";
import { CashierSkeleton } from "@/components/cashier/CashierSkeleton";
import { ProfileSkeleton } from "@/components/profile/ProfileSkeleton";
import { ProductSkeleton } from "@/components/product/ProductSkeleton";
import { IngredientSkeleton } from "@/components/ingredient/IngredientSkeleton";
import { CategorySkeleton } from "@/components/category/CategorySkeleton";
import { SupplierSkeleton } from "@/components/supplier/SupplierSkeleton";
import { UserSkeleton } from "@/components/user/UserSkeleton";
import { StockSkeleton } from "@/components/stock/StockSkeleton";
import { StockMovementSkeleton } from "@/components/stock-movement/StockMovementSkeleton";
import { PurchaseSkeleton } from "@/components/purchase/PurchaseSkeleton";
import {
  ProtectedRoute,
  PublicRoute,
} from "@/components/shared/ProtectedRoute";

const LoginPage = lazy(() => import("@/pages/LoginPage"));
const ProductPage = lazy(() => import("@/pages/ProductPage"));
const IngredientPage = lazy(() => import("@/pages/IngredientPage"));
const CategoryPage = lazy(() => import("@/pages/CategoryPage"));
const SupplierPage = lazy(() => import("@/pages/SupplierPage"));
const UserPage = lazy(() => import("@/pages/UserPage"));
const StockPage = lazy(() => import("@/pages/StockPage"));
const StockMovementPage = lazy(() => import("@/pages/StockMovementPage"));
const PurchaseOrderPage = lazy(() => import("@/pages/PurchaseOrderPage"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));
const CashSessionPage = lazy(() => import("@/pages/CashSessionPage"));
const CashierPage = lazy(() => import("@/pages/CashierPage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));
const ServerErrorPage = lazy(() => import("@/pages/ServerErrorPage"));

const pageFallback = <DashboardSkeleton />;

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
    errorElement: <ServerErrorPage />,
  },
  {
    element: <PublicRoute />,
    errorElement: <ServerErrorPage />,
    children: [
      {
        path: "/login",
        element: <LoginPage />,
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    errorElement: <ServerErrorPage />,
    children: [
      {
        element: <MainLayout />,
        children: [
          {
            path: "/dashboard",
            element: (
              <Suspense fallback={pageFallback}>
                <DashboardPage />
              </Suspense>
            ),
          },
          {
            path: "/cashier",
            element: (
              <Suspense fallback={<CashierSkeleton />}>
                <CashierPage />
              </Suspense>
            ),
          },
          {
            path: "/products",
            element: (
              <Suspense fallback={<ProductSkeleton />}>
                <ProductPage />
              </Suspense>
            ),
          },
          {
            path: "/ingredients",
            element: (
              <Suspense fallback={<IngredientSkeleton />}>
                <IngredientPage />
              </Suspense>
            ),
          },
          {
            path: "/categories",
            element: (
              <Suspense fallback={<CategorySkeleton />}>
                <CategoryPage />
              </Suspense>
            ),
          },
          {
            path: "/suppliers",
            element: (
              <Suspense fallback={<SupplierSkeleton />}>
                <SupplierPage />
              </Suspense>
            ),
          },
          {
            path: "/users",
            element: (
              <Suspense fallback={<UserSkeleton />}>
                <UserPage />
              </Suspense>
            ),
          },
          {
            path: "/stock",
            element: (
              <Suspense fallback={<StockSkeleton />}>
                <StockPage />
              </Suspense>
            ),
          },
          {
            path: "/stock-movement",
            element: (
              <Suspense fallback={<StockMovementSkeleton />}>
                <StockMovementPage />
              </Suspense>
            ),
          },
          {
            path: "/purchases",
            element: (
              <Suspense fallback={<PurchaseSkeleton />}>
                <PurchaseOrderPage />
              </Suspense>
            ),
          },
          {
            path: "/transactions",
            element: <div />,
          },
          {
            path: "/cash-sessions",
            element: (
              <Suspense fallback={<CashSessionSkeleton />}>
                <CashSessionPage />
              </Suspense>
            ),
          },
          {
            path: "/profile",
            element: (
              <Suspense fallback={<ProfileSkeleton />}>
                <ProfilePage />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}

export default AppRouter;
