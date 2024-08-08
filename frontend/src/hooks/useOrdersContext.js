import {useContext} from "react"
import { OrdersContext } from "../contexts/OrdersContext"

export const useOrdersContext=()=>{

    const context = useContext(OrdersContext);

    if(!context){
        throw Error("useOrdersContext must be used an OrdersProvider")
    }

    return context;
}