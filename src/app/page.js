'use client'
import { useState } from 'react';
import SearchBar from './Components/SearchBar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const Home = () => {
  const [excelUrl, setExcelUrl] = useState('');
  const [key, setKey] = useState('')

  const searchJobs = async (keyword) => {
    setKey(keyword)
    const response = await fetch(`/api/searchJobz?keyword=${keyword}`);
    toast.promise(
      response,
      {
        pending: 'Promise is pending',
        success: 'Promise resolved 👌',
        error: 'Promise rejected 🤯'
      }
    )
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    setExcelUrl(url);
  };

  return (
    <div className={`bg-[url('/bg5.jpg')] bg-cover relative min-h-screen bg-no-repeat text-white flex justify-center flex-col bg-red-300`}>
      <div className="absolute inset-0 backdrop-blur-md bg-gray-900/40 opacity-60"></div>
      <ToastContainer />
      <SearchBar onSubmit={searchJobs} link={excelUrl} setLink={setExcelUrl} />
    </div>
  );
};

export default Home;
