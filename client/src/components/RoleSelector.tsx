import { useState } from "react";
import { useNavigate } from "react-router-dom";

const PollIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 15 15"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12.1296 8.5898C12.1308 8.79582 12.0682 8.99715 11.9503 9.1661C11.8324 9.33504 11.665 9.46328 11.4712 9.53317L8.20912 10.7332L7.00907 13.9933C6.9381 14.1865 6.80954 14.3533 6.64074 14.4711C6.47194 14.589 6.27105 14.6522 6.0652 14.6522C5.85935 14.6522 5.65846 14.589 5.48966 14.4711C5.32087 14.3533 5.1923 14.1865 5.12133 13.9933L3.91876 10.7373L0.658172 9.53721C0.465109 9.46614 0.298491 9.33757 0.180797 9.16883C0.0631039 9.0001 0 8.79932 0 8.59359C0 8.38787 0.0631039 8.18709 0.180797 8.01835C0.298491 7.84962 0.465109 7.72104 0.658172 7.64998L3.92028 6.44993L5.12032 3.19035C5.19139 2.99729 5.31996 2.83067 5.4887 2.71298C5.65743 2.59529 5.85821 2.53218 6.06394 2.53218C6.26966 2.53218 6.47044 2.59529 6.63918 2.71298C6.80791 2.83067 6.93649 2.99729 7.00755 3.19035L8.2076 6.45246L11.4672 7.6525C11.6608 7.72138 11.8283 7.84841 11.9469 8.0162C12.0655 8.18399 12.1293 8.38434 12.1296 8.5898Z"
      fill="white"
    />
  </svg>
);

export default function Landing() {
  const navigate = useNavigate();
  const [role, setRole] = useState<"student" | "teacher">("student");

  const gradientStyle = {
    background: "linear-gradient(90deg, #7765DA 0%, #5767D0 50%, #4F0DCE 100%)",
  } as const;

  const handleContinue = () => {
    if (role === "student") navigate("/student");
    else navigate("/teacher");
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="w-full max-w-[1100px] text-center">
        <div className="flex items-center justify-center mb-8">
          <div
            style={gradientStyle}
            className="text-white px-5 py-2 rounded-full text-sm font-semibold flex items-center gap-2"
          >
            <PollIcon />
            <span>Intervue Poll</span>
          </div>
        </div>

        <h1 className="text-6xl font-semibold text-black leading-tight whitespace-nowrap">
          Welcome to the{" "}
          <span className="font-extrabold">Live Polling System</span>
        </h1>

        <p className="text-[#6E6E6E] text-xl mt-4 max-w-[760px] mx-auto leading-relaxed">
          Please select the role that best describes you to begin using the live
          polling system
        </p>

        <div className="mt-12 flex items-stretch justify-center gap-10">
          <button
            type="button"
            onClick={() => setRole("student")}
            className={`w-[430px] rounded-2xl border p-8 text-left transition-all ${
              role === "student" ? "border-[#2F2ABF]" : "border-[#E6E6E6]"
            }`}
            style={
              role === "student"
                ? { boxShadow: "0 0 0 2px rgba(47,42,191,0.15)" }
                : undefined
            }
          >
            <div className="text-2xl font-extrabold text-black">
              I’m a Student
            </div>
            <div className="mt-3 text-[#6E6E6E] text-lg leading-relaxed">
              Lorem Ipsum is simply dummy text of the printing and typesetting
              industry
            </div>
          </button>

          <button
            type="button"
            onClick={() => setRole("teacher")}
            className={`w-[430px] rounded-2xl border p-8 text-left transition-all ${
              role === "teacher" ? "border-[#2F2ABF]" : "border-[#E6E6E6]"
            }`}
            style={
              role === "teacher"
                ? { boxShadow: "0 0 0 2px rgba(47,42,191,0.15)" }
                : undefined
            }
          >
            <div className="text-2xl font-extrabold text-black">
              I’m a Teacher
            </div>
            <div className="mt-3 text-[#6E6E6E] text-lg leading-relaxed">
              Submit answers and view live poll
              <br />
              results in real-time.
            </div>
          </button>
        </div>

        <div className="mt-12 flex justify-center">
          <button
            onClick={handleContinue}
            style={gradientStyle}
            className="w-[340px] py-6 rounded-full font-semibold text-white text-lg hover:opacity-90 transition-all"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
