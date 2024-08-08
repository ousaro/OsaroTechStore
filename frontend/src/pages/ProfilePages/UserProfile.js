import ProfileMenu from "../../components/Menus/ProfileMenu";
import MenuDotsIcon from "../../img/icons/menuDotsIcon.svg";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useAuthContext } from "../../hooks/useAuthContext";
import { updateUser } from "../../api/users";
import { updateLocalStorage } from "../../utils/utils";
import {toast} from "react-hot-toast"

const UserProfile = () => {

    const {user, dispatch} = useAuthContext();
    
    const admin = user.admin;

    const [showMenu, setShowMenu] = useState(false);
    const [error, setError] = useState(null)

    const [userUpdatedInfo, setUserUpdatedInfo] = useState({
        picture: user.picture,
        firstName : user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone
    });

    const [isEditing, setIsEditing] = useState(false);

    const handleShowMenu = () => {
        setShowMenu(!showMenu);
    }
    const handleClick = (event) => {
        if (!event.target.closest('.menuButton')) {
            setShowMenu(false)
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserUpdatedInfo((prevUser) => ({
            ...prevUser,
            [name]: value
        }));
    }

    const handleEdit = () => {
        setIsEditing(true);
    }

    const handleSave = async (e) => {
        e.preventDefault();
    
        setIsEditing(false);
    
        const update = userUpdatedInfo;
        const promise = updateUser(user, user._id, update);
        
        toast.promise(
            promise,
            {
                pending: 'Updating user...',
                success: 'User updated successfully!',
                error: {
                    render({ data }) {
                        return data.error.message;
                    }
                }
            }
        );
    
        const { json, ok, error } = await promise;
    
        if (!ok) {
            setError(error);
        } else {
            updateLocalStorage(json);
            dispatch({ type: "UPDATE_USER", payload: json });
        }
    };


    
  if(error){
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className=" text-3xl text-primary2">Error : {error.message} </div>
      </div>
    );
  }
   

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
                    <div className="w-full flex flex-col"> 
                        <h1 className="text-xl font-bold text-primary1 mb-5">Profile Information</h1>
                        <form className="w-full max-w-md md:max-w-none" onSubmit={handleSave}>
                            <div className="flex flex-col items-center md:items-start md:flex-row gap-6 mb-4">
                                <img
                                    src={userUpdatedInfo.picture}
                                    alt="User Avatar"
                                    className="w-32 h-32 rounded-full object-cover border-2 border-primary1"
                                />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="firstName">First Name</label>
                                        <input
                                            type="text"
                                            id="firstName"
                                            name="firstName"
                                            value={userUpdatedInfo.firstName}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary1 focus:border-primary1"
                                            readOnly={!isEditing}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="lastName">Last Name</label>
                                        <input
                                            type="text"
                                            id="lastName"
                                            name="lastName"
                                            value={userUpdatedInfo.lastName}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary1 focus:border-primary1"
                                            readOnly={!isEditing}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">Email</label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={userUpdatedInfo.email}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary1 focus:border-primary1"
                                            readOnly={!isEditing}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">Phone</label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            value={userUpdatedInfo.phone}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary1 focus:border-primary1"
                                            readOnly={!isEditing}       
                                        />
                                    </div>
                                    
                                </div>
                            </div>
                            {isEditing ? (
                                <div></div>
                            ) : (
                                <div className="flex justify-end">
                                     <button
                                    type="button"
                                    onClick={handleEdit}
                                    className="w-full md:w-3/12 flex justify-center px-4 py-2 bg-primary1 text-white font-semibold rounded-md hover:bg-primary2 focus:outline-none "
                                    >
                                        Edit Profile
                                    </button>
                                </div>
                            )}

                            {!isEditing ? (
                                <div></div>
                            ) : (
                               <div className="flex justify-end">
                                    <button
                                    type="submit"
                                    className="w-full md:w-3/12 px-4 py-2  bg-primary1 text-white font-semibold rounded-md hover:bg-primary2 focus:outline-none "
                                    >
                                    Save Changes
                                    </button>
                               </div>
                            )}

                            
                        </form>
                    </div>
                </div>
            </main>
            
        </div>
    );
}

export default UserProfile;
