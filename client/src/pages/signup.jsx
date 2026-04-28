import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router';
import { registerUser } from '../authslice.js';
import { useEffect } from 'react';

// Schema validation using Zod
const SignupSchema = z
  .object({
    FirstName: z.string().min(3, 'Name should contain at least 3 characters'),
    emailId: z.string().email('Invalid Email'),
    password: z.string().min(8, 'Password should contain at least 8 characters'),
    confirmPassword: z.string().min(8, 'Confirm password is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

function SignUp() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isAuthenticated, loading} = useSelector((state)=>state.auth);

  const {register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(SignupSchema) });

    useEffect(()=>{
        if(isAuthenticated){
            navigate('/');
        }
    },[isAuthenticated]);

  const onSubmit = (data)=>{
    delete data.confirmPassword;
     dispatch(registerUser(data));
  }

  return (
    <div className="min-h-screen flex justify-center items-center bg-base-200">
      <div className="card w-full max-w-md shadow-2xl bg-base-100 p-6">
        <h2 className="text-3xl font-bold text-center mb-4 bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">Rapid Code</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div>
            <label className="label">
              <span className="label-text">Full Name</span>
            </label>
            <input
              {...register('FirstName')}
              placeholder="Enter Name"
              className="input input-bordered w-full"
            />

            {errors.FirstName && (
              <p className="text-error text-sm mt-1">{errors.FirstName.message}</p>
            )}
          </div>

          <div>
            <label className="label">
              <span className="label-text">Email</span>
            </label>
            <input
              {...register('emailId')} 
              placeholder="Enter Email"
              type="email"
              className="input input-bordered w-full"
            />

            {errors.emailId && (
              <p className="text-error text-sm mt-1">{errors.emailId.message}</p>
            )}
          </div>

          <div>
            <label className="label">
              <span className="label-text">Password</span>
            </label>
            <input
              {...register('password')}
              placeholder="Enter Password"
              type="password"
              className="input input-bordered w-full"
            />
            {errors.password && (
              <p className="text-error text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label className="label">
              <span className="label-text">Confirm Password</span>
            </label>
            <input
              {...register('confirmPassword')}
              placeholder="Confirm Password"
              type="password"
              className="input input-bordered w-full"
            />
            {errors.confirmPassword && (
              <p className="text-error text-sm mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          <div className='form-control mt-8 flex justify-center'>
            <button type="submit" 
              className={`btn btn-primary ${loading ? 'loading' : ''}`} 
              disabled={loading}
            >
              {loading ? 'Singning Up...' : 'Sign Up'}
            </button>
          </div>

          
        </form>

        {/* Added login redirect section */}
        <div className="text-center mt-4">
          <p className="text-sm">
            Already have an account?{' '}
            <Link to="/login" className="link link-primary">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignUp;