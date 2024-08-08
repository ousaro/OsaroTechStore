export const getAllOrders = async (user) => {
    try{
        
        const response = await fetch('/api/orders',{
          headers: {
            "Authorization" : `Bearer ${user.token}`
          }
        });
  
        const json = await response.json();

        return {json: json, ok: response.ok}

       
    }catch(error){
      return {error: error}
    } 
    
};




export const addNewOrder = async (user, orderData) => {
      
    try {
        // Send shipping address and session details to your database
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          },
          body: JSON.stringify(orderData),
        });

        const json = await response.json();

        return {json: json, ok: response.ok}
  
        
      } catch (error) {
        return {error: error}
      }
}


export const updateOrder = async (user, orderId, update) =>{

    try{

        const response = await fetch(`/api/orders/${orderId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${user.token}`
            },
            body: JSON.stringify(update)
        });

       

        const json = await response.json();
        
        return {json: json, ok: response.ok}
        

    }catch(error){
        return {error: error}
    }
  
}


export const deleteOrder = async (user, orderId) =>{

    try {
        const response = await fetch(`/api/orders/${orderId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${user.token}`
            },
        });
    
      
    
        const json = await response.json();

        return {json: json, ok: response.ok}
       
       
    } catch (error) {
        return {error: error}
    }
}