

export const getAllProducts = async (user) => {
   
    try {
      const response = await fetch('/api/products', {
        headers: {
          "Authorization": `Bearer ${user.token}`
        }
      });

      
      const json = await response.json();
      

      return {json: json, ok: response.ok};


    } catch (error) {
        
      return { error: error };
    }
  };


export const getProductById = async (user, productId) => {

    let isLoading  = true;
    try {
      
      const response = await fetch(`/api/products/${productId}`, {
        headers: {
          "Authorization": `Bearer ${user.token}`,
        },
      });

      const json = await response.json().then(isLoading = false);

     
      return { json: json, ok : response.ok, isLoading: isLoading}
    
      
    } catch (error) {

        isLoading = false;
        return {error: error,isLoading : isLoading}

    }

  };


  export const addNewProduct = async (user, product) => {
        
        try{
            const response = await fetch("api/products",{
                method : "POST",
                body: JSON.stringify(product),
                headers:{
                    "content-Type": "application/json",
                    "Authorization" : `Bearer ${user.token}`
                }
            })

            const json = await response.json()

          return {json: json, ok: response.ok};

        } catch (error) {
            return { error: error, emptyFields: [] };
        } 
  }


export const updateProduct = async (user, productId, update) =>{

    try {
        const response = await fetch(`/api/products/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${user.token}`
            },
            body: JSON.stringify(update)
        });


        const json = await response.json();
      
        return {json : json, ok: response.ok}
      
      

    } catch (error) {
        
        return {error : error}
     
    }
}

export const deleteProduct = async (user, productId) =>{

      try {
        const response = await fetch(`/api/products/${productId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${user.token}`
            },
        });

      

        const json = await response.json();
      
        return {json:json, ok: response.ok}
      

    } catch (error) {
      return {error: error}
    }
}