import React,{useState} from 'react';
import { Link,useNavigate } from 'react-router-dom';
import logo from '../../public/app_logo.png';
import axios from "axios";

import toast from "react-hot-toast";
import { BACKEND_URL } from "../utils/utils";



function Signup() {

  const [firstName, setFirstname] = useState('');
  const [lastName, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [errorMessage, setErrorMessage] = useState('');

  const navigate=useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try{
      const response=await axios.post(`${BACKEND_URL}/user/signup`,{
        firstName,
        lastName,
        email,
        password,
      },
      {
        withCredentials:true,
        headers:{
          "Content-Type":"application/json",
        },
      
      })
      console.log("User signed up successfully",response.data);
      toast.success(response.data.message);
      navigate("/");
    }catch(error){
      if(error.response){
       
        setErrorMessage( error.response.data.errors||"Signup failed!!!");
        
      }
    }
  };

  return (
    <div className="bg-gradient-to-r from-black to-blue-950 min-h-screen w-full">
      <div className="text-white w-full max-w-[1400px] mx-auto px-4">

        {/* Header */}
        <header className="flex items-center justify-between py-6">
          <div className="flex items-center gap-2">
            <img src={logo} alt="App Logo" className="w-12 h-12 rounded-full" />
            <h1 className="text-2xl text-orange-500 font-bold">UIT-CLASSES</h1>
          </div>

          <div className="space-x-4">
            <Link
              to="/login"
              className="border px-4 py-2 rounded hover:bg-orange-600 transition"
            >
              Login
            </Link>
            <Link
              to="/courses"
              className=" bg-orange-500 px-4 py-2 rounded-md"
            >
              Join now
            </Link>
          </div>
        </header>

        {/* sign up form */}
        <div className="flex justify-center">
        <div className="bg-gray-900 p-8 rounded-lg shadow-lg w-[500px] mt-20">

          <h2 className='text-2xl font-bold mb-4 text-center'>
            Welcome to <span className='text-orange-500'>UIT CLASSES</span>

          </h2>
          <p className='text-center text-gray-400 mb-6'>
            Just Signup to Join Us!
          </p>

          <form onSubmit={handleSubmit}>
            <div className='mb-4'>
              <label htmlFor='firstname' className='text-gray-400 mb-2'>
                Firstname
              </label>
              <input
                type='text'
                id='firstname'
                value={firstName}
                onChange={(e)=>setFirstname(e.target.value)}
                className='w-full p-3 rounded-md bg-gray-800 border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='Type your firstname'
               />
            </div>
            <div className='mb-4'>
              <label htmlFor='lastname' className='text-gray-400 mb-2'>
                Lastname
              </label>
              <input
                type='text'
                id='lastname'
                value={lastName}
                onChange={(e)=>setLastname(e.target.value)}
                className='w-full p-3 rounded-md bg-gray-800 border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='Type your lastname'
               />
            </div>
            <div className='mb-4'>
              <label htmlFor='email' className='text-gray-400 mb-2'>
                Email
              </label>
              <input
                type='text'
                id='email'
                value={email}
                onChange={(e)=>setEmail(e.target.value)}
                className='w-full p-3 rounded-md bg-gray-800 border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='name@email.com'
                required
               />
            </div>
           <div className='mb-4'>
              <label htmlFor='password' className='text-gray-400 mb-2'>
                Password
              </label>
              <div className='relative'>
              <input
                type='text'
                id='password'
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
                className='w-full p-3 rounded-md bg-gray-800 border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='********'
                required
               />
               <span className='absolute right-3 top-3 text-gray-500 cursor-pointer'>
                👁️
               </span>
            </div>
            </div>
            {errorMessage&&(
              <p className='text-red-500 mb-4 text-center'>
                {errorMessage}
              </p>
            )}
            <button
            type='submit'
            className='w-full bg-orange-500 hover:bg-blue-600 text-white py-3 px-6 rounded-md transition'>
            Signup
            </button>
          </form>
        </div>
        </div>
        </div>
        </div>
  )
}

export default Signup;

