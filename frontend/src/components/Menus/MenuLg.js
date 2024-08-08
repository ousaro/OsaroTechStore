import profileIconBlack from "../../img/icons/profileIconBlack.svg"
import aboutIconBlack from "../../img/icons/aboutIconBlack.svg"
import productIcon from "../../img/icons/productsIcon.svg"
import homeIconBlack from "../../img/icons/homeIconBlack.svg"
import dashBordIcon from "../../img/icons/dashBoardIcon.svg"
import { Link, useLocation } from "react-router-dom"
import { useEffect, useState } from "react"
import addProductIcon from "../../img/icons/addProductIcon.svg"



const MenuLg = ({admin}) => {

        const [homeSelected, setHomeSelected] = useState(false);
        const [profileSelected, setProfileSelected] = useState(false);
        const [aboutSelected, setAboutSelected] = useState(false);
        const [productsSelected, setProductsSelected] = useState(false);
        const [dashboardSelected, setDashboardSelected] = useState(false);
        const [addProductSelected , setAddProductSelected] = useState(false);

        const location = useLocation();
        const currentPath = location.pathname;


        // Set the selected menu item based on the current path
        useEffect(()=>{
                if(currentPath === "/Home"){
                        setHomeSelected(true);
                        setProfileSelected(false);
                        setAboutSelected(false);
                        setProductsSelected(false);
                        setDashboardSelected(false);
                        setAddProductSelected(false)
                }
                else if(currentPath.startsWith("/UserProfile")){
                        setHomeSelected(false);
                        setProfileSelected(true);
                        setAboutSelected(false);
                        setProductsSelected(false);
                        setDashboardSelected(false);
                        setAddProductSelected(false)
                }
                else if(currentPath === "/Setting"){
                        setHomeSelected(false);
                        setProfileSelected(false);
                        setAboutSelected(false);
                        setProductsSelected(false);
                        setDashboardSelected(false);
                        setAddProductSelected(false)
                }
                else if(currentPath === "/About"){
                        setHomeSelected(false);
                        setProfileSelected(false);
                        setAboutSelected(true);
                        setProductsSelected(false);
                        setDashboardSelected(false);
                        setAddProductSelected(false)
                }
                else if(currentPath === "/Products"){
                        setHomeSelected(false);
                        setProfileSelected(false);
                        setAboutSelected(false);
                        setProductsSelected(true);
                        setDashboardSelected(false);
                        setAddProductSelected(false)
                }
                else if(currentPath === "/DashBoard"){
                        setHomeSelected(false);
                        setProfileSelected(false);
                        setAboutSelected(false);
                        setProductsSelected(false);
                        setDashboardSelected(true);
                        setAddProductSelected(false)
                }
                else if(currentPath === "/AddProduct"){
                        setHomeSelected(false);
                        setProfileSelected(false);
                        setAboutSelected(false);
                        setProductsSelected(false);
                        setDashboardSelected(false);
                        setAddProductSelected(true)
                }else{
                        setHomeSelected(false);
                        setProfileSelected(false);
                        setAboutSelected(false);
                        setProductsSelected(false);
                        setDashboardSelected(false);
                        setAddProductSelected(false)
                }
                
        },[setHomeSelected,setProfileSelected,setAboutSelected, setProductsSelected,setDashboardSelected,setAddProductSelected, currentPath])
        


    return ( 
        <div className="bg-white text-primary1 text-xs p-2 justify-start gap-16 w-full hidden md:flex md:justify-center lg:justify-start xl:m-auto xl:w-10/12">

                {admin ?  (
                        <Link to="/AddProduct"><figure className={`MenuHover flex gap-2 justify-start ${addProductSelected ? "MenuSelected" : ""}`}>  
                        <img src={addProductIcon} alt="menu icon" className='w-7 h-7'/>
                        <p className="w-full pt-2 font-bold">Add Product</p>
                        </figure></Link>
                )
                :
                (
                        <Link to="/Home"><figure className={`MenuHover flex gap-2 justify-start ${homeSelected ? "MenuSelected" : ""}`}>  
                        <img src={homeIconBlack} alt="menu icon" className='w-7 h-7'/>
                        <p className="w-full pt-2 font-bold">Home</p>
                        </figure></Link>
                        )}

            <Link to="/Products"><figure className={`MenuHover flex gap-2 justify-start ${productsSelected ? "MenuSelected" : ""}`}>  
                    <img src={productIcon} alt="menu icon" className='w-7 h-7 p-0.5'/>
                    <p className="w-full pt-2 font-bold">Products</p>
            </figure></Link>

            {admin &&  <Link to="/DashBoard" ><figure className={`MenuHover  flex gap-2 justify-start ${dashboardSelected ? "MenuSelected" : ""}`}>  
                    <img src={dashBordIcon} alt="menu icon" className='w-7 h-7 p-0.5'/>
                    <p className="w-full pt-2 font-bold">DashBord</p>
            </figure></Link>}

            <Link to="/UserProfile" ><figure className={`MenuHover  flex gap-2 justify-start ${profileSelected ? "MenuSelected" : ""}`}>  
                    <img src={profileIconBlack} alt="menu icon" className='w-7 h-7 p-0.5'/>
                    <p className="w-full pt-2 font-bold">Profile</p>
            </figure></Link>

            <Link to="/About" ><figure className={`MenuHover flex gap-2 justify-start ${aboutSelected ? "MenuSelected" : ""}`}>  
                    <img src={aboutIconBlack} alt="menu icon" className='w-7 h-7'/>
                    <p className="w-full pt-2 font-bold">About</p>
            </figure></Link>
        </div>
     );
}
 
export default MenuLg;