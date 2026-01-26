import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

const LoginLayout: React.FC<Props> = ({ children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-[#f6edf3] via-[#d8a6c9] to-[#6b2d6f]">
      <div className="bg-white rounded-4xl shadow-2xl w-[90%] max-w-5xl grid md:grid-cols-2 overflow-hidden">
        <div className="flex items-center justify-center p-8">
          <div className="relative w-full max-w-md h-105 rounded-[28px] overflow-hidden shadow-xl">
            <img
              src="/login.png"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-purple-600/40 mix-blend-multiply" />
          </div>
        </div>

        {children}
      </div>
    </div>
  );
};

export default LoginLayout;
