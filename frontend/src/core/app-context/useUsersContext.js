import {useContext} from "react"
import  {UsersContext} from "./UsersContext";

export const useUsersContext=()=>{

    const context = useContext(UsersContext);

    if(!context){
        throw Error("useUsersContext must be used an UsersProvider")
    }

    return context;
}