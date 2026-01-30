import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RoleSelector() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<"student" | "teacher" | null>(null);

  const handleContinue = () => {
    if (selected) {
      navigate(`/${selected}`);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="flex items-center justify-center mb-8">
          <div className="bg-[#7765DA] text-white px-5 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
            <span>⚡</span>
            <span>Intervue Poll</span>
          </div>
        </div>

        <h1 className="text-5xl font-bold text-black mb-4 text-center">
          Welcome to the Live Polling System
        </h1>
        <p className="text-[#6E6E6E] text-center mb-12 text-base">
          Please select the role that best describes you to begin using the live
          polling system
        </p>

        <div className="grid grid-cols-2 gap-6 mb-10">
          <div
            onClick={() => setSelected("student")}
            className={`border-2 ${
              selected === "student"
                ? "border-[#7765DA] bg-[#F2F2F2]"
                : "border-[#E0E0E0]"
            } rounded-2xl p-8 cursor-pointer transition-all hover:border-[#7765DA] bg-white`}
          >
            <h3 className="text-xl font-bold text-black mb-3">I'm a Student</h3>
            <p className="text-[#6E6E6E] text-sm leading-relaxed">
              Lorem Ipsum is simply dummy text of the printing and typesetting
              industry
            </p>
          </div>

          <div
            onClick={() => setSelected("teacher")}
            className={`border-2 ${
              selected === "teacher"
                ? "border-[#7765DA] bg-[#F2F2F2]"
                : "border-[#E0E0E0]"
            } rounded-2xl p-8 cursor-pointer transition-all hover:border-[#7765DA] bg-white`}
          >
            <h3 className="text-xl font-bold text-black mb-3">I'm a Teacher</h3>
            <p className="text-[#6E6E6E] text-sm leading-relaxed">
              Submit answers and view live poll results in real-time.
            </p>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleContinue}
            disabled={!selected}
            className={`px-16 py-4 rounded-full font-semibold text-white transition-all ${
              selected
                ? "bg-[#7765DA] hover:bg-[#5767D0]"
                : "bg-[#D3D3D3] cursor-not-allowed"
            }`}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
