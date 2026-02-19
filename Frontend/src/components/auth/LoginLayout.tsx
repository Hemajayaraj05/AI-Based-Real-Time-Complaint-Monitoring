import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

const LoginLayout: React.FC<Props> = ({ children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-purple-50 via-white to-purple-50 px-4 py-8 md:py-0 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80  rounded-full blur-3xl"></div>
      </div>

      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 overflow-hidden border border-white/20 relative z-10">
        
        {/* LEFT FULL PANEL */}
        <div className="hidden md:flex flex-col items-center justify-center bg-linear-to-br from-purple-600 via-purple-700 to-purple-900 p-10 min-h-96 md:min-h-auto">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-white/30">
              <span className="text-4xl">📋</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Complaint Hub</h2>
            <p className="text-indigo-100 text-lg mb-8">Efficient Complaint Management System</p>
            <div className="space-y-4 text-left max-w-xs mx-auto">
              <div className="flex items-start gap-3">
                <span className="text-2xl mt-1">✓</span>
                <p className="text-indigo-100">Real-time complaint tracking and management</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl mt-1">✓</span>
                <p className="text-indigo-100">Intelligent clustering and prioritization</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl mt-1">✓</span>
                <p className="text-indigo-100">Seamless division-wise assignment</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT CONTENT */}
        <div className="p-6 sm:p-10 md:p-12 flex flex-col justify-center min-h-96 md:min-h-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default LoginLayout;
