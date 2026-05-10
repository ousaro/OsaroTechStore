import { Link } from 'react-router-dom';
import hotdeal1 from "../../../assets/imgs/HotDeal1.png"
import hotdeal2 from "../../../assets/imgs/HotDeal2.png"
import CountdownTimer from '../OtherComponents/CountdownTimer';


const HotDealSection = ({endDate}) => {
    return ( 
        <div className='hotDeal-container'>

            <figure  className='hidden lg:flex'>
                <img src={hotdeal1} alt="hot deal img" className='w-96'/>
            </figure>
            
            <div className='flex max-w-xl flex-col items-center'>
                <CountdownTimer endDate={endDate} /> {/* Example: 2 days from now */}
                <div className='text-center my-5'>
                    <p className='mb-3 text-sm uppercase tracking-wide text-primary4'>Limited time</p>
                    <h1 className='text-3xl font-extrabold md:text-5xl'>Hot Deals This Week</h1>
                    <p className='mt-4 text-base font-medium leading-7 text-slate-200 md:text-xl'>Get up to 50% off on selected products. Limited time offer.</p>
                </div>
                
                <Link to={`/products?category=${"Hot Deals"}`}>
                    <button className="mb-5 rounded-md bg-primary2 px-6 py-3 font-semibold text-white shadow-lg shadow-primary2/25 transition duration-300 ease-in-out hover:bg-primary2dark active:translate-y-px">
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
