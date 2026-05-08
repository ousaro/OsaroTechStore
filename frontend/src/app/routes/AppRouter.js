import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import ScrollToTop from "../../components/OtherComponents/ScrollToTop";
import { LogIn, SetPassword } from "../../modules/auth";
import { AddProduct, About, CardDetail, Home, Products } from "../../modules/storefront";
import { Cart, ShippingAddressForm } from "../../modules/checkout";
import { DashBoard } from "../../modules/dashboard";
import {
  UserProfile,
  UserProfileAddress,
  UserProfieChangePassword,
  UserProfileDeleteAccount,
  UserProfileManageAccounts,
  UserProfileOrders,
} from "../../modules/profile";
import MainLayout from "../layouts/MainLayout";
import LoadingPage from "../../core/loading/LoadingPage";
import AppDataLoader from "../../core/app-context/AppDataLoader";
import { useAuthContext } from "../../hooks/useAuthContext";

const AppRouter = () => {
  const { user, loading } = useAuthContext();

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <Router>
      <ScrollToTop />
      <AppDataLoader>
        <div className="App min-h-screen bg-slate-50 text-primary1">
          <Toaster />
          <Routes>
            <Route path="/" element={<Navigate to="/LogIn" />} />
            <Route path="/LogIn" element={!user ? <LogIn /> : <Navigate to="/UserProfile" />} />
            <Route path="/SetPassword" element={!user ? <SetPassword /> : <Navigate to="/UserProfile" />} />

            <Route element={user ? <MainLayout /> : <Navigate to="/" />}>
              <Route path="/UserProfile" element={<UserProfile />} />
              <Route path="/UserProfile/Address" element={<UserProfileAddress />} />
              <Route path="/UserProfile/ChangePassword" element={<UserProfieChangePassword />} />
              <Route path="/UserProfile/DeleteAccount" element={<UserProfileDeleteAccount />} />
              <Route path="/UserProfile/Orders" element={<UserProfileOrders />} />
              <Route path="/UserProfile/ManageAccount" element={<UserProfileManageAccounts />} />
              <Route path="/Home" element={<Home />} />
              <Route path="/Products" element={<Products />} />
              <Route path="/About" element={<About />} />
              <Route path="/Cart" element={<Cart />} />
              <Route path="/successPayment" element={<ShippingAddressForm />} />
              <Route path="/CardDetail/:cardId" element={<CardDetail />} />
              <Route path="/AddProduct" element={<AddProduct />} />
              <Route path="/DashBoard" element={<DashBoard />} />
            </Route>
          </Routes>
        </div>
      </AppDataLoader>
    </Router>
  );
};

export default AppRouter;
