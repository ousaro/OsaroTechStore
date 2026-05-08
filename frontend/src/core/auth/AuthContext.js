import {createContext, useReducer, useEffect} from 'react';


export const AuthContext = createContext();

const initialState = {
    user: null,
    loading: true // Add loading state to the initial state
  };

  export const AuthReducer = (state, action) => {
    switch (action.type) {
        case 'LOGIN':
            return { ...state, user: action.payload, loading: false };
        case 'LOGOUT':
            return { ...state, user: null, loading: false };
        case 'SET_LOADING':
            return { ...state, loading: action.payload };
        case 'UPDATE_USER':
            return { ...state, user: { ...state.user, ...action.payload } }; // Merge the existing user data with the updated data
        default:
            return state;
    }
};


export const AuthContextProvider = (props) => {

    const [state, dispatch] = useReducer(AuthReducer, initialState);

    // we use this to make the front end knows if the loaclestorage is empty or not every time we refresh
    useEffect(() => {

        const user = JSON.parse(localStorage.getItem('user'));

        if (user) {
            dispatch({
              type: 'LOGIN',
              payload: user
            });
          } else { // if the user is not in the local storage we set the loading to false so the front end knows that the user is not logged in
            dispatch({
              type: 'SET_LOADING',
              payload: false
            });
          }

    }, []);

    return (
        <AuthContext.Provider value={{...state, dispatch}}> {/* ...state its means user and loading in this case */}
            {props.children}
        </AuthContext.Provider>
    )

}