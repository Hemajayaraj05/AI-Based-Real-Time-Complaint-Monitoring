import { Mail, Lock } from "lucide-react";

const MainLogin = () => {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4
      bg-[radial-gradient(circle_at_top,_#1e3a8a,_#020617)]
      relative overflow-hidden"
    >
      {/* Background Glow */}
      <div className="absolute top-[-120px] left-[-120px] w-72 sm:w-96 h-72 sm:h-96 
        bg-blue-600/30 rounded-full blur-3xl"></div>

      <div className="absolute bottom-[-120px] right-[-120px] w-72 sm:w-96 h-72 sm:h-96 
        bg-indigo-700/30 rounded-full blur-3xl"></div>

      {/* Login Card */}
      <div
        className="relative bg-white/95 backdrop-blur-xl
        w-full max-w-sm sm:max-w-md
        p-6 sm:p-10
        rounded-3xl shadow-2xl
        transition-transform duration-300"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-5 sm:mb-6">
          <img
            src="/logo.png"
            alt="College Logo"
            className="w-16 sm:w-20 h-16 sm:h-20 mb-3"
          />
          <h1
            className="text-center text-sm sm:text-lg font-extrabold
            tracking-wide text-gray-900"
          >
            SRI SHAKTHI INSTITUTE OF
            <br />
            ENGINEERING AND TECHNOLOGY
          </h1>
          <p className="text-[10px] sm:text-xs tracking-widest text-gray-500 mt-1">
            LOGIN PORTAL
          </p>
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="text-sm font-semibold text-gray-700">
            Email
          </label>
          <div className="relative mt-1">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 
              text-gray-400 w-5 h-5" />
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full pl-10 pr-4 py-3 text-sm
              border rounded-xl focus:outline-none
              focus:ring-2 focus:ring-blue-700"
            />
          </div>
        </div>

        {/* Password */}
        <div className="mb-1">
          <label className="text-sm font-semibold text-gray-700">
            Password
          </label>
          <div className="relative mt-1">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 
              text-gray-400 w-5 h-5" />
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full pl-10 pr-4 py-3 text-sm
              border rounded-xl focus:outline-none
              focus:ring-2 focus:ring-blue-700"
            />
          </div>
        </div>

        {/* Forgot password */}
        <div className="text-right mb-5">
          <a
            href="#"
            className="text-xs sm:text-sm font-medium
            text-blue-700 hover:text-blue-900"
          >
            Forgot Password?
          </a>
        </div>

        {/* Submit */}
        <button
          className="w-full py-3 rounded-xl text-white font-bold
          text-sm sm:text-base
          bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900
          hover:shadow-xl active:scale-95 transition-all duration-300"
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default MainLogin;
