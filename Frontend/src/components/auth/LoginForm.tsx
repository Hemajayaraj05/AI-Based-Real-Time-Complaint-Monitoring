const LoginForm: React.FC = () => {
  return (
    <div className="p-10 flex flex-col justify-center">
      <div className="text-center mb-6">
        <img src="/logo.png" className="w-16 mx-auto mb-3" />
        <h1 className="text-xl font-bold">
          SRI SHAKTHI INSTITUTE OF ENGINEERING AND TECHNOLOGY
        </h1>
        <p className="text-gray-500 text-sm">Login Portal</p>
      </div>

      <form>
        <label className="text-sm font-semibold">Email</label>
        <input
          type="email"
          className="w-full px-4 py-3 border rounded-lg mb-4"
        />

        <label className="text-sm font-semibold">Password</label>
        <input
          type="password"
          className="w-full px-4 py-3 border rounded-lg"
        />

        <div className="text-right text-sm text-purple-600 mt-2">
          Forgot Password?
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-purple-600 text-white rounded-lg mt-4"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
