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
            element: <div />,
          },
          {
            path: "/categories",
            element: <div />,
          },
          {
            path: "/suppliers",
            element: <div />,
          },
          {
            path: "/users",
            element: <div />,
          },
          {
            path: "/stock",
            element: <div />,
          },
          {
            path: "/stock-movement",
            element: <div />,
          },
          {
            path: "/stock-adjustment",
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
