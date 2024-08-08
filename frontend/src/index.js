import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthContextProvider } from './contexts/AuthContext';
import { ProductsProvider } from './contexts/ProductsContext';
import {CategoriesProvider} from "./contexts/CategoriesContext"
import {UsersProvider } from "./contexts/UsersContext"
import {OrdersProvider} from "./contexts/OrdersContext"


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthContextProvider>
      <ProductsProvider>
         <CategoriesProvider>
            <UsersProvider>
              <OrdersProvider>
                <App />
               </OrdersProvider>
            </UsersProvider>
         </CategoriesProvider>
      </ProductsProvider>
    </AuthContextProvider>
  </React.StrictMode>
);

