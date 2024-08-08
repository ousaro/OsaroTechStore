import profileIcon from "../../img/icons/profileIcon.svg"
import aboutIcon from "../../img/icons/aboutIcon.svg"
import productIcon from "../../img/icons/productsIconWhite.svg"
import homeIcon from "../../img/icons/homeIcon.svg"
import { Link, useLocation } from "react-router-dom"
import { useState, useEffect } from "react"
import dashBordIconWhite from "../../img/icons/dashBoardIconWhite.svg"
import addProductIconWhite from "../../img/icons/addProductIconWhite.svg"



const Menu = ({showMenu , admin}) => {

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
                else if(currentPath === "/Dashboard"){
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
                }
                else{
                        setHomeSelected(false);
                        setProfileSelected(false);
                        setAboutSelected(false);
                        setProductsSelected(false);
                        setDashboardSelected(false);
                        setAddProductSelected(false)
                }
                
        },[setHomeSelected,setProfileSelected,setAboutSelected,setProductsSelected, setDashboardSelected,setAddProductSelected, currentPath])
        


    return ( 
        <div className={`fixed bg-primary1 text-white text-xs w-7/12 h-lvh z-50  transform transition-transform duration-300  ease-in-out  ${showMenu ? 'translate-x-0' : '-translate-x-full'} p-2 pt-24 flex flex-col gap-10  md: w-5/12 lg:hidden`}>

            <div className="border-b-4  text-2xl">Menu</div>

           {admin ?  (
                <Link to="/AddProduct"><figure className={`MenuHover flex gap-2 justify-start ${addProductSelected ? "MenuSelected" : ""}`}>  
                    <img src={addProductIconWhite} alt="menu icon" className='w-7 h-7'/>
                    <p className="w-full pt-2 font-bold">Add Product</p>
                </figure></Link>
            )
            :
            (<Link to="/Home"><figure className={`MenuHover flex gap-2 justify-start ${homeSelected ? "MenuSelected" : ""}`}>  
                <img src={homeIcon} alt="menu icon" className='w-7 h-7'/>
                <p className="w-full pt-2 font-bold">Home</p>
                </figure></Link>
                )}

            <Link to="/Products"><figure className={`MenuHover flex gap-2 justify-start ${productsSelected ? "MenuSelected" : ""}`}>  
                    <img src={productIcon} alt="menu icon" className='w-7 h-7 p-0.5'/>
                    <p className="w-full pt-2 font-bold">Products</p>
            </figure></Link>

            {admin &&   <Link to="/DashBoard" ><figure className={`MenuHover  flex gap-2 justify-start ${dashboardSelected ? "MenuSelected" : ""}`}>  
                    <img src={dashBordIconWhite} alt="menu icon" className='w-7 h-7 p-0.5'/>
                    <p className="w-full pt-2 font-bold">DashBord</p>
            </figure></Link>}

            <Link to="/UserProfile"><figure className={`MenuHover  flex gap-2 justify-start ${profileSelected ? "MenuSelected" : ""}`}>  
                    <img src={profileIcon} alt="menu icon" className='w-7 h-7 p-0.5'/>
                    <p className="w-full pt-2 font-bold">Profile</p>
            </figure></Link>

            <Link to="/About"><figure className={`MenuHover flex gap-2 justify-start ${aboutSelected ? "MenuSelected" : ""}`}>  
                    <img src={aboutIcon} alt="menu icon" className='w-7 h-7'/>
                    <p className="w-full pt-2 font-bold">About</p>
            </figure></Link>
        </div>
     );
}
 
export default Menu;