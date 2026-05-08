import React , {createContext, useReducer} from 'react';


export const UsersContext = createContext();

const initialState = {
    users:[],
    loading: true,
}

export const UsersReducer = (state, action) =>{

    switch(action.type){
        case "SET_USERS":
            return {
                ...state,
                users: action.payload,
                loading: false
            }
        case "CREATE_USER":
            return {
                ...state,
                users:[action.payload, ...state.users],
                loading: false,
            }
        case "DELETE_USER":
            return {
                ...state,
                users:state.users.filter((p)=>p._id !== action.payload._id),
                loading :false
            }
        case 'UPDATE_USERS': 
            return {
                ...state, // spread the existing state
                users: state.users.map((p) => {
                    if (p._id === action.payload._id) {
                        return action.payload; // update the matching user
                    }
                    return p; // return the unchanged user
                }),
                loading: false // set loading to false
            }
        
        default:
            return state; 
    }
}

export const UsersProvider = (props)=>{
    
    const [state, dispatch] = useReducer(UsersReducer, initialState)

    return (
        <UsersContext.Provider value={{...state,dispatch}}>
            {props.children}
        </UsersContext.Provider>
    )
}

