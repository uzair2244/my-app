import React, { useState } from 'react';
import { SiIndeed } from 'react-icons/si'; 
import { TbZip } from 'react-icons/tb'; 

const JobPortalSelector = ({portalName}) => {
  const [selectedPortal, setSelectedPortal] = useState('');

  const handlePortalChange = (event) => {
    setSelectedPortal(event.target.value);
    portalName(event.target.value)
  };

  return (
    <div className='w-1/3 px-1 py-1 flex gap-2'>
      <label htmlFor='indeed' className='flex items-center cursor-pointer'>
        <input
          type='radio'
          id='indeed'
          name='portal'
          value='indeed'
          checked={selectedPortal === 'indeed'}
          onChange={handlePortalChange}
        />
        <SiIndeed size={30} color='#0047AB' />
      </label>
      <label htmlFor='zipRecruiter' className='flex items-center cursor-pointer'>
        <input
          type='radio'
          id='zipRecruiter'
          name='portal'
          value='zipRecruiter'
          checked={selectedPortal === 'zipRecruiter'}
          onChange={handlePortalChange}
        />
        <TbZip size={30} color='lime' />
      </label>
    </div>
  );
};

export default JobPortalSelector;