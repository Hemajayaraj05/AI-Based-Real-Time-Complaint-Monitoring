import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

const LoginLayout: React.FC<Props> = ({ children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center  from-[#f6edf3]  px-6">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 overflow-hidden">
        
        {/* LEFT FULL PANEL */}
        <div className="hidden md:flex items-center justify-center bg-gradient-to-br from-purple-600 to-indigo-600 p-10">
          {/* <img
            src="/login-illustration.png"
            alt="Illustration"
            className="max-w-sm"
          /> */}
        </div>

        {/* RIGHT CONTENT */}
        <div className="p-10 flex flex-col justify-center">
          {children}
        </div>
      </div>
    </div>
  );
};

export default LoginLayout;
