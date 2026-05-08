import React , {createContext, useMemo, useReducer} from 'react';
import PropTypes from 'prop-types';


export const CategoriesContext = createContext();

const initialCategoryState = {
    categories :[],
    
}

export const CategoriesReducer = (state, action) =>{

    switch(action.type){
        
        case "SET_CATEGORIES":
           
            return {
                ...state,
                categories: action.payload,
                
            }
        case "CREATE_CATEGORY":
           
            return {
                ...state,
                categories:[action.payload, ...state.categories],
               
            }
        case "DELETE_CATEGORY":
           
            return {
                ...state,
                categories:state.categories.filter((p)=>p._id !== action.payload._id),
                
            } 
        default:
            return state; 
    }
}

export const CategoriesProvider = ({ children })=>{
    
    const [state, dispatch] = useReducer(CategoriesReducer, initialCategoryState)
    const value = useMemo(() => ({...state, dispatch}), [state, dispatch]);

    return (
        <CategoriesContext.Provider value={value}>
            {children}
        </CategoriesContext.Provider>
    )
}

CategoriesProvider.propTypes = {
    children: PropTypes.node.isRequired,
};
