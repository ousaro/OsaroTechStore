import { Toaster } from "react-hot-toast";
import { useCallback, useState, useEffect } from "react";
import { configureModules } from "./createServices.js";
import { eventBus } from "../store/eventBus.js";
import { sessionStore } from "../store/sessionStore.js";
import { Events } from "../lib/events.js";

import { createAuthViewAdapter }     from "../features/auth/hooks/useAuth.js";
import { createProductsViewAdapter } from "../features/products/hooks/useProducts.js";
import { createUsersViewAdapter }    from "../features/users/hooks/useUsers.js";
import { createCartViewAdapter }     from "../features/cart/hooks/useCart.js";

import { Navbar }   from "../components/ui/Navbar.jsx";
import { Spinner }  from "../components/ui/Spinner.jsx";
import { Footer }   from "../components/ui/Footer.jsx";
import { ErrorBoundary, ErrorFallback } from "../components/ui/ErrorBoundary.jsx";
import { useNavigate } from "../hooks/useNavigate.js";
import { FiLock } from "react-icons/fi";
import { toastNotifier } from "../lib/toastNotifier.js";
import { getErrorMessage } from "../lib/errorUtils.js";

import { LoginPage }    from "../features/auth/pages/LoginPage.jsx";
import { RegisterPage } from "../features/auth/pages/RegisterPage.jsx";

import { HomePage }          from "../features/products/pages/HomePage.jsx";
import { ProductsPage }      from "../features/products/pages/ProductsPage.jsx";
import { ProductDetailPage } from "../features/products/pages/ProductDetailPage.jsx";

import { CartPage }     from "../features/cart/pages/CartPage.jsx";
import { CheckoutPage } from "../features/orders/pages/CheckoutPage.jsx";

import { ProfilePage, AddressPage, PasswordPage, FavoritesPage, DeleteAccountPage }
  from "../features/users/pages/ProfilePages.jsx";
import { OrdersPage } from "../features/users/pages/OrdersPage.jsx";

import { DashboardPage, ManageUsersPage, CategoriesPage, AboutPage }
  from "../features/categories/pages/AdminPages.jsx";
import { AddProductPage }
  from "../features/products/pages/AddProductPage.jsx";

const PUBLIC_ROUTES = ["/", "/login", "/register"];
const CUSTOMER_ROUTES = ["/home", "/products", "/cart", "/checkout", "/about"];
const ADMIN_HOME = "/dashboard";
const CUSTOMER_HOME = "/home";

function NotFound({ homeTo = CUSTOMER_HOME, homeLabel = "Back home" }) {
  return (
    <div className="px-6 py-20 text-center">
      <div className="text-8xl font-black leading-none text-accent">404</div>
      <p className="mt-3 text-base text-ink-muted">Page not found</p>
      <a href={`#${homeTo}`} className="mt-5 inline-block font-semibold text-accent">← {homeLabel}</a>
    </div>
  );
}

function AccessDenied() {
  return (
    <div className="px-6 py-20 text-center">
      <div className="empty-state p-0"><span className="icon"><FiLock size={30} /></span></div>
      <h2 className="font-bold">Access denied</h2>
      <p className="mt-2 text-ink-muted">You don't have permission to view this page.</p>
    </div>
  );
}

function AppShell({ modules, viewAdapters }) {
  const { path, navigate } = useNavigate();
  const { AuthProvider }    = viewAdapters.auth;
  const { ProductsProvider } = viewAdapters.products;
  const { UsersProvider }   = viewAdapters.users;
  const { CartProvider }    = viewAdapters.cart;
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState("");

  const cleanPath = path.split("?")[0];
  const segments  = cleanPath.split("/").filter(Boolean);
  const route     = "/" + segments.join("/");

  const sessionUser = sessionStore.get();
  const sessionUserId = sessionUser?.id || null;
  const sessionUserIsAdmin = Boolean(sessionUser?.admin || sessionUser?.isAdmin);
  const isPublic = PUBLIC_ROUTES.includes(route);
  const isCustomerRoute = CUSTOMER_ROUTES.includes(route) || route.startsWith("/product/");

  const loadCategories = useCallback(() => {
    if (!sessionUserId) {
      setCategories([]);
      setCategoriesError("");
      setCategoriesLoading(false);
      return () => {};
    }

    let cancelled = false;
    setCategoriesLoading(true);
    setCategoriesError("");

    modules.categories.getAllCategories()
      .then((data) => {
        if (!cancelled) setCategories(data);
      })
      .catch((error) => {
        if (!cancelled) setCategoriesError(error?.message || "Failed to load categories");
      })
      .finally(() => {
        if (!cancelled) setCategoriesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [modules.categories, sessionUserId]);

  useEffect(() => {
    return loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    if (!sessionUserId) return undefined;

    const syncCreated = (event) => {
      setCategories((current) => (
        current.some((category) => category.id === event.payload.category.id)
          ? current
          : [event.payload.category, ...current]
      ));
    };
    const syncUpdated = (event) => {
      setCategories((current) => current.map((category) => (
        category.id === event.payload.category.id ? event.payload.category : category
      )));
    };
    const syncDeleted = (event) => {
      setCategories((current) => current.filter((category) => category.id !== event.payload.id));
    };

    eventBus.subscribe(Events.CATEGORY_CREATED, syncCreated);
    eventBus.subscribe(Events.CATEGORY_UPDATED, syncUpdated);
    eventBus.subscribe(Events.CATEGORY_DELETED, syncDeleted);

    return () => {
      eventBus.unsubscribe(Events.CATEGORY_CREATED, syncCreated);
      eventBus.unsubscribe(Events.CATEGORY_UPDATED, syncUpdated);
      eventBus.unsubscribe(Events.CATEGORY_DELETED, syncDeleted);
    };
  }, [sessionUserId]);

  if (!sessionUser && !isPublic) {
    setTimeout(() => navigate("/login"), 0);
    return <Spinner full />;
  }
  if (sessionUser && (route === "/login" || route === "/register" || route === "/")) {
    setTimeout(() => navigate(sessionUserIsAdmin ? ADMIN_HOME : CUSTOMER_HOME), 0);
    return <Spinner full />;
  }
  if (sessionUserIsAdmin && isCustomerRoute) {
    setTimeout(() => navigate(ADMIN_HOME), 0);
    return <Spinner full />;
  }

  const showNav = sessionUser && !isPublic;
  const showFooter = showNav && !sessionUserIsAdmin;

  const renderPage = () => {
    switch (true) {
      case route === "/":                           return <LoginPage />; 
      case route === "/login":                      return <LoginPage />;
      case route === "/register":                   return <RegisterPage />;
      case route === "/home":                       return sessionUserIsAdmin ? <AccessDenied /> : <HomePage categories={categories} />;
      case route === "/products":                   return sessionUserIsAdmin ? <AccessDenied /> : <ProductsPage categories={categories} />;
      case route.startsWith("/product/"):           return sessionUserIsAdmin ? <AccessDenied /> : <ProductDetailPage id={segments[1]} />;
      case route === "/cart":                       return sessionUserIsAdmin ? <AccessDenied /> : <CartPage />;
      case route === "/checkout":                   return sessionUserIsAdmin ? <AccessDenied /> : <CheckoutPage ordersInputPort={modules.orders} paymentsInputPort={modules.payments} />;
      case route === "/profile":                    return <ProfilePage />;
      case route === "/profile/address":            return <AddressPage />;
      case route === "/profile/orders":             return <OrdersPage ordersInputPort={modules.orders} />;
      case route === "/profile/favorites":          return <FavoritesPage />;
      case route === "/profile/password":           return <PasswordPage />;
      case route === "/profile/delete":             return <DeleteAccountPage />;
      case route === "/dashboard":
        return sessionUserIsAdmin ? <DashboardPage ordersInputPort={modules.orders} productsInputPort={modules.products} /> : <AccessDenied />;
      case route === "/admin/products":
        return sessionUserIsAdmin ? <AddProductPage categories={categories} categoriesLoading={categoriesLoading} categoriesError={categoriesError} categoriesInputPort={modules.categories} onCategoriesChange={setCategories} onReloadCategories={loadCategories} /> : <AccessDenied />;
      case route.startsWith("/admin/edit-product/"):
        return sessionUserIsAdmin ? <AddProductPage editId={segments[2]} categories={categories} categoriesLoading={categoriesLoading} categoriesError={categoriesError} categoriesInputPort={modules.categories} onCategoriesChange={setCategories} onReloadCategories={loadCategories} /> : <AccessDenied />;
      case route === "/admin/users":
        return sessionUserIsAdmin ? <ManageUsersPage authInputPort={modules.auth} /> : <AccessDenied />;
      case route === "/admin/orders":
        return sessionUserIsAdmin ? <OrdersPage ordersInputPort={modules.orders} adminView /> : <AccessDenied />;
      case route === "/admin/categories":
        return sessionUserIsAdmin ? <CategoriesPage categoriesInputPort={modules.categories} onCategoriesChange={setCategories} /> : <AccessDenied />;
      case route === "/about":                      return sessionUserIsAdmin ? <AccessDenied /> : <AboutPage />;
      default:                                      return <NotFound homeTo={sessionUserIsAdmin ? ADMIN_HOME : CUSTOMER_HOME} homeLabel={sessionUserIsAdmin ? "Back to dashboard" : "Back home"} />;
    }
  };

  return (
    <AuthProvider>
      <UsersProvider>
        <CartProvider>
          <ProductsProvider>
            <div className="flex min-h-screen flex-col">
              {showNav && <Navbar path={path} />}
              <main className="flex-1">
                <ErrorBoundary key={route}>
                  {renderPage()}
                </ErrorBoundary>
              </main>
              {showFooter && <Footer />}
            </div>
          </ProductsProvider>
        </CartProvider>
      </UsersProvider>
    </AuthProvider>
  );
}

export function Router() {
  const [ready, setReady] = useState(false);
  const [modules, setModules] = useState(null);
  const [viewAdapters, setViewAdapters] = useState(null);
  const [fatalError, setFatalError] = useState(null);

  useEffect(() => {
    try {
      const mods = configureModules();

      const authViewAdapter = createAuthViewAdapter({
        authInputPort: mods.auth,
        eventBus,
      });
      const productsViewAdapter = createProductsViewAdapter({
        productsInputPort: mods.products,
        productReadModel:  mods.products.readModel,
      });
      const usersViewAdapter = createUsersViewAdapter({
        usersInputPort: mods.users,
        sessionStore,
        eventBus,
      });
      const cartViewAdapter = createCartViewAdapter({
        cartInputPort: mods.cart,
        eventBus,
      });

      setModules(mods);
      setViewAdapters({
        auth:     authViewAdapter,
        products: productsViewAdapter,
        users:    usersViewAdapter,
        cart:     cartViewAdapter,
      });
      setReady(true);
    } catch (error) {
      setFatalError(error);
      setReady(true);
    }
  }, []);

  useEffect(() => {
    const notifyUnhandled = (event) => {
      const error = event.reason || event.error;
      setFatalError(error || "Something went wrong");
      toastNotifier.error(getErrorMessage(error));
      if (process.env.NODE_ENV === "production") event.preventDefault?.();
    };

    window.addEventListener("unhandledrejection", notifyUnhandled);
    window.addEventListener("error", notifyUnhandled);

    return () => {
      window.removeEventListener("unhandledrejection", notifyUnhandled);
      window.removeEventListener("error", notifyUnhandled);
    };
  }, []);

  if (!ready) return <Spinner full />;

  if (fatalError) {
    return (
      <>
        <ErrorFallback
          error={fatalError}
          title="The app ran into a problem."
          fallback="Something unexpected happened. You can retry the current page or go back to a safe start."
          onRetry={() => {
            setFatalError(null);
            window.location.reload();
          }}
        />
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#0d0e14", color: "#fff",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14, fontWeight: 500,
              borderRadius: 10, padding: "12px 18px",
            },
            success: { iconTheme: { primary: "#22c55e", secondary: "#fff" } },
            error:   { iconTheme: { primary: "#d10024", secondary: "#fff" } },
          }}
        />
      </>
    );
  }

  return (
    <>
      <ErrorBoundary>
        <AppShell modules={modules} viewAdapters={viewAdapters} />
      </ErrorBoundary>
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#0d0e14", color: "#fff",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14, fontWeight: 500,
            borderRadius: 10, padding: "12px 18px",
          },
          success: { iconTheme: { primary: "#22c55e", secondary: "#fff" } },
          error:   { iconTheme: { primary: "#d10024", secondary: "#fff" } },
        }}
      />
    </>
  );
}
