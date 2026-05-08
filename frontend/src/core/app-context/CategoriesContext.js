import React , {createContext, useReducer} from 'react';


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

export const CategoriesProvider = (props)=>{
    
    const [state, dispatch] = useReducer(CategoriesReducer, initialCategoryState)

    return (
        <CategoriesContext.Provider value={{...state,dispatch}}>
            {props.children}
        </CategoriesContext.Provider>
    )
}

