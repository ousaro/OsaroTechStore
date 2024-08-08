import Logo from '../../img/logo/logoWhite.svg';
import PhoneIcon from "../../img/icons/phoneIcon.svg"
import EmailIcon from "../../img/icons/emailIconWhite.svg"
import AdressIcon from "../../img/icons/locationIcon.svg"
import CurrencyIcon from "../../img/icons/dollarIcon.svg"
import DateIcon from "../../img/icons/dateIcon.svg"
import MenuIcon from "../../img/icons/menuIcon.svg"
import CartIcon from "../../img/icons/cartIcon.svg"
import WishlistIcon from "../../img/icons/heartIcon.svg"
import Menu from '../Menus/Menu';
import MenuLg from '../Menus/MenuLg';
import SearchBarInput from '../Inputs/SearchBarInput';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuthContext } from '../../hooks/useAuthContext';
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
        <div className=" relative bg-white" onClick={handleClick} >

            <Menu showMenu={showMenu} admin={admin} ></Menu>

            <nav className="bg-primary5 text-white">
                <div  className=" w-full flex p-2 flex-wrap gap-2 text-xs sm:text-sm xl:w-10/12 xl:m-auto 2xl:text-md">
                    <figure className='flex gap-1'>
                        <img src={PhoneIcon} alt="phone icon" className='w-4 h-4 text-white sm:mt-1 2xl:w-6 2xl:h-6 2xl:mt-0'/>
                        <Link className="hover:text-primary2  pr-2 ">+65412785285</Link>
                    </figure>
                    <figure className='flex gap-1'>
                        <img src={EmailIcon} alt="email icon" className='w-4 h-4 text-white  sm:mt-12xl:w-6 2xl:h-6 2xl:mt-0'/>
                        <Link className="hover:text-primary2 pr-2">example.com</Link>
                    </figure>
                    <figure className='flex gap-1'>
                        <img src={AdressIcon} alt="adress icon" className='w-4 h-4 text-white  sm:mt-1 2xl:w-6 2xl:h-6 2xl:mt-0'/>
                        <Link className="hover:text-primary2  pr-2">1554 hay mohamadi</Link>
                    </figure>
                    <figure className='flex gap-1'>
                        <img src={CurrencyIcon} alt="currency icon" className='w-4 h-4 text-white  sm:mt-1 2xl:w-6 2xl:h-6 2xl:mt-0'/>
                        <Link className="hover:text-primary2  pr-2">USD</Link>
                    </figure>
                    <figure className='flex gap-1'>
                        <img src={DateIcon} alt="Date icon" className='w-4 h-4 text-white  sm:mt-1 2xl:w-6 2xl:h-6 2xl:mt-0'/>
                        <Link className="hover:text-primary2 pr-2">{format(new Date(), 'PPpp')}</Link>
                    </figure>
                </div>
            </nav>
            <main className='bg-primary1 text-primary1 border-b-4 border-primary2'>
               
                <div  className="flex flex-col justify-center align-center text-xs sm:text-sm lg:flex-row lg:justify-stretch lg:gap-5 lg:py-5 xl:w-10/12 xl:m-auto 2xl:text-xl">
                    <figure className='flex justify-center align-center my-5 lg:my-0'>
                        <img src={Logo} alt="NavBar logo" className="w-auto h-14 sm:h-16 md:h-20 lg:h-20 lg:pl-4 2xl:h-28"/>
                    </figure>

                    <SearchBarInput  /> 

                    <div className='flex justify-between p-5 gap-4 sm:justify-end sm:gap-10 lg:gap-3 lg:text-xs 2xl:mt-5'>
                        <figure className={`${admin ? "hidden" : "flex"} flex-col text-center gap-1 relative text-white lg:w-20`}>  
                            <Link to="/Cart" className='flex justify-center'><img src={CartIcon} alt="Cart icon" className='w-auto h-5 sm:h-7 md:h-8 lg:h-6'/></Link>
                            <p> You Cart</p>
                            <div className='bg-primary2 rounded-2xl w-5 h-5 grid justify-center content-center absolute left-1/2 bottom-3/4'>{cart.length}</div>
                        </figure>
                        <figure className={`${admin ? "hidden" : "flex"} flex-col text-center gap-1 relative text-white lg:w-20`}>  
                            <Link to={`/Products?category=${"Favorite"}`} className='flex justify-center'><img src={WishlistIcon} alt="Wishlist icon" className='w-auto h-5 sm:h-7 md:h-8 lg:h-6'/></Link>
                            <p> You Wishlist</p>
                            <div className='bg-primary2 rounded-2xl w-5 h-5 grid  justify-center content-center absolute left-1/2 bottom-3/4'>{favorites.length}</div>
                        </figure>
                        <figure className='flex flex-col gap-1 text-white md:hidden'>  
                            <Link className='flex justify-center menuButton' onClick={OnClickShowMenuHandler}><img src={MenuIcon} alt="menu icon" className='w-auto h-5  sm:h-7 md:h-8 '/></Link>
                            <p> Menu</p>
                        </figure>
                    </div>
                </div>
                
            </main>

            <div className='md:border-b-2   md:border-primary1light'><MenuLg admin={admin}></MenuLg></div>
            
        </div>

     );
}
 
export default NavBar;