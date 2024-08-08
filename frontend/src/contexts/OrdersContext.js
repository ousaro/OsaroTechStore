import React , {createContext, useReducer} from 'react';


export const OrdersContext = createContext();

const initialState = {
    orders:[],
    loading: true,
}

export const OrdersReducer = (state, action) =>{

    switch(action.type){
        case "SET_ORDERS":
            return {
                ...state,
                orders: action.payload,
                loading: false
            }
        case "CREATE_ORDER":
            return {
                ...state,
                orders:[action.payload, ...state.orders],
                loading: false,
            }
        case "DELETE_ORDER":
            return {
                ...state,
                orders:state.orders.filter((p)=>p._id !== action.payload._id),
                loading :false
            }
        case 'UPDATE_ORDER': 
            return {
                ...state, // spread the existing state
                orders: state.orders.map((p) => {
                    if (p._id === action.payload._id) {
                        return action.payload; // update the matching product
                    }
                    return p; // return the unchanged product
                }),
                loading: false // set loading to false
            }
        default:
            return state; 
    }
}

export const OrdersProvider = (props)=>{
    
    const [state, dispatch] = useReducer(OrdersReducer, initialState)

    return (
        <OrdersContext.Provider value={{...state,dispatch}}>
            {props.children}
        </OrdersContext.Provider>
    )
}

