import { Link } from 'react-router-dom';
import {toast} from "react-hot-toast"

const FilterComponent = ({ sectionTitle, listItems, selectedItemList }) => {
    return (
        <div className='mb-8'>
            <h1 className="mb-4 border-b border-slate-200 pb-3 text-lg font-extrabold text-primary1 md:w-full">{sectionTitle}</h1>
            <ul className="space-y-2">
                {listItems.map((item, index) => (
                    <li
                        key={index}
                        className={`cursor-pointer rounded-md px-3 py-2 text-sm font-semibold transition hover:bg-primary4 hover:text-primary2 ${
                            selectedItemList === item ? 'bg-primary4 text-primary2' : 'text-slate-600'
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
 
