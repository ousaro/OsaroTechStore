import { httpClient }    from "../api/client.js";
import { sessionStore }  from "../store/sessionStore.js";
import { eventBus }      from "../store/eventBus.js";
import { toastNotifier } from "../lib/toastNotifier.js";

import { createHttpAuthRepository }     from "../features/auth/api/authApi.js";
import { createHttpUserRepository }     from "../features/users/api/usersApi.js";
import { createHttpProductRepository }  from "../features/products/api/productsApi.js";
import { createHttpCategoryRepository } from "../features/categories/api/categoriesApi.js";
import { createHttpOrderRepository }    from "../features/orders/api/ordersApi.js";
import { createHttpPaymentRepository }  from "../features/payments/api/paymentsApi.js";
import { createHttpCartRepository }     from "../features/cart/api/cartApi.js";

import { createAuthModule }       from "../features/auth/authService.js";
import { createUsersModule }      from "../features/users/usersService.js";
import { createProductsModule }   from "../features/products/productsService.js";
import { createCategoriesModule } from "../features/categories/categoriesService.js";
import { createOrdersModule }     from "../features/orders/ordersService.js";
import { createPaymentsModule }   from "../features/payments/paymentsService.js";
import { createCartModule }       from "../features/cart/cartService.js";

import { createCategoryDeletedProductCleanupTranslator }
  from "../features/products/services/categoryDeletedProductCleanup.js";
import { createOrderPlacedCartClearTranslator }
  from "../features/cart/services/orderPlacedCartClear.js";

import { Events } from "../lib/events.js";

let _modules = null;

export function configureModules() {
  if (_modules) return _modules;

  const deps = { httpClient, sessionStore, eventBus, notify: toastNotifier };

  const repositories = {
    auth:     createHttpAuthRepository(deps),
    users:    createHttpUserRepository(deps),
    products: createHttpProductRepository(deps),
    categories: createHttpCategoryRepository(deps),
    orders:   createHttpOrderRepository(deps),
    payments: createHttpPaymentRepository(deps),
    cart:     createHttpCartRepository(deps),
  };

  const auth       = createAuthModule({ ...repositories, ...deps });
  const users      = createUsersModule({ ...repositories, ...deps });
  const products   = createProductsModule({ ...repositories, ...deps });
  const categories = createCategoriesModule({ ...repositories, ...deps });
  const orders     = createOrdersModule({ ...repositories, ...deps });
  const payments   = createPaymentsModule({ ...repositories, ...deps });
  const cart       = createCartModule({ ...repositories, ...deps });

  const categoryProductCleanup = createCategoryDeletedProductCleanupTranslator({
    productsModule: products,
  });
  eventBus.subscribe(Events.CATEGORY_DELETED, categoryProductCleanup.handle);

  const cartClearOnOrder = createOrderPlacedCartClearTranslator({
    cartModule: cart,
  });
  eventBus.subscribe(Events.ORDER_PLACED, cartClearOnOrder.handle);

  _modules = { auth, users, products, categories, orders, payments, cart };
  return _modules;
}

export function getModules() {
  if (!_modules) throw new Error("Modules not yet configured. Call configureModules() first.");
  return _modules;
}
