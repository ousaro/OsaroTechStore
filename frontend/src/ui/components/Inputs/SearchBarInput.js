import React, { useState, useMemo, useCallback  } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCategoriesContext } from '../../../core/app-context/useCategoriesContext';
import { useProductsContext } from '../../../core/app-context/useProductsContext';
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
    <div className="flex align-center relative justify-center mt-2 mb-3 text-primary1 text-xs sm:text-sm lg:m-0 lg:w-3/5 lg:text-base 2xl:text-lg">
      <input
        type="text"
        placeholder="Search phones, accessories, categories"
        value={searchQuery}
        onChange={handleQueryChange}
        className="w-8/12 px-4 py-1 h-11 border border-slate-200 rounded-l-md bg-slate-50 shadow-inner hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary4 sm:w-2/3 md:h-12 lg:h-12"
      />
      <button
        onClick={handleSearch}
        className="bg-primary2 text-white rounded-r-md font-bold font-roboto px-4 py-1 shadow-sm transition hover:bg-primary2dark md:px-6 lg:h-12"
      >
        Search
      </button>
      {suggestions.length > 0 && (
        <ul className="absolute left-1/2 top-full z-50 mt-2 max-h-56 w-10/12 -translate-x-1/2 overflow-y-auto rounded-md border border-slate-200 bg-white py-2 text-sm shadow-xl md:w-8/12">
          {suggestions.map((suggestion) => (
            <li
              key={suggestion._id}
              onClick={() => handleSuggestionClick(suggestion)}
              className="cursor-pointer px-4 py-2 text-left hover:bg-slate-100"
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
