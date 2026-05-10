import { Link } from 'react-router-dom';


const HeroSection = () => {
    return ( 
        
         <section className="hero">
            <div className="relative z-10 w-full xl:w-10/12 xl:m-auto">
                <div className="max-w-2xl">
                    <p className="mb-4 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-primary4 ring-1 ring-white/20">
                        Tech essentials, curated for daily use
                    </p>
                    <h1 className="mb-5 text-4xl font-extrabold leading-tight sm:text-5xl md:text-6xl">
                        Upgrade your setup with gear that feels right.
                    </h1>
                    <p className="mb-8 max-w-xl text-base leading-7 text-slate-200 md:text-xl">
                        Browse phones, accessories, and hot deals with a cleaner shopping experience from discovery to checkout.
                    </p>
                    <Link to="/products">
                        <button className="rounded-md bg-primary2 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary2/25 transition duration-300 ease-in-out hover:bg-primary2dark focus:outline-none focus:ring-2 focus:ring-primary4 active:translate-y-px md:text-base">
                            Shop products
                        </button>
                    </Link>
                </div>
            </div>
        </section>
     );
}
 
export default HeroSection;
