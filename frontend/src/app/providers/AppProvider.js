import { AuthContextProvider } from "../../contexts/AuthContext";
import { ProductsProvider } from "../../contexts/ProductsContext";
import { CategoriesProvider } from "../../contexts/CategoriesContext";
import { UsersProvider } from "../../contexts/UsersContext";
import { OrdersProvider } from "../../contexts/OrdersContext";

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
