import React, { useState, useMemo, useCallback  } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCategoriesContext } from '../../hooks/useCategoriesContext';
import { useProductsContext } from '../../hooks/useProductsContext';
import debounce from 'lodash.debounce';

const SearchBarInput = () => {
  const { categories } = useCategoriesContext();
  const { products } = useProductsContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const navigate = useNavigate();

  const handleQueryChange = (event) => {
    const value = event.target.value;
    setSearchQuery(value);
    debouncedFetchSuggestions(value);
  };

  const fetchSuggestions = useCallback(
    (value) => {
      if (value) {
        const filteredCategories = categories.filter((category) =>
          category.name.toLowerCase().includes(value.toLowerCase())
        );

        const filteredProducts = products.filter((product) =>
          product.name.toLowerCase().includes(value.toLowerCase())
        );

        setSuggestions([...filteredCategories, ...filteredProducts]);
      } else {
        setSuggestions([]);
      }
    },
    [categories, products]
  );

  // Debounce the fetchSuggestions function to avoid making too many requests
  const debouncedFetchSuggestions = useMemo(
    () => debounce(fetchSuggestions, 300),
    [fetchSuggestions]
  );

  const handleSearch = () => {
    if (categories.find((category) => category.name === searchQuery)) {
      navigate(`/Products?category=${searchQuery}`);
    } else {
      navigate(`/Products?query=${searchQuery}`);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion.name);
    setSuggestions([]);
    if (categories.find((category) => category.name === suggestion.name)) {
      navigate(`/Products?category=${suggestion.name}`);
    } else {
      navigate(`/Products?query=${suggestion.name}`);
    }
  };

  return (
    <div className="flex align-center relative justify-center mt-5 mb-4 text-primary1 text-xs sm:text-sm lg:w-5/6 lg:text-lg lg:px-10 2xl:text-lg 2xl:mt-10">
      <input
        type="text"
        placeholder="Search"
        value={searchQuery}
        onChange={handleQueryChange}
        className="w-5/12 px-2 py-1 h-8 border rounded-tl-2xl rounded-bl-2xl hover:ring-1 hover:ring-slate-700 focus:outline-none focus:ring-1 focus:ring-primary2 sm:w-1/2 sm:h-10 md:w-2/3 md:h-12 lg:h-12"
      />
      <button
        onClick={handleSearch}
        className="bg-primary2 text-white rounded-tr-2xl rounded-br-2xl font-bold font-roboto px-2 py-1 sm:rounded-br-3xl sm:rounded-tr-3xl md:px-5 lg:h-12"
      >
        Search
      </button>
      {suggestions.length > 0 && (
        <ul className="absolute w-4/12 md:w-7/12 translate-y-7 md:translate-y-10 -translate-x-7 md:-translate-x-12 bg-white border border-gray-200 mt-1 z-10 max-h-40 overflow-y-auto">
          {suggestions.map((suggestion) => (
            <li
              key={suggestion._id}
              onClick={() => handleSuggestionClick(suggestion)}
              className="cursor-pointer px-2 py-1 hover:bg-gray-200"
            >
              {suggestion.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBarInput;
