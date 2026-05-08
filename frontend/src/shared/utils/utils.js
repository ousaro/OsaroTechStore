export const updateLocalStorage = (newData) =>{
    // Retrieve existing user data from localStorage
    const storedUser = JSON.parse(localStorage.getItem('user'));
                    
    // Merge updated user data with existing user data, preserving the token
    const updatedUserWithToken = { ...storedUser, ...newData, token: storedUser.token };

    // Save updated user data back to localStorage
    localStorage.setItem('user', JSON.stringify(updatedUserWithToken));
}



export const scrollLeft = (ref) => {
    if(ref.current && ref.current.getAttribute('data-name') === "reviewContainerRef"){
        ref.current.scrollBy({ left: -340, behavior: 'smooth' });
        return;
    }
    if(ref.current && ref.current.getAttribute('data-name') === "productContainerRef"){
        ref.current.scrollBy({ left: -230, behavior: 'smooth' });
        return;
    }
};

export const scrollRight = (ref) => {
    if(ref.current && ref.current.getAttribute('data-name') === "reviewContainerRef"){
        ref.current.scrollBy({ left: 340, behavior: 'smooth' });
        return;
    }
    if(ref.current && ref.current.getAttribute('data-name') === "productContainerRef"){
        ref.current.scrollBy({ left: 230, behavior: 'smooth' });
        return;
    }
};



export const handleAutomaticScroll = (ref) => {
    if(ref.current === null) return;
    if (ref.current.scrollLeft + ref.current.offsetWidth + 5 >= ref.current.scrollWidth) {
        ref.current.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      scrollRight(ref);
    }
};


export const categorizeProducts = (user,products) => {
    const categories = {
        "All Products": [],
        "Favorite": [],
        "New Products": [],
        "Hot Deals": [],
    };

    products.forEach((product) => {

        categories["All Products"].push(product);

        if (product.isNewProduct) categories["New Products"].push(product);
        if (product.discount >= 35) categories["Hot Deals"].push(product); // add here the criteria that fit your needs
        if (user.favorites.includes(product._id)) categories["Favorite"].push(product);

        if (!categories[product.category]) {
            categories[product.category] = [];
        }
        categories[product.category].push(product);
    });

    return categories;
};


   // Open and close modal
export const openModal = (image, setSelectedImage, setModalIsOpen) => {
    setSelectedImage(image);
    setModalIsOpen(true);
};

export const closeModal = (setSelectedImage, setModalIsOpen) => {
    setSelectedImage(null);
    setModalIsOpen(false);
};
