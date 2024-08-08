export const getAllUsers = async (user) => {
    try{
        const response = await fetch('/api/users',{
          headers: {
            "Authorization" : `Brearer ${user.token}`
          }
        });
  
        const json = await response.json();

        return {json: json, ok : response.ok}

       
    }catch(error){
      return {error: error}
    } 
    
};



export const updateUser = async (user,userId, update) =>{
    try {
        const response = await fetch(`/api/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${user.token}`
            },
            body: JSON.stringify(update)
        });

        

        const json = await response.json();
        
       
        return {json: json, ok: response.ok};


        

    } catch (error) {
        return {error: error}
    }
  
}


export const updateUserPassword = async (user,userId, update) =>{
  try {
      const response = await fetch(`/api/users/passUpdate/${userId}`, {
          method: 'PUT',
          headers: {
              'Content-Type': 'application/json',
              "Authorization": `Bearer ${user.token}`
          },
          body: JSON.stringify(update)
      });

      

      const json = await response.json();
      
     
      return {json: json, ok: response.ok};


      

  } catch (error) {
      return {error: error}
  }

}


export const deleteUser = async (user, userId) =>{

    try{
        const response = await fetch(`/api/users/${userId}`,{
          method: 'DELETE',
          headers: {
            "Authorization" : `Brearer ${user.token}`
          }
        });
  
        const json = await response.json();

        return {json: json, ok: response.ok}

    }catch(error){
      return {error: error}
    } 
}