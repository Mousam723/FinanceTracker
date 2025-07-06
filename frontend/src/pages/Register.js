import { useState } from 'react';
import { register } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, UserPlus, CheckCircle, XCircle, DollarSign } from 'lucide-react';

const Register = () => {
  const [form, setForm] = useState({ username: '', password: '' });
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage(''); // Clear any previous messages
    setErrorMessage('');
    
    try {
      console.log('Sending registration data:', form);
      await register(form);
      setSuccessMessage("Registration Successful! Redirecting to login...");
      setTimeout(() => {
        navigate('/'); // Navigate to the login page on successful registration
      }, 1000);
    } catch (err) {
      console.error("Registration error:", err.response ? err.response.data : err); // Log error
      const msg = err.response?.data?.message || "An unknown error occurred during registration.";
      setErrorMessage(`Registration failed: ${msg}`); // Set user-friendly error message
      // Optionally, clear the error message after some time
      setTimeout(() => {
        setErrorMessage('');
      }, 5000);
    }
  };

  return (
    // <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-green-400 to-teal-500">
    //   <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
    //     <h2 className="text-2xl font-bold mb-6 text-center text-gray-700">Register</h2>
    //     <form onSubmit={handleSubmit} className="space-y-4">
    //       <input
    //         type="text"
    //         placeholder="Username"
    //         value={form.username}
    //         onChange={e => setForm({ ...form, username: e.target.value })}
    //         required
    //         className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-400"
    //       />
    //       <input
    //         type="password"
    //         placeholder="Password"
    //         value={form.password}
    //         onChange={e => setForm({ ...form, password: e.target.value })}
    //         required
    //         className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-400"
    //       />
    //       <button type="submit" className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 transition duration-300">
    //         Register
    //       </button>
    //     </form>
    //     <p className="mt-4 text-center text-gray-600">
    //       Already have an account? <Link to="/" className="text-green-600 font-semibold">Login Here</Link>
    //     </p>
    //   </div>
    // </div>

    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-500 via-blue-500 to-green-500 p-4 sm:p-6 lg:p-8 font-inter">
      {/* FINANCE TRACKER BRANDING - positioned just above the white box */}
      <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-8 drop-shadow-xl text-center">
        Finance Tracker
      </h1>
      {/* END FINANCE TRACKER BRANDING */}

      <div className="bg-white bg-opacity-95 p-8 rounded-2xl shadow-xl w-full max-w-md backdrop-blur-sm transform transition-all duration-300 hover:scale-[1.01]">
        <div className="text-center mb-8">
          <DollarSign className="mx-auto h-16 w-16 text-blue-600 mb-4 animate-pulse" />
          <h2 className="text-3xl font-extrabold text-gray-800 mb-2">Create Your Account</h2>
          <p className="text-gray-600">Start tracking your finances today.</p>
        </div>

        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg relative mb-6 transition-all duration-300 ease-in-out transform scale-y-100 origin-top" role="alert">
            <CheckCircle className="inline mr-2" size={18} />
            <span className="block sm:inline text-sm">{successMessage}</span>
            <span className="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer" onClick={() => setSuccessMessage('')}>
              <svg className="fill-current h-6 w-6 text-green-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <title>Close</title>
                <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.172l-2.651 2.651a1.2 1.2 0 1 1-1.697-1.697L8.303 9.475l-2.651-2.651a1.2 1.2 0 1 1 1.697-1.697L10 7.78l2.651-2.651a1.2 1.2 0 0 1 1.697 1.697L11.697 9.475l2.651 2.651a1.2 1.2 0 0 1 0 1.697z"/>
              </svg>
            </span>
          </div>
        )}

        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6 transition-all duration-300 ease-in-out transform scale-y-100 origin-top" role="alert">
            <XCircle className="inline mr-2" size={18} />
            <span className="block sm:inline text-sm">{errorMessage}</span>
            <span className="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer" onClick={() => setErrorMessage('')}>
              <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <title>Close</title>
                <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.172l-2.651 2.651a1.2 1.2 0 1 1-1.697-1.697L8.303 9.475l-2.651-2.651a1.2 1.2 0 1 1 1.697-1.697L10 7.78l2.651-2.651a1.2 1.2 0 0 1 1.697 1.697L11.697 9.475l2.651 2.651a1.2 1.2 0 0 1 0 1.697z"/>
              </svg>
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Choose a Username"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              required
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-700"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="password"
              placeholder="Create a Password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-700"
            />
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center bg-gradient-to-r from-blue-600 to-green-600 text-white py-3 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-green-700 transition duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Register <UserPlus className="ml-2" size={20} />
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600 text-sm">
          Already have an account?{' '}
          <Link to="/" className="text-blue-600 font-bold hover:underline hover:text-blue-800 transition duration-200">
            Login Here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
