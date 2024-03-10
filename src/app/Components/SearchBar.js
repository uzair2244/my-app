import { useState } from 'react';
import { SiIndeed } from 'react-icons/si'
import { TbZip } from 'react-icons/tb'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SearchBar = ({ onSubmit, link, setLink }) => {
  const [keyword, setKeyword] = useState('');
  const [check, setCheck] = useState(0)
  const notify = () => toast("No Keyword Found!", { type: "error", theme: 'dark' });
  const notify2 = () => toast("Fetching Data...!", { type: "success", autoClose: 1000, theme: 'dark' });


  const handleChange = (e) => {
    link && setLink('')
    setCheck(0)
    setKeyword(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (keyword === '') {
      notify();
    }
    else {
      notify2();
      onSubmit(keyword)
    };
  };

  return (
    <div className='z-20 ' >
      <ToastContainer />
      <form className=" flex items-center text-xl font-inter font-medium leading-loose flex-col gap-2 text-center" onSubmit={handleSubmit}>

        <h1 className='font-bold text-white'>
          Job Search
        </h1>
        <input type="text" className='w-1/3 bg-gray-100 rounded-md pl-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#050708]/50 focus:ring-opacity-50 text-gray-500 drop-shadow-lg	' placeholder='Type here' value={keyword} onChange={handleChange} />
        {check === 1 ? <span>write something</span> : null}

        <div className='w-1/3 px-1 py-1 flex gap-2'>
          <div className='flex items-center'>
            <input type='radio' value='indeed' name='portal' /><SiIndeed size={30} color='#0047AB'/>
          </div>
          <div className='flex items-center'>
            <input type='radio' value='zipRecruiter' name='portal'/><TbZip size={30} color='lime'/>
          </div>
        </div>

        <button className='text-white bg-[#050708] hover:bg-[#050708]/90 focus:ring-4 focus:outline-none focus:ring-[#050708]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center me-2 mb-2 ' type="submit">
          Search
        </button>
        {link && (
          <a className='px-4 py-2 ml-3 mr-3 rounded-md bg-green-700 text-white hover:bg-green-500' href={link} download={keyword + '.xlsx'}>{keyword}</a>
        )}
      </form>
    </div>
  );
};

export default SearchBar;
