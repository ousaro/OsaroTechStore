import { scrollLeft, scrollRight } from "../../utils/utils";

const NavigationButton = ({setCanScrollAutomatic, containerRef}) => {
    return ( 
        <div className='flex gap-3 justify-end mt-1'>
            <button onClick={() => {scrollLeft(containerRef)
                setCanScrollAutomatic(false)
            }} className="scroll-button w-8 h-8 bg-white text-primary1 p-1 rounded-full shadow-md hover:bg-primary2 hover:text-white transition duration-300 ease-in-out">
                &lt;
            </button>
            <button onClick={() =>  {scrollRight(containerRef)
                setCanScrollAutomatic(false)
            }} className="scroll-button w-8 h-8 bg-white text-primary1 p-1 rounded-full shadow-md hover:bg-primary2 hover:text-white transition duration-300 ease-in-out">
                &gt;
            </button>
        </div>
     );
}
 
export default NavigationButton;