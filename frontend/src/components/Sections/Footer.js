import { Link } from "react-router-dom";
import Logo from '../../img/logo/OsaroTechStoreLogoWhite4.svg';
import PhoneIcon from "../../img/icons/phoneIcon.svg"
import EmailIcon from "../../img/icons/emailIconWhite.svg"
import AdressIcon from "../../img/icons/locationIcon.svg"
import facebookIcon from "../../img/icons/facebookIcon.svg"
import instagramIcon from "../../img/icons/instagramIcon.svg"
import pinterestIcon from "../../img/icons/pinterestIcon.svg"
import { useAuthContext } from "../../hooks/useAuthContext";
import { useCategoriesContext } from "../../hooks/useCategoriesContext";




const Footer = () => {

    const {user} = useAuthContext();
    const {categories} = useCategoriesContext();
    const admin = user.admin;

    

    return (  
        <footer className="footer bg-primary1 text-gray-400 border-t-2 border-slate-300 font-roboto">
            {/* Newsletter Signup */}
            <section className="newsletter bg-gray-200 py-12 text-gray-500 text-center border-b-4  border-primary2 ">
                    <h2 className="text-3xl font-bold mb-4">Stay Updated!</h2>
                    <p className="text-lg mb-6">Check your email to receive the latest news and exclusive offers.</p>
                   
            </section>
            <div className="text-sm  flex flex-col gap-10 p-4 pt-16 xl:m-auto xl:w-10/12 ">

                
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">

                    <div className="flex flex-col gap-4 pb-10">
                        <h3 className="text-white font-bold text-lg pb-2">ABOUT US</h3>

                        <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Molestiae officiis deleniti, dolorum nihil rem ipsa at asperiores! <br /><span className="text-primary2 hover:opacity-85"><Link to="/About">... See More</Link></span></p>

                        <div  className=" w-full flex flex-col gap-4 text-xs sm:text-sm">
                            <figure className='flex gap-2'>
                                <img src={PhoneIcon} alt="phone icon" className='w-4 h-4 text-white sm:mt-1 2xl:w-6 2xl:h-6 2xl:mt-0'/>
                                <Link className="hover:text-primary2  pr-2 ">+65412785285</Link>
                            </figure>
                            <figure className='flex gap-2'>
                                <img src={EmailIcon} alt="email icon" className='w-4 h-4 text-white  sm:mt-12xl:w-6 2xl:h-6 2xl:mt-0'/>
                                <Link className="hover:text-primary2 pr-2">example.com</Link>
                            </figure>
                            <figure className='flex gap-2'>
                                <img src={AdressIcon} alt="adress icon" className='w-4 h-4 text-white  sm:mt-1 2xl:w-6 2xl:h-6 2xl:mt-0'/>
                                <Link className="hover:text-primary2  pr-2">1554 hay mohamadi</Link>
                            </figure>
                            
                        </div>
                    </div>

                    <div className="pb-10">
                        <h3 className="text-white font-bold text-lg pb-5">CATEGORIES</h3>
                        <ul className="flex flex-col gap-5">
                            {categories.map((category) =>(
                                 <li key={category._id}><Link to={`/Products?category=${category.name}`}  className="hover:text-primary2">{category.name}</Link></li>
                            ))}
                           
                        </ul>
                    </div>

                    <div className="pb-10">
                        <h3 className="text-white font-bold text-lg pb-5">SERVICES</h3>
                        <ul className="flex flex-col gap-5">
                            <li><Link to="/UserProfile" className="hover:text-primary2">My Profile</Link></li>
                           {!admin &&  <li><Link to="/Cart" className="hover:text-primary2">View Cart</Link></li>}
                           {!admin &&  <li><Link to={`/Products?category=${"Favorite"}`} className="hover:text-primary2">Whishlist</Link></li>}
                            <li><Link to="/UserProfile/Orders" className="hover:text-primary2">{admin ? "Orders": "My Orders"}</Link></li>
                        </ul>
                    </div>

                    <div className="pb-10">
                        <h3 className="text-white font-bold text-lg pb-5">INFORMATION</h3>
                        <ul className="flex flex-col gap-5">
                            <li><Link className="hover:text-primary2">Privacy Policy</Link></li>
                            <li><Link className="hover:text-primary2">Terms & Conditions</Link></li>
                            <li><Link className="hover:text-primary2">FAQs</Link></li>
                            <li><Link className="hover:text-primary2">Contact Us</Link></li>
                            <figure className='flex gap-5 pt-3'>

                                <Link to="https://facebook.com" target="_blank" className="hover:opacity-80">
                                    <img src={facebookIcon} alt="facebook icon" className="w-6 h-6"/>
                                </Link>
                                <Link to="https://instagram.com" target="_blank" className="hover:opacity-80">
                                    <img src={instagramIcon} alt="instagram icon" className="w-6 h-6"/>
                                </Link>
                                <Link to="https://pinterest.com" target="_blank" className="hover:opacity-80">
                                    <img src={pinterestIcon} alt="pinterest icon" className="w-6 h-6"/>
                                </Link>
                               
                            </figure>
                        </ul>
                    </div>
                </div>

                <figure className='flex justify-center align-center'>
                    <img src={Logo} alt="NavBar logo" className="w-auto h-8 sm:h-10 md:h-12 lg:pl-4 2xl:h-16"/>
                </figure>

            </div>


            <div className="bg-primary5 p-5 text-xs">
                <div className="xl:m-auto xl:w-10/12 flex">
                    <p className="m-auto">Copyright &copy;2024 All right reverved</p>
                </div>
            </div>


        </footer>
    );
}
 
export default Footer
