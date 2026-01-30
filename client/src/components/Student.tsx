import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  decrementTimer,
  setHasVoted,
  setPoll,
  setSelectedOption,
  updateResults,
} from "../store/pollSlice";
import ChatPopup from "./ChatPopup";

const SERVER_URL = "http://localhost:3001";

const PollIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 15 15"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12.1296 8.5898C12.1308 8.79582 12.0682 8.99715 11.9503 9.1661C11.8324 9.33504 11.665 9.46328 11.4712 9.53317L8.20912 10.7332L7.00907 13.9933C6.9381 14.1865 6.80954 14.3533 6.64074 14.4711C6.47194 14.589 6.27105 14.6522 6.0652 14.6522C5.85935 14.6522 5.65846 14.589 5.48966 14.4711C5.32087 14.3533 5.1923 14.1865 5.12133 13.9933L3.91876 10.7373L0.658172 9.53721C0.465109 9.46614 0.298491 9.33757 0.180797 9.16883C0.0631039 9.0001 0 8.79932 0 8.59359C0 8.38787 0.0631039 8.18709 0.180797 8.01835C0.298491 7.84962 0.465109 7.72104 0.658172 7.64998L3.92028 6.44993L5.12032 3.19035C5.19139 2.99729 5.31996 2.83067 5.4887 2.71298C5.65743 2.59529 5.85821 2.53218 6.06394 2.53218C6.26966 2.53218 6.47044 2.59529 6.63918 2.71298C6.80791 2.83067 6.93649 2.99729 7.00755 3.19035L8.2076 6.45246L11.4672 7.6525C11.6608 7.72138 11.8283 7.84841 11.9469 8.0162C12.0655 8.18399 12.1293 8.38434 12.1296 8.5898ZM8.59262 2.52641H9.60319V3.53698C9.60319 3.67099 9.65642 3.79951 9.75118 3.89427C9.84594 3.98903 9.97446 4.04226 10.1085 4.04226C10.2425 4.04226 10.371 3.98903 10.4658 3.89427C10.5605 3.79951 10.6138 3.67099 10.6138 3.53698V2.52641H11.6243C11.7583 2.52641 11.8868 2.47318 11.9816 2.37842C12.0764 2.28366 12.1296 2.15514 12.1296 2.02113C12.1296 1.88712 12.0764 1.7586 11.9816 1.66384C11.8868 1.56908 11.7583 1.51585 11.6243 1.51585H10.6138V0.505283C10.6138 0.371273 10.5605 0.242753 10.4658 0.147994C10.371 0.053235 10.2425 0 10.1085 0C9.97446 0 9.84594 0.053235 9.75118 0.147994C9.65642 0.242753 9.60319 0.371273 9.60319 0.505283V1.51585H8.59262C8.45862 1.51585 8.33009 1.56908 8.23533 1.66384C8.14058 1.7586 8.08734 1.88712 8.08734 2.02113C8.08734 2.15514 8.14058 2.28366 8.23533 2.37842C8.33009 2.47318 8.45862 2.52641 8.59262 2.52641ZM14.1507 4.54754H13.6454V4.04226C13.6454 3.90825 13.5922 3.77973 13.4975 3.68497C13.4027 3.59021 13.2742 3.53698 13.1402 3.53698C13.0062 3.53698 12.8776 3.59021 12.7829 3.68497C12.6881 3.77973 12.6349 3.90825 12.6349 4.04226V4.54754H12.1296C11.9956 4.54754 11.8671 4.60078 11.7723 4.69554C11.6776 4.7903 11.6243 4.91882 11.6243 5.05283C11.6243 5.18683 11.6776 5.31536 11.7723 5.41011C11.8671 5.50487 11.9956 5.55811 12.1296 5.55811H12.6349V6.06339C12.6349 6.1974 12.6881 6.32592 12.7829 6.42068C12.8776 6.51544 13.0062 6.56867 13.1402 6.56867C13.2742 6.56867 13.4027 6.51544 13.4975 6.42068C13.5922 6.32592 13.6454 6.1974 13.6454 6.06339V5.55811H14.1507C14.2847 5.55811 14.4133 5.50487 14.508 5.41011C14.6028 5.31536 14.656 5.18683 14.656 5.05283C14.656 4.91882 14.6028 4.7903 14.508 4.69554C14.4133 4.60078 14.2847 4.54754 14.1507 4.54754Z"
      fill="white"
    />
  </svg>
);

export default function Student() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentPoll, remainingTime, hasVoted, selectedOption } =
    useAppSelector((state) => state.poll);

  const [socket, setSocket] = useState<Socket | null>(null);
  const [name, setName] = useState("");
  const [hasSetName, setHasSetName] = useState(false);
  const [error, setError] = useState("");
  const [voteSubmitted, setVoteSubmitted] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    const savedName = sessionStorage.getItem("studentName");
    if (savedName) {
      setName(savedName);
      connectWithName(savedName);
    }
  }, []);

  const connectWithName = (studentName: string) => {
    const newSocket = io(SERVER_URL);
    setSocket(newSocket);

    newSocket.emit("student-set-name", { name: studentName });

    newSocket.on("new-question", (poll: any) => {
      dispatch(setPoll(poll));
      setVoteSubmitted(false);
    });

    newSocket.on("polling-results", (results: any) => {
      dispatch(updateResults(results));
      dispatch(setHasVoted(true));
    });

    newSocket.on("already-voted", (data: any) => {
      dispatch(setSelectedOption(data.option));
      setVoteSubmitted(true);
    });

    newSocket.on("vote-success", () => {
      setVoteSubmitted(true);
    });

    newSocket.on("error", (data: any) => {
      setError(data.message);
      setTimeout(() => setError(""), 3000);
    });

    newSocket.on("kicked-out", () => {
      sessionStorage.removeItem("studentName");
      newSocket.close();
      navigate("/kicked-out");
    });

    axios
      .get(`${SERVER_URL}/api/poll/active`)
      .then((res) => {
        if (res.data.poll) {
          dispatch(setPoll(res.data.poll));
        }
      })
      .catch((err) => console.error("Error:", err));

    setHasSetName(true);
  };

  const handleSetName = () => {
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }
    sessionStorage.setItem("studentName", name.trim());
    connectWithName(name.trim());
  };

  const handleVote = () => {
    if (!socket || !selectedOption) return;
    socket.emit("handle-polling", { option: selectedOption });
  };

  useEffect(() => {
    if (!currentPoll || hasVoted || remainingTime <= 0) return;

    const interval = setInterval(() => {
      dispatch(decrementTimer());
    }, 1000);

    return () => clearInterval(interval);
  }, [currentPoll, hasVoted, remainingTime, dispatch]);

  if (!hasSetName) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="flex items-center justify-center mb-8">
            <div className="bg-[#7765DA] text-white px-5 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
              <PollIcon />
              <span>Intervue Poll</span>
            </div>
          </div>

          <h1 className="text-4xl font-bold text-black mb-3 text-center">
            Let's Get Started
          </h1>
          <p className="text-[#6E6E6E] text-center mb-10 text-base leading-relaxed">
            If you're a student, you'll be able to{" "}
            <span className="font-semibold">submit your answers</span>,
            participate in live polls, and see how your responses compare with
            your classmates
          </p>

          {error && (
            <div className="bg-red-100 text-red-700 px-4 py-3 rounded-xl mb-4 text-center">
              {error}
            </div>
          )}

          <div className="mb-8">
            <label className="block text-black font-bold mb-3 text-base">
              Enter your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Rahul Bajaj"
              onKeyPress={(e) => e.key === "Enter" && handleSetName()}
              className="w-full bg-[#F2F2F2] border-none rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-[#7765DA] text-base"
            />
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleSetName}
              style={{
                background:
                  "linear-gradient(90deg, #7765DA 0%, #5767D0 50%, #4F0DCE 100%)",
              }}
              className="px-12 py-4 rounded-full font-semibold text-white hover:opacity-90 transition-all"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentPoll) {
    return (
      <>
        <div className="min-h-screen bg-white flex items-center justify-center p-4">
          <div className="max-w-2xl w-full text-center">
            <div className="flex items-center justify-center mb-8">
              <div className="bg-[#7765DA] text-white px-5 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
                <PollIcon />
                <span>Intervue Poll</span>
              </div>
            </div>

            <div className="mb-8">
              <div className="w-20 h-20 border-8 border-[#7765DA] border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>

            <h2 className="text-3xl font-bold text-black">
              Wait for the teacher to ask questions..
            </h2>
          </div>
        </div>

        <button
          onClick={() => setChatOpen(!chatOpen)}
          style={{
            background:
              "linear-gradient(90deg, #7765DA 0%, #5767D0 50%, #4F0DCE 100%)",
          }}
          className="fixed bottom-8 right-8 w-16 h-16 text-white rounded-full shadow-2xl flex items-center justify-center text-2xl z-40 hover:opacity-90 transition-all"
        >
          💬
        </button>

        <ChatPopup
          socket={socket}
          isOpen={chatOpen}
          onClose={() => setChatOpen(false)}
          isTeacher={false}
        />
      </>
    );
  }

  if (hasVoted || currentPoll.status === "completed") {
    return (
      <>
        <div className="min-h-screen bg-white flex items-start justify-center p-8">
          <div className="max-w-3xl w-full mt-8">
            <div className="flex items-center justify-center mb-8">
              <div className="bg-[#7765DA] text-white px-5 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
                <PollIcon />
                <span>Intervue Poll</span>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-3xl font-bold text-black">Question 1</h2>
              <div className="flex items-center gap-2 text-red-600">
                <span className="text-xl">⏱️</span>
                <span className="font-bold text-xl">00:00</span>
              </div>
            </div>

            <div className="bg-[#6E6E6E] text-white p-5 rounded-2xl mb-8 text-lg">
              {currentPoll.question}
            </div>

            <div className="space-y-4 mb-10">
              {currentPoll.options.map((option, index) => {
                const percentage = currentPoll.results[option] || 0;
                return (
                  <div key={option} className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 bg-[#7765DA] text-white rounded-full font-bold text-base flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 bg-white border border-[#E0E0E0] rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-black text-base">
                          {option}
                        </span>
                        <span className="text-black font-bold text-base">
                          {percentage}%
                        </span>
                      </div>
                      <div className="w-full bg-[#F2F2F2] rounded-full h-3">
                        <div
                          className="bg-[#7765DA] h-full rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-center text-black text-lg font-semibold">
              Wait for the teacher to ask a new question..
            </div>
          </div>
        </div>

        <button
          onClick={() => setChatOpen(!chatOpen)}
          style={{
            background:
              "linear-gradient(90deg, #7765DA 0%, #5767D0 50%, #4F0DCE 100%)",
          }}
          className="fixed bottom-8 right-8 w-16 h-16 text-white rounded-full shadow-2xl flex items-center justify-center text-2xl z-40 hover:opacity-90 transition-all"
        >
          💬
        </button>

        <ChatPopup
          socket={socket}
          isOpen={chatOpen}
          onClose={() => setChatOpen(false)}
          isTeacher={false}
        />
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-white flex items-start justify-center p-8">
        <div className="max-w-3xl w-full mt-8">
          <div className="flex items-center justify-center mb-8">
            <div className="bg-[#7765DA] text-white px-5 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
              <PollIcon />
              <span>Intervue Poll</span>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-3xl font-bold text-black">Question 1</h2>
            <div className="flex items-center gap-2 text-red-600">
              <span className="text-xl">⏱️</span>
              <span className="font-bold text-xl">
                00:{remainingTime.toString().padStart(2, "0")}
              </span>
            </div>
          </div>

          <div className="bg-[#6E6E6E] text-white p-5 rounded-2xl mb-8 text-lg">
            {currentPoll.question}
          </div>

          {error && (
            <div className="bg-red-100 text-red-700 px-4 py-3 rounded-xl mb-4 text-center">
              {error}
            </div>
          )}

          <div className="space-y-4 mb-8">
            {currentPoll.options.map((option, index) => (
              <div
                key={option}
                onClick={() => dispatch(setSelectedOption(option))}
                className={`flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                  selectedOption === option
                    ? "border-[#7765DA] bg-[#F2F2F2]"
                    : "border-[#E0E0E0] hover:border-[#7765DA] bg-white"
                }`}
              >
                <div className="flex items-center justify-center w-10 h-10 bg-[#7765DA] text-white rounded-full font-bold text-base flex-shrink-0">
                  {index + 1}
                </div>
                <span className="font-semibold text-black text-base">
                  {option}
                </span>
              </div>
            ))}
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleVote}
              disabled={!selectedOption}
              style={{
                background: selectedOption
                  ? "linear-gradient(90deg, #7765DA 0%, #5767D0 50%, #4F0DCE 100%)"
                  : "#D3D3D3",
              }}
              className={`px-12 py-4 rounded-full font-semibold text-white transition-all ${
                selectedOption ? "hover:opacity-90" : "cursor-not-allowed"
              }`}
            >
              Submit
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={() => setChatOpen(!chatOpen)}
        style={{
          background:
            "linear-gradient(90deg, #7765DA 0%, #5767D0 50%, #4F0DCE 100%)",
        }}
        className="fixed bottom-8 right-8 w-16 h-16 text-white rounded-full shadow-2xl flex items-center justify-center text-2xl z-40 hover:opacity-90 transition-all"
      >
        💬
      </button>

      <ChatPopup
        socket={socket}
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        isTeacher={false}
      />
    </>
  );
}
