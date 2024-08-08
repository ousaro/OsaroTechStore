import { Outlet, useLocation } from "react-router-dom";
import NavBar from "./components/Sections/NavBar";
import Footer from "./components/Sections/Footer";

const Layout = () => {
 
  const location = useLocation();


  const showNavAndFooter = !['/LogIn', '/SetPassword'].includes(location.pathname);

  return (
    <div>
      {showNavAndFooter && <NavBar  />}
      <Outlet />
      {showNavAndFooter && <Footer />}
    </div>
  );
};

export default Layout;
