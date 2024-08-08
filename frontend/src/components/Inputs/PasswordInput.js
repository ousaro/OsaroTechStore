import React from 'react';
import { useState } from 'react';
import openEyeIcon from "../../img/icons/openEyeIcon.svg"
import closedEyeIcon from "../../img/icons/closedEyeIcon.svg"



const PasswordInput = ({labelName,name, value, onChange}) => {

    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

  return (
    <div className="flex flex-col items-center justify-center relative md:w-2/3 xl:w-3/6">
        <label className="block text-primary1 text-sm font-roboto mb-2 self-start md:text-base xl:text-xl">
          {labelName}
        </label>
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          className="passInput bg-[url('./img/icons/passwordIcon.svg')] input-icons w-48 h-8 rounded-md p-2 pl-8 focus:pl-10 mb-2 border hover:ring-2 hover:ring-slate-700 focus:outline-none focus:ring-2 focus:ring-primary2 outline outline-1 transition duration-300 ease-in-out transform focus:scale-105  active:scale-100 md:w-full md:h-8 xl:h-12 xl:pl-9"
          name={name}
          value={value}
          onChange={onChange}
          />
        <figure className="focusInput absolute top-1/2  left-2 flex items-center cursor-pointer w-5 opacity-50 xl:w-6">
          <img
            src={showPassword ? openEyeIcon : closedEyeIcon}
            alt="Toggle Password Visibility"
            onClick={togglePasswordVisibility}
          />
        </figure>
            
    </div>
  );
};

export default PasswordInput;
