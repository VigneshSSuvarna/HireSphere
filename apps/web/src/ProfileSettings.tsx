import { useState } from "react";
import { useAuthStore } from "./store/authStore";

export default function ProfileSettings() {
  const activeUser = useAuthStore((state) => state.user);

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Form States
  const [fullName, setFullName] = useState(
    activeUser?.email.split("@")[0] || ""
  );
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage("");

    // Simulate a database update delay
    setTimeout(() => {
      setIsSaving(false);
      setMessage("Profile updated successfully!");

      // Clear the success message after 3 seconds
      setTimeout(() => setMessage(""), 3000);
    }, 1500);
  };

  if (!activeUser) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-8 rounded-2xl border border-slate-700 shadow-xl flex items-center gap-6">
        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center text-3xl font-bold text-white shadow-lg border-4 border-slate-900">
          {fullName.substring(0, 2).toUpperCase()}
        </div>

        <div>
          <h2 className="text-3xl font-extrabold text-white capitalize">
            {fullName}
          </h2>

          <p className="text-slate-400 mt-1">
            {activeUser.email} •{" "}
            <span className="uppercase text-xs font-bold text-purple-400 bg-purple-500/10 px-2 py-1 rounded">
              {activeUser.role}
            </span>
          </p>
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        
        <div className="p-6 border-b border-slate-800 bg-slate-950/50">
          <h3 className="text-lg font-bold text-slate-200">
            Personal Information
          </h3>

          <p className="text-sm text-slate-500">
            Update your contact details and public bio.
          </p>
        </div>

        <form onSubmit={handleSave} className="p-8 space-y-6">
          
          {message && (
            <div className="bg-green-500/10 border border-green-500/50 text-green-400 p-4 rounded-lg text-sm text-center font-medium animate-in fade-in slide-in-from-top-2">
              {message}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Full Name
              </label>

              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors capitalize"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Phone Number
              </label>

              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
              />
            </div>

          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              About Me (Bio)
            </label>

            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              placeholder="Tell recruiters a little bit about your skills and goals..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors resize-none"
            ></textarea>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className={`px-8 py-3 rounded-lg font-bold transition-all shadow-lg ${
                isSaving
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/20"
              }`}
            >
              {isSaving ? "Saving Changes..." : "Save Profile"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}