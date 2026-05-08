import React from 'react';
import StarRating from '../OtherComponents/StarRating';
import NavigationButton from '../Buttons/NavigationButton';
import {FaStar } from "react-icons/fa"

const ReviewsSection = ({ reviews, reviewContainerRef, setCanScrollAutomaticReview }) => {
   

    return (
        <section className="reviews mb-12">
            <h2 className="text-3xl font-bold mb-6 flex relative">
                <FaStar className="text-primary2 mr-2" />
                Customer Reviews
                <span className="w-full absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-primary2 to-primary3 mt-2"></span>
            </h2>
            <p className='mb-3'>{reviews.length} Reviews</p>
            <div>
                <div ref={reviewContainerRef} data-name="reviewContainerRef" className="flex gap-6 overflow-x-auto hide-scrollbar p-4 bg-gray-100 rounded-lg">
                    {reviews.map((review) => (
                        <div key={review._id} className="review bg-white shadow-lg rounded-lg p-6 flex-none w-80 transform transition-transform hover:scale-105">
                            <div className="flex gap-3">
                                <img src={review.photo} alt="User" className="w-12 h-12 rounded-full mb-4"/>
                                <p className="mb-4 italic text-gray-700">"{review.text}"</p>

                            </div>
                            <StarRating rating={review.rating}/>
                            <p className="font-semibold text-right text-primary2">- {review.author}</p>
                            
                        </div>
                    ))}
                </div>

                <NavigationButton setCanScrollAutomatic={setCanScrollAutomaticReview} containerRef={reviewContainerRef} />

            </div>
        </section>
    );
}

export default ReviewsSection;
