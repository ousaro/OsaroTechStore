import { Toaster } from "react-hot-toast";
import { useState, useEffect } from "react";
import { configureModules } from "./createServices.js";
import { eventBus } from "../store/eventBus.js";
import { sessionStore } from "../store/sessionStore.js";

// ── View adapter factories ─────────────────────────────────────
import { createAuthViewAdapter }     from "../features/auth/hooks/useAuth.js";
import { createProductsViewAdapter } from "../features/products/hooks/useProducts.js";
import { createUsersViewAdapter }    from "../features/users/hooks/useUsers.js";
import { createCartViewAdapter }     from "../features/cart/hooks/useCart.js";

// ── Shared UI ──────────────────────────────────────────────────
import { Navbar }   from "../components/ui/Navbar.jsx";
import { Spinner }  from "../components/ui/Spinner.jsx";
import { Footer }   from "../components/ui/Footer.jsx";
import { useNavigate } from "../hooks/useNavigate.js";
import { FiLock } from "react-icons/fi";

// ── Pages — auth ───────────────────────────────────────────────
import { LoginPage }    from "../features/auth/pages/LoginPage.jsx";
import { RegisterPage } from "../features/auth/pages/RegisterPage.jsx";

// ── Pages — storefront ─────────────────────────────────────────
import { HomePage }          from "../features/products/pages/HomePage.jsx";
import { ProductsPage }      from "../features/products/pages/ProductsPage.jsx";
import { ProductDetailPage } from "../features/products/pages/ProductDetailPage.jsx";

// ── Pages — checkout ───────────────────────────────────────────
import { CartPage }     from "../features/cart/pages/CartPage.jsx";
import { CheckoutPage } from "../features/orders/pages/CheckoutPage.jsx";

// ── Pages — profile ────────────────────────────────────────────
import { ProfilePage, AddressPage, PasswordPage, FavoritesPage, DeleteAccountPage }
  from "../features/users/pages/ProfilePages.jsx";
import { OrdersPage } from "../features/users/pages/OrdersPage.jsx";

// ── Pages — admin ──────────────────────────────────────────────
import { DashboardPage, ManageUsersPage, CategoriesPage, AboutPage }
  from "../features/categories/pages/AdminPages.jsx";
import { AddProductPage }
  from "../features/products/pages/AddProductPage.jsx";

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
  const sessionUserIsAdmin = Boolean(sessionUser?.admin || sessionUser?.isAdmin);
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
      case route === "/":                           return <LoginPage />; 
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
      case route === "/profile/favorites":          return <FavoritesPage />;
      case route === "/profile/password":           return <PasswordPage />;
      case route === "/profile/delete":             return <DeleteAccountPage />;
      case route === "/dashboard":
        return sessionUserIsAdmin ? <DashboardPage ordersInputPort={modules.orders} productsInputPort={modules.products} /> : <AccessDenied />;
      case route === "/admin/products":
        return sessionUserIsAdmin ? <AddProductPage categories={categories} /> : <AccessDenied />;
      case route.startsWith("/admin/edit-product/"):
        return sessionUserIsAdmin ? <AddProductPage editId={segments[2]} categories={categories} /> : <AccessDenied />;
      case route === "/admin/users":
        return sessionUserIsAdmin ? <ManageUsersPage authInputPort={modules.auth} /> : <AccessDenied />;
      case route === "/admin/orders":
        return sessionUserIsAdmin ? <OrdersPage ordersInputPort={modules.orders} adminView /> : <AccessDenied />;
      case route === "/admin/categories":
        return sessionUserIsAdmin ? <CategoriesPage categoriesInputPort={modules.categories} onCategoriesChange={setCategories} /> : <AccessDenied />;
      case route === "/about":                      return <AboutPage />;
      default:                                      return <NotFound />;
    }
  };

  return (
    <AuthProvider>
      <UsersProvider>
        <CartProvider>
          <ProductsProvider>
            <div className="flex min-h-screen flex-col">
              {showNav && <Navbar path={path} />}
              <main className="flex-1">{renderPage()}</main>
              {showNav && <Footer />}
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
