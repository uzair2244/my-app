import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const DropDown = ({val, site}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedVal, setSelectedVal] = useState(false);

  const indeedTalentOptions = [
    { value: 1, label: '1 Day' },
    { value: 3, label: '3 Days' },
  ];

  const zipOptions = [
    { value: 1, label: '1 Day' },
    { value: 5, label: '5 Days' },
  ];

  const toggleDropdown = () =>
  site === '' ? toast.error('choose a portal first') :
  setIsOpen(!isOpen);

  const handleSelect = (value) => {
    // Handle selection logic here (e.g., update state or trigger an action)
    console.log('Selected value:', value);
    setSelectedVal(value)
    val(value)
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        className="text-gray-700 bg-white hover:bg-gray-100 focus:ring-2 focus:outline-none focus:ring-black font-medium rounded-lg text-sm px-4 py-2.5 inline-flex items-center dark:bg-gray-200 dark:hover:bg-gray-100 dark:focus:ring-black"
        onClick={toggleDropdown}
      >
        {selectedVal ? selectedVal + " " + [(selectedVal === 1) ? 'day' : 'days'] : 'Select Duration'  } 
        <svg className="ml-2 -mr-1 w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.293l4.293-4.293a1 1 0 011.414 1.414l-6 6a1 1 0 01-1.414-1.414L5.293 7.293z" clipRule="evenodd" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 z-10 w-44 mt-2 origin-top-right rounded-md shadow-lg bg-white dark:bg-gray-200 ring-1 ring-black ring-opacity-5 py-1 divide-y divide-gray-100">
          {(site === 'indeed' || site === 'talent')&& indeedTalentOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
              onClick={() => handleSelect(option.value)}
            >
              {option.label}
            </button>
          ))}
          {site === 'zipRecruiter' && zipOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
              onClick={() => handleSelect(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default DropDown;