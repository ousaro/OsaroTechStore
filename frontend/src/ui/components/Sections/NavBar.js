import Logo from '../../../assets/logo/logoWhite.svg';
import PhoneIcon from "../../../assets/icons/phoneIcon.svg"
import EmailIcon from "../../../assets/icons/emailIconWhite.svg"
import AdressIcon from "../../../assets/icons/locationIcon.svg"
import CurrencyIcon from "../../../assets/icons/dollarIcon.svg"
import DateIcon from "../../../assets/icons/dateIcon.svg"
import MenuIcon from "../../../assets/icons/menuIcon.svg"
import CartIcon from "../../../assets/icons/cartIcon.svg"
import WishlistIcon from "../../../assets/icons/heartIcon.svg"
import Menu from '../Menus/Menu';
import MenuLg from '../Menus/MenuLg';
import SearchBarInput from '../Inputs/SearchBarInput';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuthContext } from '../../../core/auth/useAuthContext';
import { format } from 'date-fns';


const NavBar = () => {

    const {user} = useAuthContext();
    const admin = user?.admin || false;

    const [showMenu, setShowMenu] = useState(false)
    const [cart, setCart] = useState([])
    const [favorites, setFavorites] = useState([])

    const OnClickShowMenuHandler = () =>{
        setShowMenu(!showMenu)
    }

    const handleClick = (event) => {
        if (!event.target.closest('.menuButton')) {
            setShowMenu(false)
        }
    };

    useEffect(() => {
        if (user) {
            setCart(user.cart);
            setFavorites(user.favorites);
        }
       
    }, [user]);

    return ( 
        <div className="relative z-40 bg-white shadow-sm" onClick={handleClick} >

            <Menu showMenu={showMenu} admin={admin} ></Menu>

            <nav className="bg-primary1 text-white">
                <div  className="w-full flex p-2 flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-slate-200 sm:justify-start sm:text-sm xl:w-10/12 xl:m-auto 2xl:text-md">
                    <figure className='flex gap-1'>
                        <img src={PhoneIcon} alt="phone icon" className='w-4 h-4 text-white sm:mt-1 2xl:w-6 2xl:h-6 2xl:mt-0'/>
                        <Link className="hover:text-primary4 pr-2">+65412785285</Link>
                    </figure>
                    <figure className='flex gap-1'>
                        <img src={EmailIcon} alt="email icon" className='w-4 h-4 text-white  sm:mt-12xl:w-6 2xl:h-6 2xl:mt-0'/>
                        <Link className="hover:text-primary4 pr-2">example.com</Link>
                    </figure>
                    <figure className='flex gap-1'>
                        <img src={AdressIcon} alt="adress icon" className='w-4 h-4 text-white  sm:mt-1 2xl:w-6 2xl:h-6 2xl:mt-0'/>
                        <Link className="hover:text-primary4 pr-2">1554 hay mohamadi</Link>
                    </figure>
                    <figure className='flex gap-1'>
                        <img src={CurrencyIcon} alt="currency icon" className='w-4 h-4 text-white  sm:mt-1 2xl:w-6 2xl:h-6 2xl:mt-0'/>
                        <Link className="hover:text-primary4 pr-2">USD</Link>
                    </figure>
                    <figure className='flex gap-1'>
                        <img src={DateIcon} alt="Date icon" className='w-4 h-4 text-white  sm:mt-1 2xl:w-6 2xl:h-6 2xl:mt-0'/>
                        <Link className="hover:text-primary4 pr-2">{format(new Date(), 'PPpp')}</Link>
                    </figure>
                </div>
            </nav>
            <main className='bg-white text-primary1'>
               
                <div  className="flex flex-col justify-center align-center text-xs sm:text-sm lg:flex-row lg:items-center lg:justify-between lg:gap-5 lg:py-4 xl:w-10/12 xl:m-auto 2xl:text-xl">
                    <figure className='flex justify-center align-center my-4 lg:my-0'>
                        <img src={Logo} alt="NavBar logo" className="w-auto h-12 rounded-md bg-primary1 px-3 py-2 sm:h-14 md:h-16 lg:h-16 2xl:h-20"/>
                    </figure>

                    <SearchBarInput  /> 

                    <div className='flex justify-center p-4 gap-4 sm:justify-end sm:gap-5 lg:p-0 lg:text-xs'>
                        <figure className={`${admin ? "hidden" : "flex"} flex-col text-center gap-1 relative text-primary1 lg:w-20`}>  
                            <Link to="/Cart" className='flex justify-center'><img src={CartIcon} alt="Cart icon" className='w-auto h-5 sm:h-7 md:h-8 lg:h-6'/></Link>
                            <p>Your Cart</p>
                            <div className='bg-primary2 text-white rounded-2xl w-5 h-5 grid justify-center content-center absolute left-1/2 bottom-3/4'>{cart.length}</div>
                        </figure>
                        <figure className={`${admin ? "hidden" : "flex"} flex-col text-center gap-1 relative text-primary1 lg:w-20`}>  
                            <Link to={`/Products?category=${"Favorite"}`} className='flex justify-center'><img src={WishlistIcon} alt="Wishlist icon" className='w-auto h-5 sm:h-7 md:h-8 lg:h-6'/></Link>
                            <p>Wishlist</p>
                            <div className='bg-primary2 text-white rounded-2xl w-5 h-5 grid justify-center content-center absolute left-1/2 bottom-3/4'>{favorites.length}</div>
                        </figure>
                        <figure className='flex flex-col gap-1 text-primary1 md:hidden'>  
                            <Link className='flex justify-center menuButton rounded-md border border-slate-200 p-2' onClick={OnClickShowMenuHandler}><img src={MenuIcon} alt="menu icon" className='w-auto h-5 sm:h-7 md:h-8'/></Link>
                            <p> Menu</p>
                        </figure>
                    </div>
                </div>
                
            </main>

            <div className='md:border-y md:border-slate-200'><MenuLg admin={admin}></MenuLg></div>
            
        </div>

     );
}
 
export default NavBar;
