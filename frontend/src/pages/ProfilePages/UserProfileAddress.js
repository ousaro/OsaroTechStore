import ProfileMenu from "../../components/Menus/ProfileMenu";
import MenuDotsIcon from "../../img/icons/menuDotsIcon.svg";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useAuthContext } from "../../hooks/useAuthContext";
import { updateUser } from "../../api/users";
import { updateLocalStorage } from "../../utils/utils";
import { toast } from 'react-hot-toast';

const UserProfileAddress = () => {

    const {user, dispatch} = useAuthContext();
    const admin = user.admin;

    const [showMenu, setShowMenu] = useState(false);

    const [userAddress, setUserAddress] = useState({
        address: user.address,
        city: user.city,
        country: user.country,
        state: user.state,
        postalCode:user.postalCode
    });

    const [isEditing, setIsEditing] = useState(false);

    const handleShowMenu = () => {
        setShowMenu(!showMenu);
    };
  
    const handleClick = (event) => {
        if (!event.target.closest('.menuButton')) {
            setShowMenu(false)
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserAddress((prevUser) => ({
            ...prevUser,
            [name]: value
        }));
    }

    const handleSave = async (e) => {
        e.preventDefault();
        
        setIsEditing(false);

        const update = userAddress;

        const { json, ok } = await updateUser(user, user._id, update);;

        if (!ok) {
           toast.error(json.error)
        } else {
            updateLocalStorage(json);
            dispatch({ type: "UPDATE_USER", payload: json });
            toast.success('User address updated successfully!');
        }
    };


    const handleEdit = () => {
        setIsEditing(true);
    }



  return (
    <div className="flex flex-col min-h-screen bg-gray-100" onClick={handleClick}>
     
      <main className="flex-grow xl:m-auto xl:w-10/12 p-4">
        <div className="flex flex-col gap-4 items-start lg:flex-row">
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
            <div className="flex-grow w-full">
                
                <h1 className="text-xl font-bold text-primary1 mb-4">Address Information</h1>
                <form className="space-y-4" onSubmit={handleSave}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="address">Address</label>
                            <input
                            type="text"
                            name="address"
                            id="address"
                            value={userAddress.address}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded mt-1"
                            readOnly={!isEditing}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="city">City</label>
                            <input
                            type="text"
                            name="city"
                            id="city"
                            value={userAddress.city}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded mt-1"
                            readOnly={!isEditing}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="country">Country</label>
                            <input
                            type="text"
                            name="country"
                            id="country"
                            value={userAddress.country}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded mt-1"
                            readOnly={!isEditing}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="state">State/Province</label>
                            <input
                            type="text"
                            name="state"
                            id="state"
                            value={userAddress.state}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded mt-1"
                            readOnly={!isEditing}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="postalCode">Zip/Postal Code</label>
                            <input
                            type="text"
                            name="postalCode"
                            id="postalCode"
                            value={userAddress.postalCode}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded mt-1"
                            readOnly={!isEditing}
                            />
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
                                        Edit Address
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
};

export default UserProfileAddress;
