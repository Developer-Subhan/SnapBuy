import React, { useEffect, useState } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { ErrorProvider } from "./ErrorContext.jsx";
import Homepage from "./Homepage.jsx";
import ProductDetailPage from "./ProductDetailPage.jsx";
import SearchResult from "./SearchResult.jsx";
import Loader from "./Loader.jsx";
import ErrorPage from "./ErrorPage.jsx";
import NotFound from "./NotFound.jsx";
import AuthForm from "./AuthForm.jsx";
import Checkout from "./Checkout.jsx";
import AdminDashboard from "./AdminDashboard.jsx";
import AddNewForm from "./AddNewForm.jsx";
import EditForm from "./EditForm.jsx";
import OrderSuccess from "./OrderSuccess.jsx";
import OrderStatusTracker from "./OrderStatusTracker.jsx";

const ProtectedRoute = ({ children, user, requiredUsername, isLoading }) => {
  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader />
      </div>
    );

  if (!user || (requiredUsername && user.username !== requiredUsername)) {
    return <Navigate to="/404" replace />;
  }
  return children;
};

function App() {
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    async function fetchAuth() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/check-auth`, {
          credentials: "include",
        });
        const data = await res.json();
        setUser(data.user || null);
      } catch (err) {
        setUser(null);
      } finally {
        setIsAuthLoading(false);
      }
    }
    fetchAuth();
  }, []);

  const router = createBrowserRouter([
    {
      element: <ErrorProvider />,
      errorElement: <ErrorPage />,
      children: [
        { path: "/", element: <Homepage /> },
        { path: "/products", element: <SearchResult.jsx /> },
        { path: "/products/:id", element: <ProductDetailPage /> },
        { path: "/auth", element: <AuthForm /> },
        { path: "/order-success", element: <OrderSuccess /> },
        { path: "/track-order", element: <OrderStatusTracker /> },
        {
          path: "/checkout",
          element: (
            <ProtectedRoute user={user} isLoading={isAuthLoading}>
              <Checkout />
            </ProtectedRoute>
          ),
        },
        {
          path: "/dashboard",
          element: (
            <ProtectedRoute
              user={user}
              requiredUsername="admin"
              isLoading={isAuthLoading}
            >
              <AdminDashboard />
            </ProtectedRoute>
          ),
        },
        {
          path: "/products/new",
          element: (
            <ProtectedRoute
              user={user}
              requiredUsername="admin"
              isLoading={isAuthLoading}
            >
              <AddNewForm />
            </ProtectedRoute>
          ),
        },
        {
          path: "/products/edit/:id",
          element: (
            <ProtectedRoute
              user={user}
              requiredUsername="admin"
              isLoading={isAuthLoading}
            >
              <EditForm />
            </ProtectedRoute>
          ),
        },
        { path: "/404", element: <NotFound /> },
        { path: "*", element: <NotFound /> },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;