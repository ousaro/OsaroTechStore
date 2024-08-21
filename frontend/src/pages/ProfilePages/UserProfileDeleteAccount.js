
import { useNavigate } from "react-router-dom";
import ProfileMenu from "../../components/Menus/ProfileMenu";
import MenuDotsIcon from "../../img/icons/menuDotsIcon.svg";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useAuthContext } from "../../hooks/useAuthContext";
import { deleteUser } from "../../api/users";
import {toast} from "react-hot-toast"
import LoadingOverlay from "../../components/OtherComponents/LoadingOverlay";

const UserProfileDeletePassword = () => {

    const {user , dispatch} = useAuthContext()
    const admin = user.admin;
    
    const navigate = useNavigate();

    const [showMenu, setShowMenu] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [error, setError] = useState(null)
    const [deleting, setDeleting] = useState(false)

    const handleShowMenu = () => {
        setShowMenu(!showMenu);
    };

    const handleClick = (event) => {
        if (!event.target.closest('.menuButton')) {
            setShowMenu(false)
        }
    };

    const onClickHandler = async () => {
        // Show alert before deleting account
        setShowAlert(true);
    };

    const confirmDelete = async () => {

        setDeleting(true)
        const promise = deleteUser(user, user._id);
        
        toast.promise(
            promise,
            {
                pending: 'Deleting user...',
                success: 'User deleted successfully!',
                error: {
                    render({ data }) {
                        // You can access the error object with data
                        return data.error.message;
                    }
                }
            }
        );
    
        const { ok, error } = await promise;
    
        if (!ok) {
            setError(error);
        } else {
            localStorage.removeItem('user');
            dispatch({ type: 'LOGOUT' });
            navigate("/LogIn");
        }

        setDeleting(false)
    };


    if(error){
        return (
          <div className="flex justify-center items-center min-h-screen">
            <div className=" text-3xl text-primary2">Error : {error.message} </div>
          </div>
        );
      }

    return (
        <div className="flex flex-col min-h-screen bg-gray-100 " onClick={handleClick}>
           
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
                    <div className="flex flex-col items-start w-full">
                        <h1 className="text-xl font-bold text-primary2 mb-4">Delete Account</h1>
                        <div className="mt-8 p-4 bg-white shadow w-full rounded-md">
                            
                            <h2 className="text-xl font-bold text-primary1 mb-4">
                                Are you sure you want to delete your account?
                            </h2>
                            <p className="text-gray-600 mb-6">
                                This action cannot be undone. Once you delete your account, all your data will be permanently removed.
                            </p>
                            <div className="flex justify-end">
                                <button
                                    className="bg-primary2 text-white px-4 py-2 rounded-md hover:bg-primary2dark transition duration-300"
                                    onClick={onClickHandler}
                                >
                                    Delete Account
                                </button>
                            </div>
                            {showAlert && (
                                <div className="mt-4 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
                                    <p className="font-bold">Warning</p>
                                    <p>Are you absolutely sure you want to delete your account? This action is irreversible.</p>
                                    <div className="mt-4 flex justify-end">
                                        <button
                                            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md mr-2 hover:bg-gray-400 transition duration-300"
                                            onClick={() => setShowAlert(false)}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            className="bg-primary2 text-white px-4 py-2 rounded-md hover:bg-primary2dark transition duration-300"
                                            onClick={confirmDelete}
                                        >
                                            Confirm Delete
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <LoadingOverlay  show={deleting} message={"Deleting account..."}/>
            </main>
            
        </div>
    );
};

export default UserProfileDeletePassword;
