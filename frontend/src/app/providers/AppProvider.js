import { AuthContextProvider } from "../../core/auth/AuthContext";
import { ProductsProvider } from "../../core/app-context/ProductsContext";
import { CategoriesProvider } from "../../core/app-context/CategoriesContext";
import { UsersProvider } from "../../core/app-context/UsersContext";
import { OrdersProvider } from "../../core/app-context/OrdersContext";

const AppProvider = ({ children }) => {
  return (
    <AuthContextProvider>
      <ProductsProvider>
        <CategoriesProvider>
          <UsersProvider>
            <OrdersProvider>{children}</OrdersProvider>
          </UsersProvider>
        </CategoriesProvider>
      </ProductsProvider>
    </AuthContextProvider>
  );
};

export default AppProvider;
