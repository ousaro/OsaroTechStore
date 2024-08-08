import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useRegister} from "../../hooks/useRegister"
import { toast } from 'react-hot-toast';

import Logo from '../../img/logo/OsaroTechStoreLogo.svg';
import Logo2 from '../../img/logo/OsaroTechStoreLogo4.svg';
import Logo3 from "../../img/logo/OsaroTechStoreLogoWhite2.svg"
import PasswordInput from '../../components/Inputs/PasswordInput';
import ConfimPasswordInput from '../../components/Inputs/ConfimPasswordInput';



const SetPassword = () => {

    const navigate = useNavigate();

    const {register, isloading, next,error} = useRegister()



    const [password , setPassword] = useState('')
    const [confirmPassword , setConfirmPassword] = useState('')
    const [userInfo, setUserInfo] = useState(null);
    
    useEffect(() => {
        let params = new URLSearchParams(window.location.search);
        let userData = null;

        try {
            userData = JSON.parse(params.get('user'));
        } catch (error) {
            console.error('Failed to parse user data:', error);
        }

        setUserInfo(userData);
    }, []); 


    
    useEffect(() => {
        if(next){
            navigate("/Home")
        }
    }, [next, navigate])
    
    

    const handlePasswordChange = (e)=>{
        setPassword(e.target.value)
    }

    const handleConfirmPasswordChange = (e)=>{
        setConfirmPassword(e.target.value)
    }


   


    const HandleSubmit= async (e)=>{
        e.preventDefault();

        if(userInfo){

            
            const firstName = userInfo.name.givenName;
            const lastName = userInfo.name.familyName
            const email = userInfo.emails[0].value;
            const picture = userInfo.photos[0].value 

            toast.promise(
                register(firstName,lastName,email,password, confirmPassword, picture),
                {
                   loading: 'Loding...',
                   success: <b>You are Successfuly register!</b>,
                   error: <b>Could not register.</b>,
                }
            );
           
        }

    }


    
    
    return ( 
        <div className="flex justify-center items-center flex-col">
            <header className="p-4 flex justify-start items-center md:hidden">
                <img src={Logo} alt="Logo" className="w-auto h-24" />
            </header>

            <main className="md:flex md:flex-row md:justify-center md:items-center md:w-full md:h-screen">
                <div className='hidden md:flex md:flex-col md:justify-center md:items-center md:w-full md:relative md:h-screen md:p-10 md:bg-primary1'>
                    <figure className='hidden md:flex md:mb-5'>
                            <img src={Logo3} alt="Login logo md2" className='w-auto h-72 xl:h-96' />
                    </figure>
                </div>

                <form className="w-64 mt-10 p-6 flex flex-col items-center justify-center md:w-full md:h-screen md:mt-0 md:justify-start" onSubmit={HandleSubmit}>
                        <figure className='hidden md:flex md:mb-5'>
                            <img src={Logo2} alt="Login logo md" className='w-auto  md:h-10 xl:h-14' />
                        </figure>
                        <header>
                            <h1 className="text-primary1 text-2xl font-bold mt-2 font-roboto md:mt-8 md:text-3xl xl:text-5xl xl:mt-12">Set Password</h1>
                        </header>
                        <main className="flex flex-col items-center  mt-2 md:w-full md:mt-6">

                            <PasswordInput labelName={"Password"} name="password" value={password} onChange={handlePasswordChange}/> 
                            <ConfimPasswordInput name="confirmPassword" value={confirmPassword} onChange={handleConfirmPasswordChange}/>
                            {/* Log In button */}
                            <button className="bg-primary2 w-48 h-8 rounded-md text-white mt-5 mb-5 font-roboto font-bold md:w-2/3 md:h-9 md:text-xl xl:w-3/6 xl:h-11 xl:mt-8 transition duration-300 ease-in-out transform hover:bg-primary2dark hover:-translate-y-1 hover:shadow-slate-300 hover:shadow-lg active:translate-y-0 active:shadow-md" disabled={isloading}>
                                Submit
                                </button>


                            {error && <div className="text-red-500 text-sm font-roboto font-semibold mt-2">{error}</div>}

                        </main>
                </form>
            </main>

      </div>
      
     );
}
 
export default SetPassword;