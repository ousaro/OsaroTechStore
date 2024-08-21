import ProfileMenu from "../../components/Menus/ProfileMenu";
import MenuDotsIcon from "../../img/icons/menuDotsIcon.svg";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useAuthContext } from "../../hooks/useAuthContext";
import ConfimPasswordInput from "../../components/Inputs/ConfimPasswordInput";
import PasswordInput from "../../components/Inputs/PasswordInput";
import { updateUserPassword } from "../../api/users";
import {toast} from "react-hot-toast"
import LoadingOverlay from "../../components/OtherComponents/LoadingOverlay";


const UserProfileChangePassword = () => {

    const {user} = useAuthContext();
    const admin = user.admin;


    const [showMenu, setShowMenu] = useState(false);

    const [changingPass, setChangingPass] = useState(false)
 
    const newPasswordInitialState = {
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    }

    const [userNewPassword, setUserNewPassword] = useState(newPasswordInitialState)

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserNewPassword((prevUser) => ({
            ...prevUser,
            [name]: value
        }));
      }

    const handleShowMenu = () => {
        setShowMenu(!showMenu);
    }

    const handleClick = (event) => {
        if (!event.target.closest('.menuButton')) {
            setShowMenu(false)
        }
    };

   const handleSubmit = async (e) => {
        e.preventDefault();

        setChangingPass(true)
    
        if (userNewPassword.newPassword !== userNewPassword.confirmPassword) {
            toast.error("Passwords do not match" )
            return;
        }
    
        const update = userNewPassword;
    
        const { json,ok } = await updateUserPassword(user, user._id, update);
    
        if (!ok) {
            toast.error(json.error)
        }else{
            toast.success('Password updated successfully!')
            setUserNewPassword(newPasswordInitialState)
        }

        setChangingPass(false)
    };
    


    

    return (
        <div className="flex flex-col min-h-screen  bg-gray-100" onClick={handleClick}>
            
            <main className="xl:m-auto xl:w-10/12 flex-1">
                <div className="flex flex-col gap-4 items-start p-4 lg:flex-row">
                    <div className="flex gap-4 w-full lg:w-auto relative">
                        <figure className="flex flex-col w-full items-end gap-1 text-primary1 pl-2  lg:hidden">
                            <Link className="flex justify-center hover:opacity-70">
                                <img
                                    src={MenuDotsIcon}
                                    alt="menu icon"
                                    className="w-auto h-6 sm:h-7 md:h-8 menuButton"
                                    onClick={handleShowMenu}
                                    />
                            </Link>
                        </figure>
                        <div className={`${showMenu ? "flex": "hidden"} lg:flex`}><ProfileMenu admin={admin}/></div>
                    </div>
                    <div className="w-full">
                        <h1 className="text-xl font-bold text-primary1 mb-4">Change Password</h1>
                        <form className="w-full max-w-md md:max-w-none " onSubmit={handleSubmit}>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <PasswordInput labelName={"Current Password"} name={"currentPassword"} value={userNewPassword.currentPassword} onChange={handleChange}></PasswordInput>
                               
                                <PasswordInput labelName={"New Password"} name={"newPassword"} value={userNewPassword.newPassword} onChange={handleChange}></PasswordInput>
                                
                                <ConfimPasswordInput name={"confirmPassword"} value={userNewPassword.confirmPassword} onChange={handleChange}></ConfimPasswordInput>
                               
                                
                           </div>
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    className="w-full md:w-3/12 px-4 py-2 bg-primary1 text-white font-semibold rounded-md hover:bg-primary2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary1"
                                >
                                    Change Password
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <LoadingOverlay show={changingPass} message={"Changing password..."}/>
            </main>
           
        </div>
    );
}

export default UserProfileChangePassword;
