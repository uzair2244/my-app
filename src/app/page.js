'use client'
import { useState} from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import CSS for styling
import SearchBar from './Components/SearchBar';

const Home = () => {
  const [excelUrl, setExcelUrl] = useState('');
  const [key, setKey] = useState('');
  const [isLoading, setIsLoading] = useState(true); // Track loading state

  const searchJobs = async (keyword) => {
    setKey(keyword);
    try {
      toast.info('dont close the browser', {autoClose: false, toastId: 'fetch-data', theme: 'dark'})
      const response = await fetch(`/api/searchJobz?keyword=${keyword}`);
      toast.dismiss('fetch-data')
      if (!response.ok) {
        throw new Error('Failed to fetch data'); // Handle non-2xx response codes
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      toast.success('Data fetched successfully!', {theme: 'dark', autoClose: 1000}); // Display success toast
      setExcelUrl(url);
    } catch (error) {
      console.error('Error fetching data:', error); // Log errors for debugging
      toast.error('Failed to fetch data. Please try again.'); // Display error toast
    } finally {
      setIsLoading(false); // Set loading to false after fetch (success or error)
    }
  };

  return (
    <div className={`bg-[url('/bg5.jpg')] bg-cover relative min-h-screen bg-no-repeat text-white flex justify-center flex-col bg-red-300`}>
      <div className="absolute inset-0 backdrop-blur-md bg-gray-900/40 opacity-60"></div>
      <SearchBar onSubmit={searchJobs} link={excelUrl} setLink={setExcelUrl} />
    </div>
  );
};

export default Home;