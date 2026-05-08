import { Link } from 'react-router-dom';
import {toast} from "react-hot-toast"

const FilterComponent = ({ sectionTitle, listItems, selectedItemList }) => {
    return (
        <div className='mt-10'>
            <h1 className="text-primary1 text-2xl border-b-primary2 border-b md:w-full font-bold mb-6">{sectionTitle}</h1>
            <ul className="space-y-4">
                {listItems.map((item, index) => (
                    <li
                        key={index}
                        className={`cursor-pointer p-1 flex text-md font-light text-center hover:text-primary2 hover:opacity-80 ${
                            selectedItemList === item ? 'text-primary2' : 'text-primary1'
                        }`}
                    >
                        <Link to={`/Products?category=${item}`} onClick={()=> toast.success(`${item}`)}>
                            <h2 className="mb-1">{item}</h2>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default FilterComponent;
 