import { useEffect } from "react";
import toast from "react-hot-toast";

import { getAllCategories } from "../../infrastructure/api/categories";
import { getAllOrders } from "../../infrastructure/api/orders";
import { getAllProducts } from "../../infrastructure/api/products";
import { getAllUsers } from "../../infrastructure/api/users";
import { useAuthContext } from "../auth/useAuthContext";
import { useCategoriesContext } from "./useCategoriesContext";
import { useOrdersContext } from "./useOrdersContext";
import { useProductsContext } from "./useProductsContext";
import { useUsersContext } from "./useUsersContext";

const showApiError = (json, fallback) => {
  toast.error(json?.error || json?.message || fallback);
};

const AppDataLoader = ({ children }) => {
  const { user } = useAuthContext();
  const { dispatch: dispatchProducts } = useProductsContext();
  const { dispatch: dispatchCategories } = useCategoriesContext();
  const { dispatch: dispatchOrders } = useOrdersContext();
  const { dispatch: dispatchUsers } = useUsersContext();

  useEffect(() => {
    if (!user) {
      return;
    }

    const fetchProducts = async () => {
      const { json, ok } = await getAllProducts(user);

      if (!ok) {
        showApiError(json, "Could not load products");
        return;
      }

      dispatchProducts({ type: "SET_PRODUCTS", payload: json });
    };

    const fetchCategories = async () => {
      const { json, ok } = await getAllCategories(user);

      if (!ok) {
        showApiError(json, "Could not load categories");
        return;
      }

      dispatchCategories({ type: "SET_CATEGORIES", payload: json });
    };

    const fetchOrders = async () => {
      const { json, ok } = await getAllOrders(user);

      if (!ok) {
        showApiError(json, "Could not load orders");
        return;
      }

      dispatchOrders({ type: "SET_ORDERS", payload: json });
    };

    const fetchUsers = async () => {
      const { json, ok } = await getAllUsers(user);

      if (!ok) {
        showApiError(json, "Could not load users");
        return;
      }

      dispatchUsers({ type: "SET_USERS", payload: json });
    };

    fetchProducts();
    fetchCategories();
    fetchOrders();

    if (user.admin) {
      fetchUsers();
    }
  }, [dispatchCategories, dispatchOrders, dispatchProducts, dispatchUsers, user]);

  return children;
};

export default AppDataLoader;
