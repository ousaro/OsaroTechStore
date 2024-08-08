

export const getAllCategories = async (user) => {

    
    try{ 
        const response = await fetch('/api/categories', {
          headers: {
            'Authorization' :  `Bearer ${user.token}` 
          }
        });

        const json = await response.json();

        return {json: json, ok: response.ok};  

     

     }catch(error){
       
        return {error : error}
      } 
    
  };



export const addNewCategory = async (user, category) => {
        
       try{

        const response = await fetch("api/categories", {
            method: "POST",
            body: JSON.stringify(category),
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${user.token}`
            }
        });

        const json = await response.json();

        return {json: json, ok: response.ok};
        
       }catch(error){
            return { error: error, emptyFields: [] };
       }
}




export const deleteCategory = async (user, categoryId) =>{

    try {
        const response = await fetch(`/api/categories/${categoryId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${user.token}`
            },
        });


        const json = await response.json();

        return {json: json, ok: response.ok}
        

    } catch (error) {
        return {error: error};
    }
}