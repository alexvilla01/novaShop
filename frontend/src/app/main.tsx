import { StrictMode, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "../index.css";
import PublicLayout from "./PublicLayout";
import ProductLayout from "./ProductLayout";
import ErrorBoundary from "../components/ErrorBoundary";
import HomePage from "../pages/HomePage";
import LandingPage from "../pages/LandingPage";
import CategoryPage from "../pages/CategoryPage";
import NotFoundPage from "../pages/NotFoundPage";

const AdminLayout = lazy(() => import("../admin/AdminLayout"));
const LoginPage = lazy(() => import("../admin/LoginPage"));
const ProductsAdminPage = lazy(() => import("../admin/ProductsAdminPage"));
const OrdersAdminPage = lazy(() => import("../admin/OrdersAdminPage"));

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/c/:slug" element={<CategoryPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
          <Route element={<ProductLayout />}>
            <Route path="/p/:slug" element={<LandingPage />} />
          </Route>
          <Route
            path="/admin/login"
            element={
              <Suspense fallback={null}>
                <LoginPage />
              </Suspense>
            }
          />
          <Route
            path="/admin/*"
            element={
              <Suspense fallback={null}>
                <AdminLayout>
                  <Routes>
                    <Route index element={<ProductsAdminPage />} />
                    <Route path="ordenes" element={<OrdersAdminPage />} />
                  </Routes>
                </AdminLayout>
              </Suspense>
            }
          />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
);
