'use client';

import React, { useState } from 'react';

import { Search, X } from 'lucide-react';

export default function SearchBox({
  searchValue,
  setSearchValue,
}: {
  searchValue: string;
  setSearchValue: React.Dispatch<React.SetStateAction<string>>;
}) {
  const [active, setActive] = useState(false);

  const handleSearchClick = () => {
    setActive(!active);
  };

  const handleCancelClick = () => {
    setSearchValue('');
  };

  return (
    <div className="grid place-items-center">
      <div
        className={`relative ${active ? 'w-56' : 'w-10'} h-10 rounded-full  shadow border transition-all duration-500`}
      >
        <input
          type="text"
          autoFocus
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Search"
          className={`absolute inset-0 w-full h-full rounded-full  outline-none pl-5 pr-14 ${active ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}
        />
        <div
          className={`absolute right-0 top-0 bottom-0 flex items-center justify-center w-10 h-10 rounded-full cursor-pointer transition-all duration-500 ${active ? 'transform translate-x-0' : ''}`}
          onClick={handleSearchClick}
        >
          <Search size={20} className='mb-0.5 ml-0.5' />
        </div>
        {active && searchValue !== '' && (
          <div
            className="absolute right-8 top-0 bottom-0 flex items-center cursor-pointer transition-all duration-500"
            onClick={handleCancelClick}
          >
            <X size={22} className='stroke-muted-foreground' />
          </div>
        )}
      </div>
    </div>
  );
}
