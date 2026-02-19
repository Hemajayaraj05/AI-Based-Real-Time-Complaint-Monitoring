import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { SendIcon, LockIcon } from "../../components/icons/IconComponents";

interface ComplaintFormData {
  title: string;
  description: string;
}

const RaiseComplaint = () => {
  const [form, setForm] = useState<ComplaintFormData>({
    title: "",
    description: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.title || !form.description) {
      setError("Please fill all required fields");
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch("http://localhost:4000/api/complaints", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
        }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.message || "Failed to submit complaint");
      }

      alert("Complaint submitted successfully.");
      navigate("/dashboard/my");
    } catch (err: any) {
      setError(err.message || "Submission failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 lg:space-y-10 pt-2 lg:pt-8">
      <div className="max-w-4xl mx-auto w-full">
        {/* Header Section */}
        <div className="mb-8 lg:mb-10">
          <h1 className="text-3xl lg:text-3xl  text-center font-bold text-slate-900 mb-3">
            Raise a Complaint
          </h1>
          {/* <p className="text-base lg:text-lg text-slate-600 leading-relaxed">
            Report an issue and our intelligent system will automatically analyze, categorize, 
            and route your complaint to the responsible department for quick resolution.
          </p> */}
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-xl lg:rounded-2xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden border border-purple-100">
          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-8 lg:p-10">
            {error && (
              <div className="mb-8 p-5 lg:p-6 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 text-base lg:text-lg font-medium flex items-start gap-3">
                <span className="text-xl shrink-0">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Title Field */}
            <div className="mb-8 lg:mb-10">
              <label className="block text-lg lg:text-xl font-bold text-slate-900 mb-3">
                Complaint Title
                <span className="text-red-500 ml-2">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Broken light fixture in Room 301"
                className="w-full rounded-xl border-2 border-purple-200 bg-purple-50 px-5 py-3.5 lg:py-4 text-base lg:text-lg text-slate-900 placeholder-slate-400 transition-all duration-200 focus:outline-none focus:bg-white focus:border-purple-600 focus:ring-2 focus:ring-purple-200"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                maxLength={200}
              />
              <div className="flex justify-between items-center mt-3">
                <p className="text-sm text-slate-500">
                  Be concise and specific about the issue
                </p>
                <p className="text-sm font-semibold text-slate-500">
                  {form.title.length}/200
                </p>
              </div>
            </div>

            {/* Description Field */}
            <div className="mb-8 lg:mb-10">
              <label className="block text-lg lg:text-xl font-bold text-slate-900 mb-3">
                Detailed Description
                <span className="text-red-500 ml-2">*</span>
              </label>
              <textarea
                rows={8}
                placeholder="Provide detailed information about your complaint. Include: What happened? When? Where? How is it affecting you?"
                className="w-full rounded-xl border-2 border-purple-200 bg-purple-50 px-5 py-3.5 lg:py-4 text-base lg:text-lg text-slate-900 placeholder-slate-400 transition-all duration-200 focus:outline-none focus:bg-white focus:border-purple-600 focus:ring-2 focus:ring-purple-200 resize-none"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                maxLength={1000}
              />
              <div className="flex justify-between items-center mt-3">
                <p className="text-sm text-slate-500">
                  Provide as much detail as possible for faster resolution
                </p>
                <p className="text-sm font-semibold text-slate-500">
                  {form.description.length}/1000
                </p>
              </div>
            </div>

            {/* Info Boxes */}
            <div className="space-y-5 mb-10 lg:mb-12">
              {/* How it works */}
              <div className="bg-linear-to-br from-purple-50 to-purple-50/50 rounded-xl lg:rounded-2xl p-6 lg:p-7 border-2 border-purple-200">
                <h3 className="font-bold text-purple-900 mb-5 text-lg lg:text-xl flex items-center gap-2">
                  <span className="text-2xl">⚡</span> How Our System Works
                </h3>
                <ul className="space-y-3 lg:space-y-4">
                  <li className="flex items-start gap-4">
                    <span className="text-purple-600 font-bold text-lg shrink-0 w-8 h-8 flex items-center justify-center bg-purple-200 rounded-lg">1</span>
                    <span className="text-base lg:text-lg text-purple-900 font-medium pt-0.5">Your complaint is analyzed and categorized automatically using AI</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="text-purple-600 font-bold text-lg shrink-0 w-8 h-8 flex items-center justify-center bg-purple-200 rounded-lg">2</span>
                    <span className="text-base lg:text-lg text-purple-900 font-medium pt-0.5">Priority level is assigned based on urgency and impact</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="text-purple-600 font-bold text-lg shrink-0 w-8 h-8 flex items-center justify-center bg-purple-200 rounded-lg">3</span>
                    <span className="text-base lg:text-lg text-purple-900 font-medium pt-0.5">It's routed to the responsible department automatically</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="text-purple-600 font-bold text-lg shrink-0 w-8 h-8 flex items-center justify-center bg-purple-200 rounded-lg">4</span>
                    <span className="text-base lg:text-lg text-purple-900 font-medium pt-0.5">Similar complaints are grouped for better tracking and resolution</span>
                  </li>
                </ul>
              </div>

              {/* Privacy Notice */}
              <div className="bg-linear-to-br from-emerald-50 to-emerald-50/50 rounded-xl lg:rounded-2xl p-6 lg:p-7 border-2 border-emerald-200 flex gap-4 lg:gap-5">
                <div className="w-8 h-8 text-emerald-600 shrink-0 mt-1 lg:mt-0">
                  <LockIcon />
                </div>
                <div>
                  <h3 className="font-bold text-emerald-900 text-lg lg:text-xl mb-2">🔒 Your Privacy is Protected</h3>
                  <p className="text-base lg:text-lg text-emerald-800 leading-relaxed">
                    Your identity remains completely anonymous to other users. Only authorized administrators 
                    and assigned specialists can see who raised the complaint—we take your privacy very seriously.
                  </p>
                </div>
              </div>

              {/* Tips Box */}
              {/* <div className="bg-linear-to-br from-blue-50 to-blue-50/50 rounded-xl lg:rounded-2xl p-6 lg:p-7 border-2 border-blue-200">
                <h3 className="font-bold text-blue-900 mb-4 text-lg lg:text-xl flex items-center gap-2">
                  <span className="text-2xl">💡</span> Tips for Better Resolution
                </h3>
                <ul className="space-y-2.5 lg:space-y-3">
                  <li className="flex items-start gap-3 text-base lg:text-lg text-blue-900">
                    <span className="text-blue-600 font-bold shrink-0">✓</span>
                    <span>Include specific locations, dates, and times when possible</span>
                  </li>
                  <li className="flex items-start gap-3 text-base lg:text-lg text-blue-900">
                    <span className="text-blue-600 font-bold shrink-0">✓</span>
                    <span>Describe the impact and urgency of the issue</span>
                  </li>
                  <li className="flex items-start gap-3 text-base lg:text-lg text-blue-900">
                    <span className="text-blue-600 font-bold shrink-0">✓</span>
                    <span>Mention any previous complaints or attempts to resolve it</span>
                  </li>
                </ul>
              </div>*/}
            </div> 

            {/* Action Buttons */}
            <div className="flex gap-4 flex-col sm:flex-row pt-2">
              <button
                type="submit"
                disabled={isLoading || !form.title || !form.description}
                className="flex-1 rounded-xl bg-linear-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-slate-400 disabled:to-slate-400 disabled:cursor-not-allowed text-white font-bold py-4 lg:py-4.5 px-6 transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl text-base lg:text-lg"
              >
                <div className="w-6 h-6">
                  <SendIcon />
                </div>
                {isLoading ? "Submitting..." : "Submit Complaint"}
              </button>

              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-8 lg:px-10 rounded-xl border-2 border-slate-300 hover:border-slate-400 text-slate-700 font-bold py-4 lg:py-4.5 transition-all duration-200 hover:bg-slate-50 text-base lg:text-lg"
              >
                Cancel
              </button>
            </div>

            {/* Submission Note */}
            <div className="mt-8 lg:mt-10 pt-8 lg:pt-10 border-t border-slate-200">
              <p className="text-sm lg:text-base text-slate-600 text-center leading-relaxed">
                <strong className="text-slate-900">Expected Response Time:</strong> Your complaint will be reviewed 
                and assigned within 24 hours. You can track its progress anytime from "My Complaints".
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RaiseComplaint;
