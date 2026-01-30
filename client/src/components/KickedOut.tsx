import { useNavigate } from "react-router-dom";

export default function KickedOut() {
  const navigate = useNavigate();

  const goHome = () => {
    sessionStorage.removeItem("studentName");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        <div className="flex items-center justify-center mb-8">
          <div className="bg-[#7765DA] text-white px-5 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
            <span>⚡</span>
            <span>Intervue Poll</span>
          </div>
        </div>

        <h1 className="text-5xl font-bold text-black mb-6">
          You've been Kicked out !
        </h1>
        <p className="text-[#6E6E6E] mb-10 text-base leading-relaxed">
          Looks like the teacher had removed you from the poll system .Please
          Try again sometime.
        </p>

        <button
          onClick={goHome}
          className="bg-[#7765DA] hover:bg-[#5767D0] text-white px-12 py-4 rounded-full font-semibold text-base"
        >
          Go to Home
        </button>
      </div>
    </div>
  );
}
