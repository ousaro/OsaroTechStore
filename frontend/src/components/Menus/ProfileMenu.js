import profileIconBlack from "../../img/icons/profileIconBlack.svg"
import addressIcon from "../../img/icons/addressIcon.svg"
import ordersIcon from "../../img/icons/ordersIcon.svg"
import changePassIcon from "../../img/icons/changePassIcon.svg"
import deleteAccountIcon from "../../img/icons/deleteIcon.svg"
import logoutIcon from "../../img/icons/logoutIcon.svg"
import manageProfileIcon from "../../img/icons/manageProfileIcon.svg"
import { Link } from "react-router-dom"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import {useLogOut} from "../../hooks/useLogOut";
import { useAuthContext } from "../../hooks/useAuthContext"
import {toast} from "react-hot-toast"


const ProfileMenu = () => {

        const {user} = useAuthContext()
        const admin = user.admin

        const [profileSelected, setProfileSelected] = useState(false);
        const [addressSelected, setAddressSelected] = useState(false);
        const [ordersSelected, setOrdersSelected] = useState(false);
        const [changePassSelected, setChangePassSelected] = useState(false);
        const [deleteAccountSelected, setDeleteAccountSelected] = useState(false);
        const [manageAccountSelected, setManageAccountSelected] = useState(false);

        const {logOut} = useLogOut();
        const navigate = useNavigate();

    
        const onClickHandler = async () => {
            
            await logOut(); 
            toast.success("Log out Successfuly!")
            navigate("/LogIn")
            
        }

        // Set the selected menu item based on the current path
        useEffect(()=>{
                const path = window.location.pathname;
                if(path === "/UserProfile"){
                        setProfileSelected(true);
                        setAddressSelected(false);
                        setOrdersSelected(false);
                        setChangePassSelected(false);
                        setDeleteAccountSelected(false);
                        setManageAccountSelected(false);
                }
                else if(path === "/UserProfile/Address"){
                        setProfileSelected(false);
                        setAddressSelected(true);
                        setOrdersSelected(false);
                        setChangePassSelected(false);
                        setDeleteAccountSelected(false);
                        setManageAccountSelected(false);
                       
                }
                else if(path === "/UserProfile/Orders"){
                        setProfileSelected(false);
                        setAddressSelected(false);
                        setOrdersSelected(true);
                        setChangePassSelected(false);
                        setDeleteAccountSelected(false);
                        setManageAccountSelected(false);
                        
                }
                else if(path === "/UserProfile/ChangePassword"){
                        setProfileSelected(false);
                        setAddressSelected(false);
                        setOrdersSelected(false);
                        setChangePassSelected(true);
                        setDeleteAccountSelected(false);
                        setManageAccountSelected(false);
                        
                }
                else if(path === "/UserProfile/DeleteAccount"){
                        setProfileSelected(false);
                        setAddressSelected(false);
                        setOrdersSelected(false);
                        setChangePassSelected(false);
                        setDeleteAccountSelected(true);
                        setManageAccountSelected(false);
                        
                }  
                else if(path === "/UserProfile/ManageAccount"){
                        setProfileSelected(false);
                        setAddressSelected(false);
                        setOrdersSelected(false);
                        setChangePassSelected(false);
                        setDeleteAccountSelected(false);
                        setManageAccountSelected(true);
                }
                
        },[setProfileSelected,setAddressSelected,setOrdersSelected,setChangePassSelected,setDeleteAccountSelected, setManageAccountSelected])
        


    return ( 
        <div className={`bg-white absolute top-5 right-0 lg:static w-64 lg:h-screen lg:w-50 p-4 shadow-lg rounded-lg z-50 lg:shadow-none lg:rounded-none lg:bg-transparent lg:border-r-4`}>
            <nav className="space-y-4">
                <Link to="/UserProfile">
                    <figure className={`ProfileMenuHover flex gap-2 items-center p-2 rounded-lg transition duration-300 ease-in-out transform hover:bg-gray-200 ${profileSelected ? "bg-primary2 text-white" : "text-primary1"}`}>
                        <img src={profileIconBlack} alt="Profile" className={`w-6 h-6 ${profileSelected ? "rounded-3xl p-1 bg-white" : ""}`} />
                        <p className="font-bold">Profile</p>
                    </figure>
                </Link>

                <Link to="/UserProfile/Address">
                    <figure className={`ProfileMenuHover flex gap-2 items-center p-2 rounded-lg transition duration-300 ease-in-out transform hover:bg-gray-200 ${addressSelected ? "bg-primary2 text-white" : "text-primary1"}`}>
                        <img src={addressIcon} alt="Address" className={`w-6 h-6 ${addressSelected ? "rounded-3xl p-1 bg-white" : ""}`} />
                        <p className="font-bold">Address</p>
                    </figure>
                </Link>

                <Link to="/UserProfile/Orders">
                    <figure className={`ProfileMenuHover flex gap-2 items-center p-2 rounded-lg transition duration-300 ease-in-out transform hover:bg-gray-200 ${ordersSelected ? "bg-primary2 text-white" : "text-primary1"}`}>
                        <img src={ordersIcon} alt="Orders" className={`w-6 h-6 ${ordersSelected ? "rounded-3xl p-1 bg-white" : ""}`} />
                        <p className="font-bold">Orders</p>
                    </figure>
                </Link>

                {admin &&  <Link to="/UserProfile/ManageAccount">
                    <figure className={`ProfileMenuHover flex gap-2 items-center p-2 rounded-lg transition duration-300 ease-in-out transform hover:bg-gray-200 ${manageAccountSelected ? "bg-primary2 text-white" : "text-primary1"}`}>
                        <img src={manageProfileIcon} alt="Manage Account" className={`w-6 h-6 ${manageAccountSelected ? "rounded-3xl p-1 bg-white" : ""}`} />
                        <p className="font-bold">Manage Account</p>
                    </figure></Link>}

                <Link to="/UserProfile/ChangePassword">
                    <figure className={`ProfileMenuHover flex gap-2 items-center p-2 rounded-lg transition duration-300 ease-in-out transform hover:bg-gray-200 ${changePassSelected ? "bg-primary2 text-white" : "text-primary1"}`}>
                        <img src={changePassIcon} alt="Change Password" className={`w-6 h-6 ${changePassSelected ? "rounded-3xl p-1 bg-white" : ""}`} />
                        <p className="font-bold">Change Password</p>
                    </figure>
                </Link>

                <Link to="/UserProfile/DeleteAccount">
                    <figure className={`ProfileMenuHover flex gap-2 items-center p-2 rounded-lg transition duration-300 ease-in-out transform hover:bg-gray-200 ${deleteAccountSelected ? "bg-primary2 text-white" : "text-primary1"}`}>
                        <img src={deleteAccountIcon} alt="Delete Account" className={`w-6 h-6 ${deleteAccountSelected ? "rounded-3xl p-1 bg-white" : ""}`} />
                        <p className="font-bold">Delete Account</p>
                    </figure>
                </Link>

                <Link onClick={onClickHandler}>
                    <figure className={`ProfileMenuHover flex gap-2 items-center p-2 rounded-lg transition duration-300 ease-in-out transform hover:bg-gray-200 text-primary2`}>
                        <img src={logoutIcon} alt="Logout" className={`w-6 h-6 ${deleteAccountSelected ? "rounded-3xl p-1 bg-white" : ""}`} />
                        <p className="font-bold">Logout</p>
                    </figure>
                </Link>
            </nav>
        </div>
     );
}
 
export default ProfileMenu;