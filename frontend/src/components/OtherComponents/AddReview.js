import { useAuthContext } from '../../hooks/useAuthContext';
import { useProductsContext} from "../../hooks/useProductsContext"
import { updateProduct } from '../../api/products';
import { useState } from 'react';
import {toast} from "react-hot-toast"


const AddReview = ({product, cardId, setProduct}) => {

    const {user} = useAuthContext();
    const {dispatch: productsDispatch} = useProductsContext();

    const reviewInitialState = {
        photo: user.picture,
        text: '',
        author: user.firstName + " " + user.lastName,
        rating: ''
      };
      const [review, setReview] = useState(reviewInitialState);

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        setReview({ ...review, [name]: value })
      };

    const handleAddReview = async (e) => {
        e.preventDefault();
  
        // Calculate the new reviews array
        const updatedReviews = [...product.reviews, review];
  
        // Calculate the new average rating
        const totalRating = updatedReviews.reduce((sum, review) => sum + Number(review.rating), 0);
        const newAverageRating = totalRating / updatedReviews.length;
  
        const update = {
          reviews: updatedReviews,
          rating: newAverageRating
        }
  
        const {json, ok} = await updateProduct(user, cardId, update)
  
  
        if(!ok){
  
          toast.error(json.error)
  
        }else{
  
          // Update the local state with the new review
          setProduct(prevProduct => ({
            ...prevProduct,
            reviews: updatedReviews,
            rating: newAverageRating
          }));
  
          productsDispatch({ type: "UPDATE_PRODUCT", payload: json });
  
          // Reset the review form
          setReview(reviewInitialState);

          toast.success("Review added successfully!")
        }
  
      }

    return ( 
            <form className='w-full flex flex-col gap-4 sm:flex-row' onSubmit={handleAddReview}>
                  <input
                      type="text"
                      name='text'
                      placeholder="Add your comment..."
                      value={review.text}
                      onChange={handleChange}
                      className="flex-grow px-4 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-primary2"
                      required
                    />
                    <select
                      name="rating"
                      id="rating"
                      className="px-4 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-primary2"
                      value={review.rating}
                      onChange={handleChange}
                      required
                      >
                      <option value="" selected disabled>Rate your experience</option>
                      <option value="5">5 - Excellent</option>
                      <option value="4">4 - Good</option>
                      <option value="3">3 - Average</option>
                      <option value="2">2 - Poor</option>
                      <option value="1">1 - Terrible</option>
                    </select>
                  <button className="bg-primary1 text-white px-4 py-2 rounded hover:bg-primary2 transition-colors duration-200"
                  >
                      Add Review
                  </button>
              </form>  
     );
}
 
export default AddReview;