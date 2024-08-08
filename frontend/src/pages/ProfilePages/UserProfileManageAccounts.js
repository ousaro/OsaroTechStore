import ProfileMenu from "../../components/Menus/ProfileMenu";
import MenuDotsIcon from "../../img/icons/menuDotsIcon.svg";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useAuthContext } from "../../hooks/useAuthContext";
import {useUsersContext} from "../../hooks/useUsersContext"
import {  updateUser, deleteUser, updateUserPassword } from "../../api/users";
import {toast} from "react-hot-toast"


const UserProfileManageAccounts = () => {

    const {user} = useAuthContext();
    const {users, dispatch} = useUsersContext();
    const admin = user.admin;

    
    const [showMenu, setShowMenu] = useState(false);
    const [editMode, setEditMode] = useState(null);
 
   
    const [editableUser, setEditableUser] = useState({ id: null, name: "", email: "" });

    const handleShowMenu = () => {
        setShowMenu(!showMenu);
    }

    const handleClick = (event) => {
        if (!event.target.closest('.menuButton')) {
            setShowMenu(false)
        }
    };

    const editUser = (user) => {
        setEditMode(user._id);
        setEditableUser({ id: user._id, fistName: user.firstName, lastName:user.lastName, email: user.email });
    };

    const saveUser = async (userId) => {

        setEditMode(null);

        const update = editableUser
        
        const {json, ok} = await updateUser(user, userId, update);

        if(!ok){
            toast.error(json.error)    
        }else{
            dispatch({ type: "UPDATE_USERS", payload: json });
            toast.success(`${userId} updated Successfully!!`)
        }
        

    };


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditableUser({ ...editableUser, [name]: value });
    };

    const handleDeleteUser = async (userId) => {

        const {json, ok} = await deleteUser(user,userId)

        if(!ok){
            toast.error(json.error)
        }else{
            dispatch({type: 'DELETE_USER', payload: json});
            toast.success(`${userId} deleted Successfully!`)
        }
        
    };

    const resetPassword = async (userId) => {

        const resetPassword = process.env.REACT_APP_FOR_PASSWORD_RESET

        const update = {newPassword:resetPassword, confirmPassword:"x", currentPassword:"x"}

        const {json, ok} = await updateUserPassword(user, userId, update)

        if(!ok){
            toast.error(json.error)
        }else{
            toast.success(`${userId} password is reset`)
        }
        
    };


    
    return (
        <div className="flex flex-col min-h-screen bg-gray-100" onClick={handleClick}>
           
            <main className="xl:m-auto xl:w-10/12 flex-1 p-4">
                <div className="flex flex-col gap-4 items-start lg:flex-row">
                    <div className="flex gap-4 w-full lg:w-auto relative">
                        <figure className="flex flex-col w-full items-end gap-1 text-primary1 pl-2 lg:hidden">
                            <Link className="flex justify-center hover:opacity-70">
                                <img
                                    src={MenuDotsIcon}
                                    alt="menu icon"
                                    className="w-auto h-6 sm:h-7 md:h-8 menuButton"
                                    onClick={handleShowMenu}
                                />
                            </Link>
                        </figure>
                        <div className={`${showMenu ? "flex" : "hidden"} lg:flex`}><ProfileMenu admin={admin}/></div>
                    </div>
                    <div className="w-full">
                        <h1 className="text-2xl font-bold mb-4">Manage User Accounts</h1>
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white shadow-md rounded">
                                <thead>
                                    <tr>
                                        <th className="py-2 px-4 border-b-2 border-primary1 text-left">First Name</th>
                                        <th className="py-2 px-4 border-b-2 border-primary1 text-left">Last Name</th>
                                        <th className="py-2 px-4 border-b-2 border-primary1 text-left">Email</th>
                                        <th className="py-2 px-4 border-b-2 border-primary1 text-left">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users?.map((user) => (
                                        <tr key={user._id}>
                                            <td className="py-2 px-4 border-b border-gray-200">
                                                {editMode === user._id ? (
                                                    <input
                                                        type="text"
                                                        name="firstName"
                                                        value={editableUser.name}
                                                        onChange={handleInputChange}
                                                        className="border rounded px-2 py-1"
                                                    />
                                                ) : (
                                                    user.firstName
                                                )}
                                            </td>
                                            <td className="py-2 px-4 border-b border-gray-200">
                                                {editMode === user._id ? (
                                                    <input
                                                        type="text"
                                                        name="lastName"
                                                        value={editableUser.name}
                                                        onChange={handleInputChange}
                                                        className="border rounded px-2 py-1"
                                                    />
                                                ) : (
                                                    user.lastName
                                                )}
                                            </td>
                                            <td className="py-2 px-4 border-b border-gray-200">
                                                {editMode === user._id ? (
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        value={editableUser.email}
                                                        onChange={handleInputChange}
                                                        className="border rounded px-2 py-1"
                                                    />
                                                ) : (
                                                    user.email
                                                )}
                                            </td>
                                            <td className="py-2 px-4 border-b border-gray-200 flex  gap-1 space-y-2">        
                                                {editMode === user._id ? (
                                                    <button
                                                        className="bg-primary1 text-white px-4 py-1 rounded hover:bg-primary2"
                                                        onClick={() => saveUser(user._id)}
                                                    >
                                                        Save
                                                    </button>
                                                ) : (
                                                    <button
                                                        className="bg-primary1 text-white px-4 py-1 rounded hover:bg-primary2"
                                                        onClick={() => editUser(user)}
                                                    >
                                                        Edit
                                                    </button>
                                                )}
                                                <button
                                                    className="bg-primary1 text-white px-4 py-1 rounded hover:bg-primary2"
                                                    onClick={() => resetPassword(user._id)}
                                                >
                                                    Reset Password
                                                </button>
                                                <button
                                                    className="bg-primary2 text-white px-4 py-1 rounded hover:bg-primary2dark"
                                                    onClick={() => handleDeleteUser(user._id)}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
           
        </div>
    );
}

export default UserProfileManageAccounts;
