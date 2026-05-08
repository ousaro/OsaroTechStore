import React , {createContext, useMemo, useReducer} from 'react';
import PropTypes from 'prop-types';


export const ProductsContext = createContext();

const initialState = {
    products:[],
    loading: true,
}

export const ProductsReducer = (state, action) =>{

    switch(action.type){
        case "SET_PRODUCTS":
            return {
                ...state,
                products: action.payload,
                loading: false
            }
        case "CREATE_PRODUCT":
            return {
                ...state,
                products:[action.payload, ...state.products],
                loading: false,
            }
        case "DELETE_PRODUCT":
            return {
                ...state,
                products:state.products.filter((p)=>p._id !== action.payload._id),
                loading :false
            }
        case 'UPDATE_PRODUCT': 
            return {
                ...state, // spread the existing state
                products: state.products.map((p) => {
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

export const ProductsProvider = ({ children })=>{
    
    const [state, dispatch] = useReducer(ProductsReducer, initialState)
    const value = useMemo(() => ({...state, dispatch}), [state, dispatch]);

    return (
        <ProductsContext.Provider value={value}>
            {children}
        </ProductsContext.Provider>
    )
}

ProductsProvider.propTypes = {
    children: PropTypes.node.isRequired,
};
