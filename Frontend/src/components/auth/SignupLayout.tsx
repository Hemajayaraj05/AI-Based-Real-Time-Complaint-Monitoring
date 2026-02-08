import React from "react";

interface SignupLayoutProps {
  children: React.ReactNode;
}

const SignupLayout: React.FC<SignupLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen w-full bg-gray-100">
      {children}
    </div>
  );
};

export default SignupLayout;
