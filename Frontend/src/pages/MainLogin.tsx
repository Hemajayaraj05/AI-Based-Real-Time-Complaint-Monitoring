const MainLogin = () => {
  return (
    <div
      className="min-h-screen flex items-center justify-center
      bg-gradient-to-b from-[#f6edf3] via-[#d8a6c9] to-[#6b2d6f]"
    >
      <div
        className="bg-white rounded-[32px] shadow-2xl
        w-[90%] max-w-5xl grid md:grid-cols-2 overflow-hidden"
      >
        {/* LEFT IMAGE SECTION */}
        <div className="flex items-center justify-center p-8">
          <div
            className="relative w-full max-w-md h-[420px]
            rounded-[28px] overflow-hidden shadow-xl"
          >
            <img
              src="/login.png"
              alt="Login Illustration"
              className="w-full h-full object-cover"
            />
            <div
              className="absolute inset-0 bg-purple-600/40
              mix-blend-multiply"
            ></div>
          </div>
        </div>

        {/* RIGHT LOGIN FORM */}
        <div className="p-10 flex flex-col justify-center">
          <div className="text-center mb-6">
            <img
              src="/logo.png"
              alt="College Logo"
              className="w-16 mx-auto mb-3"
            />

            <h1 className="text-xl font-bold text-black">
              SRI SHAKTHI INSTITUTE OF ENGINEERING AND TECHNOLOGY
            </h1>

            <p className="text-gray-500 text-sm">Login Portal</p>
          </div>

          <form>
            {/* EMAIL */}
            <label className="text-sm font-semibold text-gray-700">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your Email"
              className="w-full px-4 py-3 border rounded-lg
              focus:ring-2 focus:ring-purple-500 outline-none"
            />

            {/* ⭐ SPACE ADDED HERE */}
            <label className="text-sm font-semibold text-gray-700 mt-4 block">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your Password"
              className="w-full px-4 py-3 border rounded-lg
              focus:ring-2 focus:ring-purple-500 outline-none"
            />

            <div className="text-right text-sm text-purple-600 cursor-pointer mt-2">
              Forgot Password?
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-purple-600
              text-white font-semibold hover:bg-purple-700 transition mt-4"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MainLogin;
