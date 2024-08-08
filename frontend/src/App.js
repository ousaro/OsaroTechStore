import {BrowserRouter as Router, Route, Routes, Navigate} from "react-router-dom"
import toast, {Toaster} from "react-hot-toast"

import LogIn from "./pages/Authentication/LogIn";
import SetPassword from "./pages/Authentication/SetPassword";
import Home from "./pages/HomePage/Home";
import UserProfile from "./pages/ProfilePages/UserProfile";
import UserProfileAddress from "./pages/ProfilePages/UserProfileAddress"
import UserProfieChangePassword from "./pages/ProfilePages/UserProfileChangePassword";
import UserProfileDeleteAccount from "./pages/ProfilePages/UserProfileDeleteAccount"
import UserProfileOrders from "./pages/ProfilePages/UserProfileOrders";
import UserProfileManageAccounts from "./pages/ProfilePages/UserProfileManageAccounts";
import Products from "./pages/HomePage/Products"
import About from "./pages/HomePage/About";
import Cart from "./pages/HomePage/Cart";
import CardDetail from "./pages/HomePage/CardDetail";
import DashBoard from "./pages/HomePage/DashBoard";
import AddProduct from "./pages/HomePage/AddProduct";
import ShippingAddressForm from "./pages/HomePage/ShipingAddress";
import ScrollToTop from "./components/OtherComponents/ScrollToTop";
import { useEffect, useState} from "react";
import Layout from "./Layout"; // Import the Layout component

import { useAuthContext } from "./hooks/useAuthContext";
import { useProductsContext } from "./hooks/useProductsContext";
import {useCategoriesContext} from "./hooks/useCategoriesContext"
import {useOrdersContext} from "./hooks/useOrdersContext"
import { useUsersContext } from "./hooks/useUsersContext";



import { getAllProducts } from "./api/products";
import { getAllCategories } from "./api/categories";
import { getAllOrders } from "./api/orders";
import { getAllUsers } from "./api/users";



function App() {


  const { user, loading } = useAuthContext();
  const {dispatch: dispatchProducts} = useProductsContext(); 
  const {dispatch : dispatchCategories} = useCategoriesContext();
  const {dispatch: dispatchOrders} = useOrdersContext();
  const {dispatch: dispatchUsers} = useUsersContext();

  const [error, setError]  = useState(null);  
 



  useEffect( () => {

    const fetchProducts = async () => {
     
        const { json , ok  } = await getAllProducts(user);
    
        if (!ok) {
          toast.error(json.error)
      
        } else {
          dispatchProducts({ type: 'SET_PRODUCTS', payload: json });
          
        }
      
    };

 
    const fetchCategories = async () =>{

      const {json, ok} = await getAllCategories(user);


      if (!ok) {
        toast.error(json.error)
    
      } else {
        dispatchCategories({type: 'SET_CATEGORIES', payload: json});
        
      }

    }



    const fetchOrders = async () => {

      const {json, ok} = await getAllOrders(user);
      
      if(!ok){
        toast.error(json.error)
      }else{
        dispatchOrders({type: 'SET_ORDERS', payload: json});
      }
     
    }


    const fetchUsers = async () => {

      const {json, ok } = await getAllUsers(user);

      if(!ok){
        toast.error(json.error)
      }else{
          dispatchUsers({type: 'SET_USERS', payload: json});
      }
   
  }

    if(user){
      fetchProducts()
      fetchCategories() 
      fetchOrders()
      setError(null)
      if(user.admin) {fetchUsers()}
    }
    else{
      setError({message: "You are not logged In"})
      return
    }

  }, [dispatchProducts ,user,dispatchCategories, dispatchOrders, dispatchUsers])




  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  if(error && user){
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className=" text-3xl text-primary2">Error : {error.message} </div>
      </div>
    );
  }

  return (
    <Router>
       <ScrollToTop /> {/* to scroll to the every time the  componenets rederer */}
      <div className="App">
        <Toaster/>
        {(error && user) && <h1>{error.message}</h1>}
       
        <Routes>
          <Route path="/" element={<Navigate to="/LogIn"/>} />
          <Route path="/LogIn" element={!user ? <LogIn/>: <Navigate to="/UserProfile" />}/>
          <Route path="/SetPassword" element={!user ? <SetPassword/>: <Navigate to="/UserProfile" />}/>
          
          <Route element={user ?   <Layout /> : <Navigate to="/" />} > {/* this for adding navbar and footer just to this copeenents following a layout */}

            
          
            <Route path="/UserProfile" element={<UserProfile />} />
            <Route path="/UserProfile/Address" element={<UserProfileAddress  />} />
            <Route path="/UserProfile/ChangePassword" element={<UserProfieChangePassword  />} />
            <Route path="/UserProfile/DeleteAccount" element={<UserProfileDeleteAccount  />} />
            <Route path="/UserProfile/Orders" element={<UserProfileOrders  />} />
            <Route path="/UserProfile/ManageAccount" element={<UserProfileManageAccounts  />} />

            <Route path="/Home" element={ <Home/> } />
            <Route path="/Products" element={<Products />} />
            <Route path="/About" element={<About />} />
            <Route path="/Cart" element={<Cart />} />

            <Route path="/successPayment" element={<ShippingAddressForm />} />

            <Route path="/CardDetail/:cardId" element={ <CardDetail /> } />

            <Route path="/AddProduct" element={<AddProduct /> } />

            <Route path="/DashBoard" element={ <DashBoard /> } />
          </Route>

        </Routes>
         
         </div>
         

    </Router>
  );
}

export default App; 
