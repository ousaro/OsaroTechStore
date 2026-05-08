export const endpoints = {
  auth: {
    register: "/auth/register",
    login: "/auth/login",
    adminUsers: "/auth/users",
    adminUser: (id) => `/auth/users/${id}`,
  },
  users: {
    me: "/users/me",
    byId: (id) => `/users/${id}`,
    cart: "/users/me/cart",
    favorite: (productId) => `/users/me/favorites/${productId}`,
  },
  products: {
    root: "/products",
    byId: (id) => `/products/${id}`,
  },
  categories: {
    root: "/categories",
    byId: (id) => `/categories/${id}`,
  },
  orders: {
    root: "/orders",
    byId: (id) => `/orders/${id}`,
  },
  payments: {
    intent: "/payments/intent",
    byOrderId: (orderId) => `/payments/order/${orderId}`,
  },
};
