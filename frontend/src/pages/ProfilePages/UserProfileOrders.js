
import ProfileMenu from "../../components/Menus/ProfileMenu";
import MenuDotsIcon from "../../img/icons/menuDotsIcon.svg";
import { Link } from "react-router-dom";
import { useState } from "react";
import OrderTable from "../../components/OtherComponents/OrderTable";
import LoadingOverlay from "../../components/OtherComponents/LoadingOverlay";


const UserProfileOrders = () => {


    const [showMenu, setShowMenu] = useState(false);

    const handleShowMenu = () => {
        setShowMenu(!showMenu);
    }

    const handleClick = (event) => {
        if (!event.target.closest('.menuButton')) {
            setShowMenu(false)
        }
    };


    const [updatingState, setUpdatingState] = useState(false)
  


    return (
        <div className="flex flex-col min-h-screen  bg-gray-100" onClick={handleClick}>
           
            <main className="xl:m-auto xl:w-10/12 flex-1">
                <div className="flex flex-col gap-4 items-start p-4 lg:flex-row">
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
                        <div className={`${showMenu ? "flex": "hidden"} lg:flex`}><ProfileMenu /></div>
                    </div>
                    <OrderTable setUpdatingState={setUpdatingState}/>
                </div>

                <LoadingOverlay show={updatingState} message={'Updating state...'} />
            </main>
            
        </div>
    );
}

export default UserProfileOrders;
