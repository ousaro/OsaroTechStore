import Logo from '../../img/logo/OsaroTechStoreLogo.svg';
import Logo2 from '../../img/logo/OsaroTechStoreLogo4.svg';
import Logo3 from "../../img/logo/OsaroTechStoreLogoWhite2.svg"
import PasswordInput from '../../components/Inputs/PasswordInput';
import EmailInput from '../../components/Inputs/EmailInput';
import { useEffect, useState } from 'react';
import { useLogIn } from '../../hooks/useLogIn';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';


const LogIn = () => {

    const googleApiUrl = process.env.REACT_APP_GOOGLE_API_URL
    const {logIn, isLoading, error, next} = useLogIn();
    const navigate = useNavigate();

    const [email, setEmail] = useState('')
    const [password , setPassword] = useState('')

    useEffect(() => {
        if(next){
            navigate("/Home")
        }
    }, [next, navigate])
    
    const OnSubmitHandler= async (e)=>{
        e.preventDefault();
        toast.promise(
            logIn(email, password),
            {
               loading: 'Loding...',
               success: <b>Log In Successfuly!</b>,
               error: <b>Could not Log In.</b>,
            }
        );
    }

    const handleEmailChange = (e)=>{
        setEmail(e.target.value)
    }

    const handlePasswordChange = (e)=>{
        setPassword(e.target.value)
    }

   




    const googleLogin = ()=>{
        window.open(googleApiUrl, "_self") // _self to open in the same page
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

                <form className="w-64 mt-10 p-6 flex flex-col items-center justify-center md:w-full md:h-screen md:mt-0 md:justify-start " onSubmit={OnSubmitHandler}>
                        <figure className='hidden md:flex md:mb-5'>
                            <img src={Logo2} alt="Login logo md" className='w-auto  md:h-10 xl:h-14' />
                        </figure>
                        <header>
                            <h1 className="text-primary1 text-2xl font-bold mt-2 font-roboto md:mt-8 md:text-3xl xl:text-5xl xl:mt-12">Log In</h1>
                        </header>
                        <main className="flex flex-col items-center  mt-2 md:w-full md:mt-6">

                            <EmailInput name="email" value={email} onChange={handleEmailChange}  />
                            <PasswordInput labelName={"Password"} name="password" value={password} onChange={handlePasswordChange}  />
            
                            <a href="/" className='mt-2 w-full font-semibold visited:text-inherit hover:opacity-80 md:w-2/3 xl:w-3/6 xl:text-xl' >Forgot Password?</a>
                            {/* Log In button */}
                            <button className="Button"   disabled={isLoading}>
                                Log In
                                </button>

                            {error && <div className="text-red-500 text-sm font-roboto font-semibold mt-2">{error}</div>}
                            
                            <p className="text-primary1 font-roboto font-bold md:text-lg xl:text-2xl ">-Or Sign Up With-</p>

                           {/* Use an icon for Google login */}
                            <div className="flex items-center mb-1 mt-4">
                                <button className="bg-[url('./img/icons/googleIcon.png')] bg-cover bg-center w-8 h-8 rounded-full md:mt-3 xl:w-12 xl:h-12 transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-slate-400 hover:shadow-lg active:scale-95 active:shadow-md"
                                    aria-label="Button with background image" 
                                    onClick={(e) => {
                                        e.preventDefault();
                                        googleLogin();
                                      }}></button>
                            </div>

                        </main>
                </form>
            </main>

      </div>
      
     );
}
 
export default LogIn;