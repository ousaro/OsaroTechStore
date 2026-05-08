import React from 'react';

const StarRating = ({ rating }) => {
  const filledStar = (
    <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.962a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.368 2.448a1 1 0 00-.364 1.118l1.286 3.962c.3.921-.755 1.688-1.54 1.118L10 14.347l-3.368 2.448c-.784.57-1.84-.197-1.54-1.118l1.286-3.962a1 1 0 00-.364-1.118L2.646 9.389c-.784-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.962z" />
    </svg>
  );

  const emptyStar = (
    <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.962a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.368 2.448a1 1 0 00-.364 1.118l1.286 3.962c.3.921-.755 1.688-1.54 1.118L10 14.347l-3.368 2.448c-.784.57-1.84-.197-1.54-1.118l1.286-3.962a1 1 0 00-.364-1.118L2.646 9.389c-.784-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.962z" />
    </svg>
  );

  const stars = [];

  for (let i = 0; i < 5; i++) {
    stars.push(i < rating ? filledStar : emptyStar);
  }

  return (
    <div className="flex">
      {stars.map((star, index) => (
        <span key={index}>{star}</span>
      ))}
    </div>
  );
};

export default StarRating;
