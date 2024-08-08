import { Link } from 'react-router-dom';
import hotdeal1 from "../../img/imgs/HotDeal1.png"
import hotdeal2 from "../../img/imgs/HotDeal2.png"
import CountdownTimer from '../OtherComponents/CountdownTimer';


const HotDealSection = ({endDate}) => {
    return ( 
        <div className='hotDeal-container '>

            <figure  className='hidden lg:flex'>
                <img src={hotdeal1} alt="hot deal img" className='w-96'/>
            </figure>
            
            <div className='flex flex-col items-center'>
                <CountdownTimer endDate={endDate} /> {/* Example: 2 days from now */}
                <div className='text-center my-5'>
                    <h1 className='text-3xl'>Hot Deals This Week</h1>
                    <p className='text-xl font-semibold'>Get up to 50% off on selected products. Limited time offer.</p>
                </div>
                
                <Link to={`/products?category=${"Hot Deals"}`}>
                    <button className="bg-primary2 text-white font-semibold py-2 px-6 rounded-full shadow-md hover:bg-primary2dark transition duration-300 ease-in-out transform hover:scale-105 mb-5">
                        Shop Now
                    </button>
                </Link>
            </div>


            <figure className='hidden lg:flex'>
                <img src={hotdeal2} alt="hot deal img" className='w-96'/>
            </figure>
            
        </div>
     );
}
 
export default HotDealSection;