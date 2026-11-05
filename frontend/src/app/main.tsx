import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "../index.css";
import PublicLayout from "./PublicLayout";
import ErrorBoundary from "../components/ErrorBoundary";
import HomePage from "../pages/HomePage";
import LandingPage from "../pages/LandingPage";
import CategoryPage from "../pages/CategoryPage";
import NotFoundPage from "../pages/NotFoundPage";
import AdminLayout from "../admin/AdminLayout";
import LoginPage from "../admin/LoginPage";
import ProductsAdminPage from "../admin/ProductsAdminPage";
import OrdersAdminPage from "../admin/OrdersAdminPage";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/c/:slug" element={<CategoryPage />} />
            <Route path="/p/:slug" element={<LandingPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
          <Route path="/admin/login" element={<LoginPage />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<ProductsAdminPage />} />
            <Route path="ordenes" element={<OrdersAdminPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
);
