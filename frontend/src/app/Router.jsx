/**
 * APP — Router
 *
 * This is the frontend equivalent of createApp.js in the backend.
 * It receives already-wired module input ports and:
 *   1. Creates view adapters (React context providers) from each module
 *   2. Registers route → page mappings
 *   3. Renders the provider tree
 *
 * It does NOT know about repositories, HTTP, or event wiring.
 * That all lives in configureModules.js (the composition root).
 */
import { Toaster } from "react-hot-toast";
import { useState, useEffect } from "react";
import { configureModules } from "../infrastructure/bootstrap/configureModules.js";
import { eventBus } from "../infrastructure/providers/events/inProcessEventBus.js";
import { sessionStore } from "../infrastructure/providers/session/sessionStore.js";

// ── View adapter factories ─────────────────────────────────────
import { createAuthViewAdapter }     from "../modules/auth/adapters/input/views/useAuthModule.js";
import { createProductsViewAdapter } from "../modules/products/adapters/input/views/useProductsModule.js";
import { createUsersViewAdapter }    from "../modules/users/adapters/input/views/useUsersModule.js";
import { createCartViewAdapter }     from "../modules/cart/adapters/input/views/useCartModule.js";

// ── Shared UI ──────────────────────────────────────────────────
import { Navbar }   from "../shared/infrastructure/ui/Navbar.jsx";
import { Spinner }  from "../shared/infrastructure/ui/Spinner.jsx";
import { Footer }   from "../shared/infrastructure/ui/Footer.jsx";
import { useNavigate } from "../shared/hooks/useNavigate.js";
import { FiLock } from "react-icons/fi";

// ── Pages — auth ───────────────────────────────────────────────
import { LoginPage }    from "../modules/auth/adapters/input/views/pages/LoginPage.jsx";
import { RegisterPage } from "../modules/auth/adapters/input/views/pages/RegisterPage.jsx";

// ── Pages — storefront ─────────────────────────────────────────
import { HomePage }          from "../modules/products/adapters/input/views/pages/HomePage.jsx";
import { ProductsPage }      from "../modules/products/adapters/input/views/pages/ProductsPage.jsx";
import { ProductDetailPage } from "../modules/products/adapters/input/views/pages/ProductDetailPage.jsx";

// ── Pages — checkout ───────────────────────────────────────────
import { CartPage }     from "../modules/cart/adapters/input/views/pages/CartPage.jsx";
import { CheckoutPage } from "../modules/orders/adapters/input/views/pages/CheckoutPage.jsx";

// ── Pages — profile ────────────────────────────────────────────
import { ProfilePage, AddressPage, PasswordPage, DeleteAccountPage }
  from "../modules/users/adapters/input/views/pages/ProfilePages.jsx";
import { OrdersPage } from "../modules/users/adapters/input/views/pages/OrdersPage.jsx";

// ── Pages — admin ──────────────────────────────────────────────
import { DashboardPage, ManageUsersPage, CategoriesPage, AboutPage }
  from "../modules/categories/adapters/input/views/pages/AdminPages.jsx";
import { AddProductPage }
  from "../modules/products/adapters/input/views/pages/AddProductPage.jsx";

// ─────────────────────────────────────────────────────────────────
const PUBLIC_ROUTES = ["/", "/login", "/register"];

function NotFound() {
  return (
    <div className="px-6 py-20 text-center">
      <div className="text-8xl font-black leading-none text-accent">404</div>
      <p className="mt-3 text-base text-ink-muted">Page not found</p>
      <a href="#/home" className="mt-5 inline-block font-semibold text-accent">← Back home</a>
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

  const cleanPath = path.split("?")[0];
  const segments  = cleanPath.split("/").filter(Boolean);
  const route     = "/" + segments.join("/");

  // We need auth state to guard routes — read it directly from session for the
  // shell-level check (the contexts handle re-renders)
  const sessionUser = sessionStore.get();
  const sessionUserId = sessionUser?.id || null;
  const isPublic = PUBLIC_ROUTES.includes(route);

  useEffect(() => {
    if (!sessionUserId) {
      setCategories([]);
      return;
    }

    let cancelled = false;
    modules.categories.getAllCategories().then((data) => {
      if (!cancelled) setCategories(data);
    });

    return () => {
      cancelled = true;
    };
  }, [modules.categories, sessionUserId]);

  if (!sessionUser && !isPublic) {
    setTimeout(() => navigate("/login"), 0);
    return <Spinner full />;
  }
  if (sessionUser && (route === "/login" || route === "/register" || route === "/")) {
    setTimeout(() => navigate("/home"), 0);
    return <Spinner full />;
  }

  const showNav = sessionUser && !isPublic;

  const renderPage = () => {
    switch (true) {
      case route === "/login":                      return <LoginPage />;
      case route === "/register":                   return <RegisterPage />;
      case route === "/home":                       return <HomePage categories={categories} />;
      case route === "/products":                   return <ProductsPage categories={categories} />;
      case route.startsWith("/product/"):           return <ProductDetailPage id={segments[1]} />;
      case route === "/cart":                       return <CartPage />;
      case route === "/checkout":                   return <CheckoutPage ordersInputPort={modules.orders} paymentsInputPort={modules.payments} />;
      case route === "/profile":                    return <ProfilePage />;
      case route === "/profile/address":            return <AddressPage />;
      case route === "/profile/orders":             return <OrdersPage ordersInputPort={modules.orders} />;
      case route === "/profile/password":           return <PasswordPage />;
      case route === "/profile/delete":             return <DeleteAccountPage />;
      case route === "/dashboard":
        return sessionUser?.admin ? <DashboardPage ordersInputPort={modules.orders} productsInputPort={modules.products} /> : <AccessDenied />;
      case route === "/admin/products":
        return sessionUser?.admin ? <AddProductPage categories={categories} /> : <AccessDenied />;
      case route.startsWith("/admin/edit-product/"):
        return sessionUser?.admin ? <AddProductPage editId={segments[2]} categories={categories} /> : <AccessDenied />;
      case route === "/admin/users":
        return sessionUser?.admin ? <ManageUsersPage authInputPort={modules.auth} /> : <AccessDenied />;
      case route === "/admin/categories":
        return sessionUser?.admin ? <CategoriesPage categoriesInputPort={modules.categories} onCategoriesChange={setCategories} /> : <AccessDenied />;
      case route === "/about":                      return <AboutPage />;
      default:                                      return <NotFound />;
    }
  };

  return (
    <AuthProvider>
      <UsersProvider>
        <CartProvider>
          <ProductsProvider>
            {showNav && <Navbar path={path} />}
            {renderPage()}
            {showNav && <Footer />}
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

  useEffect(() => {
    // Boot the composition root
    const mods = configureModules();

    // Create view adapters from module input ports
    // (mirrors how createApp.js mounts routes from already-wired route factories)
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
  }, []);

  if (!ready) return <Spinner full />;

  return (
    <>
      <AppShell modules={modules} viewAdapters={viewAdapters} />
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
