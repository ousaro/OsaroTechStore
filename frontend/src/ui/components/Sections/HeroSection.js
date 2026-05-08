import { Link } from 'react-router-dom';


const HeroSection = () => {
    return ( 
        
         <section className="hero">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-4">Welcome to our Tech Store!</h1>
            <p className="text-xl md:text-2xl mb-8">Discover the latest in tech gadgets and accessories</p>
            <Link to="/products">
                <button className="bg-primary2 text-white font-semibold py-2 px-6 rounded-full shadow-sm hover:bg-primary2dark transition duration-300 ease-in-out transform hover:scale-105">
                    Shop Now
                </button>
            </Link>
        </section>
     );
}
 
export default HeroSection;