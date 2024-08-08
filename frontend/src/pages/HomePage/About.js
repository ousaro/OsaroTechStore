import React from "react";
import { Link } from "react-router-dom";
import Logo from '../../img/logo/OsaroTechStoreLogo4.svg';
import PhoneIcon from "../../img/icons/phoneIcon.svg"
import EmailIcon from "../../img/icons/emailIconWhite.svg"
import AdressIcon from "../../img/icons/locationIcon.svg"
import facebookIcon from "../../img/icons/facebookIcon.svg"
import instagramIcon from "../../img/icons/instagramIcon.svg"
import pinterestIcon from "../../img/icons/pinterestIcon.svg"


const About = () => {
    return (
        <div className="bg-gray-200 text-primary1 font-sans">      
            <div className="mb-1 px-6">
                    <img src={Logo} alt="OsaroTech Logo" className="w-25 h-20 mx-auto mt-10"/>
            </div>

            <div className="max-w-4xl mx-auto p-10 rounded-lg shadow-lg">
              
                <h1 className="text-primary2 text-3xl font-bold text-center mb-6">About Us</h1>
                <p className="mb-4 text-lg leading-relaxed">
                    Welcome to OsaroTech, your number one source for all things tech. We're dedicated to providing you the best of tech devices, with a focus on dependability, customer service, and uniqueness.
                </p>
                <p className="mb-4 text-lg leading-relaxed">
                    Founded in 2024, OsaroTech has come a long way from its beginnings. When we first started out, our passion for cutting-edge technology drove us to start our own business.
                </p>
                <p className="mb-4 text-lg leading-relaxed">
                    We hope you enjoy our products as much as we enjoy offering them to you. If you have any questions or comments, please don't hesitate to contact us.
                </p>
                <p className="text-lg leading-relaxed">
                    Sincerely, <br/> The OsaroTech Team
                </p>

                <div className="mt-10">
                    <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
                    <div className="w-full flex flex-col gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <img src={PhoneIcon} alt="phone icon" className="w-5 h-5"/>
                            <a href="tel:+65412785285" className="hover:text-primary2">+65412785285</a>
                        </div>
                        <div className="flex items-center gap-2">
                            <img src={EmailIcon} alt="email icon" className="w-5 h-5"/>
                            <a href="mailto:example@example.com" className="hover:text-primary2">example@example.com</a>
                        </div>
                        <div className="flex items-center gap-2">
                            <img src={AdressIcon} alt="address icon" className="w-5 h-5"/>
                            <span>1554 Hay Mohamadi</span>
                        </div>
                    </div>

                    <h2 className="text-2xl font-semibold mt-10 mb-4">Follow Us</h2>
                    <div className="flex gap-5">
                        <Link to="https://facebook.com" target="_blank"  className="hover:opacity-80">
                            <img src={facebookIcon} alt="facebook icon" className="w-6 h-6"/>
                        </Link>
                        <Link to="https://instagram.com" target="_blank" className="hover:opacity-80">
                            <img src={instagramIcon} alt="instagram icon" className="w-6 h-6"/>
                        </Link>
                        <Link to="https://pinterest.com" target="_blank" className="hover:opacity-80">
                            <img src={pinterestIcon} alt="pinterest icon" className="w-6 h-6"/>
                        </Link>
                    </div>
                </div>

              


            </div>
        </div>
    );
};

export default About;