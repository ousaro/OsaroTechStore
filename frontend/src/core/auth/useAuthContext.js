import { useContext } from "react";
import { AuthContext } from "./AuthContext";


export const useAuthContext = () => {

    const context = useContext(AuthContext);

    if(!context){
        throw Error('useAuthContext must be used within an AuthContextProvider')
    }

    return context;
}