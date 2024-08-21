import Select from 'react-select';
import { useOrdersContext } from '../../hooks/useOrdersContext';
import { useAuthContext } from '../../hooks/useAuthContext';
import { format } from 'date-fns';
import { updateOrder, deleteOrder } from '../../api/orders';
import {toast} from "react-hot-toast"
import { useEffect, useState } from 'react';


const OrderTable = ({setUpdatingState}) => {
   
    const {user} = useAuthContext();
    const {orders, dispatch} = useOrdersContext();

  
    const admin = user.admin;
    
    const [userOrder, setUserOrder] = useState([]);

     // filter the orders with the user id if isn't admin
     useEffect(() => {
        if (!admin) {
            const filteredOrders = orders.filter(order => order.ownerId === user._id);
            setUserOrder(filteredOrders);
        } else {
            setUserOrder(orders);
        }
    }, [admin, orders, user._id]);

    
    const statusColors = {
        Pending: "bg-orange-600",
        Shipped: "bg-blue-600",
        Delivered: "bg-green-600",
        Cancelled: "bg-red-600"
    };

    const statusOptions = [
        { value: 'Pending', label: 'Pending', color: 'orange' },
        { value: 'Shipped', label: 'Shipped', color: 'blue' },
        { value: 'Delivered', label: 'Delivered', color: 'green' },
        { value: 'Cancelled', label: 'Cancelled', color: 'red' }
    ];

 

    const customStyles = {
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected ? state.data.color : state.isFocused ? 'lightgray' : null,
            color: state.isSelected ? 'white' : 'black',
            
        }),
        control: (provided, state) => {
            const selectedOption = statusOptions.find(option => option.value === state.getValue()[0]?.value);
            return {
                ...provided,
                backgroundColor: selectedOption ? selectedOption.color : 'white',
                borderColor: 'gray',
                '&:hover': {
                    borderColor: 'blue'
                },
                color: selectedOption ? 'white' : 'black',
               
            };
        },
        singleValue: (provided, state) => {
            return {
                ...provided,
                color: 'white'
            };
        },
        menu: (provided) => ({
            ...provided,
            zIndex: 20,
           
        })
    };


    const handleStatusChange = async (orderID, newStatus) => {

        setUpdatingState(true)
      
        if(newStatus !== "Cancelled"){

            const update = {status: newStatus}

            const {json, ok}= await updateOrder(user, orderID, update)

           
            if(!ok){
                toast.error(json.error)
            }else{
                dispatch({ type: "UPDATE_ORDER", payload: json });
                toast.success(`${orderID} status changed Successfully!`)
            }
         
        }
        else{

            const {json, ok}= await deleteOrder(user, orderID)

            if(!ok){
                toast.error(json.error)
            }
            else{
                dispatch({ type: "DELETE_ORDER", payload: json });
                toast.success(`${orderID} deleted Successfully!`)
            }
           
            
        }

        setUpdatingState(false)

       
    };

    if (!orders) {
        return (
          <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-blue-500"></div>
          </div>
        );
      }

   
    return (
        <div className="w-full">
            <h1 className="text-xl font-bold text-primary1 mb-4">Order History</h1>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead>
                        <tr>
                            <th className="py-2 px-4 border-b-2 border-primary1 text-left">Order ID</th>
                            {admin && <th className="py-2 px-4 border-b-2 border-primary1 text-left">Owner ID</th>}
                            <th className="py-2 px-4 border-b-2 border-primary1 text-left">Order Date</th>
                            <th className="py-2 px-4 border-b-2 border-primary1 text-left">Total Price</th>
                            <th className="py-2 px-4 border-b-2 border-primary1 text-left">Status</th>
                            
                        </tr>
                    </thead>
                    <tbody>
                        {userOrder.map(order => (
                            <tr key={order._id}>
                                <td className="py-2 px-4 border-b border-gray-200">{order._id}</td>
                                {admin && <td className="py-2 px-4 border-b border-gray-200">{order.ownerId}</td>}
                                <td className="py-2 px-4 border-b border-gray-200">{format(new Date(order.createdAt), 'PPpp')}</td>
                                <td className="py-2 px-4 border-b border-gray-200">${order.totalPrice}</td>
                                <td className="py-2 px-4 border-b border-gray-200">
                                    {admin ? (
                                        <Select
                                            value={statusOptions.find(option => option.value === order.status)}
                                            onChange={(selectedOption) => handleStatusChange(order._id, selectedOption.value)}
                                            options={statusOptions}
                                            styles={customStyles}
                                        />
                                    ) : (
                                        <span className={`py-2 px-4 text-white ${statusColors[order.status]}`}>{order.status}</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          
        </div>
    );
};

export default OrderTable;
