import { Outlet, useLocation } from "react-router-dom";
import NavBar from "../../ui/components/Sections/NavBar";
import Footer from "../../ui/components/Sections/Footer";

const Layout = () => {
 
  const location = useLocation();


  const showNavAndFooter = !['/LogIn', '/SetPassword'].includes(location.pathname);

  return (
    <div className="min-h-screen bg-slate-50">
      {showNavAndFooter && <NavBar  />}
      <Outlet />
      {showNavAndFooter && <Footer />}
    </div>
  );
};

export default Layout;
