import { useState } from "react";

interface ComplaintFormData {
  category: string;
  description: string;
  image: File | null;
}

const RaiseComplaint = () => {
  const [form, setForm] = useState<ComplaintFormData>({
    category: "",
    description: "",
    image: null,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.category || !form.description) {
      alert("Please fill all required fields");
      return;
    }

    alert("Complaint submitted successfully ✅");
  };

  return (
    /* 🔹 PAGE WRAPPER WITH BACKGROUND IMAGE */
    <div
      className="
        min-h-screen
        overflow-x-hidden
        bg-no-repeat bg-cover bg-center
        flex items-center justify-center
        px-3 sm:px-6 md:px-8
        relative
      "
      style={{
        backgroundImage: "url('/image.png')",
      }}
    >
      {/* 🔹 LIGHT OVERLAY FOR READABILITY */}
      <div className="absolute inset-0 bg-white/60"></div>

      {/* 🔹 FORM CONTAINER (UNCHANGED STYLES) */}
      <div className="relative w-full max-w-xl">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          {/* HEADER */}
          <div className="px-5 sm:px-8 py-4 border-b border-gray-200 bg-gray-50">
            <h1 className="text-lg sm:text-xl font-semibold text-slate-800">
              Raise Your Voice
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Submit your complaint securely
            </p>
          </div>

          {/* FORM */}
          <form
            onSubmit={handleSubmit}
            className="px-5 sm:px-8 py-5 space-y-4"
          >
            {/* CATEGORY */}
            <select
              className="
                w-full rounded-md
                border border-gray-300
                bg-gray-50
                px-3 py-2 text-sm
                focus:outline-none
                focus:ring-1 focus:ring-blue-500
              "
              value={form.category}
              onChange={(e) =>
                setForm({ ...form, category: e.target.value })
              }
            >
              <option value="">Complaint related to</option>
              <option value="hostel">Hostel</option>
              <option value="transport">Transport</option>
              <option value="faculty">Faculty</option>
              <option value="ragging">Ragging / Harassment</option>
              <option value="others">Others</option>
            </select>

            {/* DESCRIPTION */}
            <textarea
              rows={3}
              placeholder="Describe your issue briefly..."
              className="
                w-full rounded-md
                border border-gray-300
                bg-gray-50
                px-3 py-2 text-sm
                focus:outline-none
                focus:ring-1 focus:ring-blue-500
              "
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />

            {/* FILE */}
            <input
              type="file"
              className="
                block w-full
                text-xs sm:text-sm
                text-gray-600
                file:mr-3 file:px-3 file:py-1.5
                file:rounded-md file:border-0
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100
              "
              onChange={(e) =>
                setForm({
                  ...form,
                  image: e.target.files ? e.target.files[0] : null,
                })
              }
            />

            {/* SUBMIT */}
            <button
              type="submit"
              className="
                w-full rounded-md
                bg-blue-600
                hover:bg-blue-500
                text-white
                text-sm
                py-2
                transition
              "
            >
              Submit Complaint
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RaiseComplaint;
