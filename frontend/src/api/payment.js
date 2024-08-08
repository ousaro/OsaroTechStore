export const addNewPayment = async (user, items) => {
    try {
        const response = await fetch('/api/create-payment-intent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`
            },
            body: JSON.stringify(items)
        });

        
        const { url } = await response.json();

        return {url: url , ok: response.ok}
       

    } catch (error) {
        return {error: error}
    }
}