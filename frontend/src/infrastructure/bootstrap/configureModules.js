/**
 * INFRASTRUCTURE BOOTSTRAP — Composition Root
 *
 * Frontend mirror of backend's configureApplicationModules.js.
 *
 * THIS IS THE ONLY FILE THAT KNOWS THE FULL DEPENDENCY GRAPH.
 *
 * Responsibilities (mirrors backend exactly):
 *  1. Resolve providers (http, session, events, notifications)
 *  2. Create repository adapters
 *  3. Create module compositions (input ports)
 *  4. Register cross-module event translators
 *  5. Return module input ports for consumption by the router
 *
 * Rule: if a dependency connects two modules or infrastructure concerns,
 *       wire it HERE — never inside a module.
 *
 * Modules must NOT import each other's internals.
 * Cross-module communication goes through events + translators (see below).
 */

// ── Providers ─────────────────────────────────────────────────────
import { httpClient }    from "../providers/http/httpClient.js";
import { sessionStore }  from "../providers/session/sessionStore.js";
import { eventBus }      from "../providers/events/inProcessEventBus.js";
import { toastNotifier } from "../providers/notifications/toastNotifier.js";

// ── Repository adapters ────────────────────────────────────────────
import { createHttpAuthRepository }     from "../../modules/auth/adapters/output/http/httpAuthRepository.js";
import { createHttpUserRepository }     from "../../modules/users/adapters/output/http/httpUserRepository.js";
import { createHttpProductRepository }  from "../../modules/products/adapters/output/http/httpProductRepository.js";
import { createHttpCategoryRepository } from "../../modules/categories/adapters/output/http/httpCategoryRepository.js";
import { createHttpOrderRepository }    from "../../modules/orders/adapters/output/http/httpOrderRepository.js";
import { createHttpPaymentRepository }  from "../../modules/payments/adapters/output/http/httpPaymentRepository.js";
import { createHttpCartRepository }     from "../../modules/cart/adapters/output/http/httpCartRepository.js";

// ── Module compositions ────────────────────────────────────────────
import { createAuthModule }       from "../../modules/auth/composition.js";
import { createUsersModule }      from "../../modules/users/composition.js";
import { createProductsModule }   from "../../modules/products/composition.js";
import { createCategoriesModule } from "../../modules/categories/composition.js";
import { createOrdersModule }     from "../../modules/orders/composition.js";
import { createPaymentsModule }   from "../../modules/payments/composition.js";
import { createCartModule }       from "../../modules/cart/composition.js";

// ── Cross-module translators ───────────────────────────────────────
import { createCategoryDeletedProductCleanupTranslator }
  from "../../modules/products/adapters/input/collaboration/categoryDeletedProductCleanupTranslator.js";
import { createOrderPlacedCartClearTranslator }
  from "../../modules/cart/adapters/input/collaboration/orderPlacedCartClearTranslator.js";

// ── Events ────────────────────────────────────────────────────────
import { Events } from "../../shared/domain/events/DomainEvent.js";

// ─────────────────────────────────────────────────────────────────
let _modules = null; // singleton cache

export function configureModules() {
  if (_modules) return _modules;

  // ── 1. Build shared deps
  const deps = { httpClient, sessionStore, eventBus, notify: toastNotifier };

  // ── 2. Create repository adapters
  const repositories = {
    auth:     createHttpAuthRepository(deps),
    users:    createHttpUserRepository(deps),
    products: createHttpProductRepository(deps),
    categories: createHttpCategoryRepository(deps),
    orders:   createHttpOrderRepository(deps),
    payments: createHttpPaymentRepository(deps),
    cart:     createHttpCartRepository(deps),
  };

  // ── 3. Create module input ports
  const auth       = createAuthModule({ ...repositories, ...deps });
  const users      = createUsersModule({ ...repositories, ...deps });
  const products   = createProductsModule({ ...repositories, ...deps });
  const categories = createCategoriesModule({ ...repositories, ...deps });
  const orders     = createOrdersModule({ ...repositories, ...deps });
  const payments   = createPaymentsModule({ ...repositories, ...deps });
  const cart       = createCartModule({ ...repositories, ...deps });

  // ── 4. Wire cross-module event translators ─────────────────────
  //
  // CategoryDeleted → remove products belonging to that category
  const categoryProductCleanup = createCategoryDeletedProductCleanupTranslator({
    productsModule: products,
  });
  eventBus.subscribe(Events.CATEGORY_DELETED, categoryProductCleanup.handle);

  // OrderPlaced → clear the cart
  const cartClearOnOrder = createOrderPlacedCartClearTranslator({
    cartModule: cart,
  });
  eventBus.subscribe(Events.ORDER_PLACED, cartClearOnOrder.handle);

  // ── 5. Expose module input ports to the router
  _modules = { auth, users, products, categories, orders, payments, cart };
  return _modules;
}

/** Convenience hook for consuming modules in React */
export function getModules() {
  if (!_modules) throw new Error("Modules not yet configured. Call configureModules() first.");
  return _modules;
}
