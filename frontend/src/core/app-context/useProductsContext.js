import {useContext} from "react"
import { ProductsContext } from "./ProductsContext"

export const useProductsContext=()=>{

    const context = useContext(ProductsContext);

    if(!context){
        throw Error("useProductsContext must be used an ProductsProvider")
    }

    return context;
}