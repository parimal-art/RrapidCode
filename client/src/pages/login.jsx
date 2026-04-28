// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
// import { useDispatch, useSelector } from 'react-redux';
// import { useEffect } from 'react';
// import { useNavigate } from 'react-router';
// import { loginUser } from '../authslice';
 
// const LoginSchema = z.object({
//     emailId: z.string().email('Invalid Email'),
//     password: z.string().min(8, 'Wrong Password'),
//     confirmPassword: z.string().min(8, 'Confirm password is required'),
//   })
//   .refine((data) => data.password === data.confirmPassword, {
//     message: 'Passwords do not match',
//     path: ['confirmPassword'],
//   });

// function Login() {
      
//     const dispatch = useDispatch();
//     const navigate = useNavigate();
//      const {isAuthenticated} = useSelector((state)=>state.auth);
//   const { register,
//      handleSubmit, 
//      formState: { errors }, 
//     } = useForm({ resolver: zodResolver(LoginSchema) });

//     useEffect(()=>{
//         if(isAuthenticated){
//             navigate('/');
//         }
//     },[isAuthenticated]);

//   const onSubmit = (data)=>{
//    delete data.confirmPassword;
//      dispatch(loginUser(data));
//   }

//   return (
//     <div className="min-h-screen flex justify-center items-center bg-base-200">
//       <div className="card w-full max-w-md shadow-2xl bg-base-100 p-6">
//         <h2 className="text-2xl font-bold text-center mb-4">Rapid Code</h2>

//         <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">


//           <div>
//             <label className="label"><span className="label-text">Email</span></label>
//             <input {...register('emailId')} placeholder="Enter Email" type="email" className="input input-bordered w-full" />
//             {errors.emailId && <p className="text-error text-sm mt-1">{errors.emailId.message}</p>}
//           </div>


//           <div>
//             <label className="label"><span className="label-text">Password</span></label>
//             <input {...register('password')} placeholder="Enter Password" type="password" className="input input-bordered w-full" />
//             {errors.password && <p className="text-error text-sm mt-1">{errors.password.message}</p>}
//           </div>


//           <div>
//             <label className="label"><span className="label-text">Confirm Password</span></label>
//             <input {...register('confirmPassword')} placeholder="Confirm Password" type="password" className="input input-bordered w-full" />
//             {errors.confirmPassword && <p className="text-error text-sm mt-1">{errors.confirmPassword.message}</p>}
//           </div>

//           <button type="submit" className="btn btn-success w-full mt-3">Login</button>
//         </form>
            
//       </div>
//     </div>
//   );
// }

// export default Login;



// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
// import { useDispatch, useSelector } from 'react-redux';
// import { useEffect } from 'react';
// import { useNavigate } from 'react-router';
// import { loginUser } from '../authslice';

// const LoginSchema = z
//   .object({
//     emailId: z.string().email('Invalid Email'),
//     password: z.string().min(8, 'Wrong Password'),
//     confirmPassword: z.string().min(8, 'Confirm password is required'),
//   })
//   .refine((data) => data.password === data.confirmPassword, {
//     message: 'Passwords do not match',
//     path: ['confirmPassword'],
//   });

// function Login() {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { isAuthenticated } = useSelector((state) => state.auth);

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm({ resolver: zodResolver(LoginSchema) });

//   useEffect(() => {
//     if (isAuthenticated) {
//       navigate('/');
//     }
//   }, [isAuthenticated, navigate]);

//   const onSubmit = (data) => {
//     delete data.confirmPassword;
//     dispatch(loginUser(data));
//   };

//   return (
//     <div className="min-h-screen flex justify-center items-center bg-base-200">
//       <div className="card w-full max-w-md shadow-2xl bg-base-100 p-6">
//         <h2 className="text-3xl font-bold text-center mb-4 bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">
//           Rapid Code
//         </h2>

//         <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
//           <div>
//             <label className="label">
//               <span className="label-text">Email</span>
//             </label>
//             <input
//               {...register('emailId')}
//               placeholder="Enter Email"
//               type="email"
//               className="input input-bordered w-full"
//             />
//             {errors.emailId && <p className="text-error text-sm mt-1">{errors.emailId.message}</p>}
//           </div>

//           <div>
//             <label className="label">
//               <span className="label-text">Password</span>
//             </label>
//             <input
//               {...register('password')}
//               placeholder="Enter Password"
//               type="password"
//               className="input input-bordered w-full"
//             />
//             {errors.password && <p className="text-error text-sm mt-1">{errors.password.message}</p>}
//           </div>

//           <div>
//             <label className="label">
//               <span className="label-text">Confirm Password</span>
//             </label>
//             <input
//               {...register('confirmPassword')}
//               placeholder="Confirm Password"
//               type="password"
//               className="input input-bordered w-full"
//             />
//             {errors.confirmPassword && (
//               <p className="text-error text-sm mt-1">{errors.confirmPassword.message}</p>
//             )}
//           </div>

//           <button type="submit" className="btn btn-success w-full mt-3">
//             Login
//           </button>
//         </form>

//         <div className="text-center mt-4">
//           <p className="text-sm text-gray-600">
//             Don't have an account?{' '}
//             <button
//               onClick={() => navigate('/signup')}
//               className="text-blue-500 hover:underline"
//               type="button"
//             >
//               Sign Up
//             </button>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Login;



import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { loginUser } from '../authslice';
import { AlertCircle, X, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LoginSchema = z
  .object({
    emailId: z.string().email('Invalid Email'),
    password: z.string().min(8, 'Wrong Password'),
    confirmPassword: z.string().min(8, 'Confirm password is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(LoginSchema) });

  const [showMismatchPopup, setShowMismatchPopup] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Show popup when zod detects password mismatch
  useEffect(() => {
    if (errors?.confirmPassword?.message === 'Passwords do not match') {
      setShowMismatchPopup(true);
    }
  }, [errors]);

  const onSubmit = (data) => {
    delete data.confirmPassword;
    dispatch(loginUser(data));
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-b from-[#060712] via-[#071023] to-[#05060a]">
      <div className="card w-full max-w-md shadow-2xl bg-slate-900 border border-slate-800 p-6 text-slate-100">
        <h2 className="text-3xl font-bold text-center mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-blue-400">
          Rapid Code
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div>
            <label className="label">
              <span className="label-text text-slate-300">Email</span>
            </label>
            <input
              {...register('emailId')}
              placeholder="Enter Email"
              type="email"
              className="input input-bordered w-full bg-slate-800 border-slate-700 text-slate-100"
            />
            {errors.emailId && <p className="text-rose-400 text-sm mt-1">{errors.emailId.message}</p>}
          </div>

          <div>
            <label className="label">
              <span className="label-text text-slate-300">Password</span>
            </label>
            <input
              {...register('password')}
              placeholder="Enter Password"
              type="password"
              className="input input-bordered w-full bg-slate-800 border-slate-700 text-slate-100"
            />
            {errors.password && <p className="text-rose-400 text-sm mt-1">{errors.password.message}</p>}
          </div>

          <div>
            <label className="label">
              <span className="label-text text-slate-300">Confirm Password</span>
            </label>
            <input
              {...register('confirmPassword')}
              placeholder="Confirm Password"
              type="password"
              className="input input-bordered w-full bg-slate-800 border-slate-700 text-slate-100"
            />
            {errors.confirmPassword && (
              <p className="text-rose-400 text-sm mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          <button type="submit" className="btn bg-cyan-600 hover:bg-cyan-500 w-full mt-3 text-black">
            Login
          </button>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-slate-400">
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/signup')}
              className="text-cyan-300 hover:underline"
              type="button"
            >
              Sign Up
            </button>
          </p>
        </div>
      </div>

      {/* Password mismatch popup */}
      <AnimatePresence>
        {showMismatchPopup && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 flex items-start justify-center pointer-events-none pt-24"
          >
            <div className="pointer-events-auto w-full max-w-sm mx-4">
              <div className="bg-slate-900 border border-rose-600 rounded-lg shadow-lg p-4 flex gap-3 items-start">
                <div className="p-2 rounded-full bg-rose-600/10 border border-rose-600 text-rose-400">
                  <AlertCircle className="w-5 h-5" />
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-slate-100 font-semibold">Passwords do not match</div>
                      <div className="text-sm text-slate-400 mt-1">Your password and confirm password fields must be identical.</div>
                    </div>
                    <button
                      onClick={() => setShowMismatchPopup(false)}
                      className="ml-2 p-1 rounded-md bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700"
                      aria-label="Close popup"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => setShowMismatchPopup(false)}
                      className="px-3 py-1 rounded-md bg-emerald-600/20 text-emerald-300 border border-emerald-600/30"
                    >
                      Okay
                    </button>
                    <button
                      onClick={() => { setShowMismatchPopup(false); /* focus confirm input if needed */ }}
                      className="px-3 py-1 rounded-md bg-rose-600 text-black"
                    >
                      Edit Passwords
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Login;






