import React from 'react';


const EmailInput = ({ name, value, onChange }) => {
  return (
    <div className="flex flex-col items-start justify-center md:w-2/3 xl:w-3/6">
      <label className="block text-primary1 text-sm font-roboto mb-2 self-start md:text-base xl:text-xl">
        Email
      </label>
      <input
        type="email"
        placeholder="exemple.com"
        className="bg-[url('./img/icons/emailIcon.svg')] input-icons  w-48 h-8 rounded-md p-2 mb-2 border hover:ring-2 hover:ring-slate-700 focus:outline-none focus:ring-2 focus:ring-primary2 outline outline-1 transition duration-300 ease-in-out transform focus:scale-105 md:w-full md:h-8 xl:h-12"
        name={name}
        value={value}
        onChange={onChange}
      />
    </div>
  
  );
};

export default EmailInput;
