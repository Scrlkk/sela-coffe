/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { CashSessionSkeleton } from "@/components/cash-session/CashSessionSkeleton";
import { CashierSkeleton } from "@/components/cashier/CashierSkeleton";
import { ProfileSkeleton } from "@/components/profile/ProfileSkeleton";
import {
  ProtectedRoute,
  PublicRoute,
} from "@/components/shared/ProtectedRoute";

const LoginPage = lazy(() => import("@/pages/LoginPage"));
const ProductPage = lazy(() => import("@/pages/ProductPage"));
const ProductSkeleton = lazy(
  () => import("@/components/product/ProductSkeleton"),
);
const IngredientPage = lazy(() => import("@/pages/IngredientPage"));
const IngredientSkeleton = lazy(
  () => import("@/components/ingredient/IngredientSkeleton"),
);
const CategoryPage = lazy(() => import("@/pages/CategoryPage"));
const CategorySkeleton = lazy(
  () => import("@/components/category/CategorySkeleton"),
);
const SupplierPage = lazy(() => import("@/pages/SupplierPage"));
const SupplierSkeleton = lazy(
  () => import("@/components/supplier/SupplierSkeleton"),
);
const UserPage = lazy(() => import("@/pages/UserPage"));
const UserSkeleton = lazy(() => import("@/components/user/UserSkeleton"));
const StockPage = lazy(() => import("@/pages/StockPage"));
const StockSkeleton = lazy(() => import("@/components/stock/StockSkeleton"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));
const CashSessionPage = lazy(() => import("@/pages/CashSessionPage"));
const CashierPage = lazy(() => import("@/pages/CashierPage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));
const ServerErrorPage = lazy(() => import("@/pages/ServerErrorPage"));

const pageFallback = <DashboardSkeleton />;

export const router = createBrowserRouter([
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
            element: <div />,
          },
          {
            path: "/purchases",
            element: <div />,
          },
          {
            path: "/purchases/receive",
            element: <div />,
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
