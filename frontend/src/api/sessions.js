export const getSessionById = async (user, sessionId) => {
    try {
        const response = await fetch(`/api/session-details/${sessionId}`,
        {  headers: {
            'Authorization': `Bearer ${user.token}`
        },}
        );


        const data = await response.json();

        return {data: data, ok: response.ok}
                    
       

    } catch (error) {
        return {error: error}
    }
}