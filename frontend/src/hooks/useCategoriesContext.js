import {useContext} from "react"
import { CategoriesContext } from "../contexts/CategoriesContext";

export const useCategoriesContext=()=>{

    const context = useContext(CategoriesContext);

    if(!context){
        throw Error("useCategoriesContext must be used an CategoriesProvider")
    }

    return context;
}