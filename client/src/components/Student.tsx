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
              <span>⚡</span>
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
              className="bg-[#7765DA] hover:bg-[#5767D0] text-white px-12 py-4 rounded-full font-semibold text-base"
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
                <span>⚡</span>
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
          className="fixed bottom-8 right-8 w-16 h-16 bg-[#7765DA] hover:bg-[#5767D0] text-white rounded-full shadow-2xl flex items-center justify-center text-2xl z-40"
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
                <span>⚡</span>
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
          className="fixed bottom-8 right-8 w-16 h-16 bg-[#7765DA] hover:bg-[#5767D0] text-white rounded-full shadow-2xl flex items-center justify-center text-2xl z-40"
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
              <span>⚡</span>
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
              className={`px-12 py-4 rounded-full font-semibold text-base transition-all ${
                selectedOption
                  ? "bg-[#7765DA] hover:bg-[#5767D0] text-white"
                  : "bg-[#D3D3D3] text-white cursor-not-allowed"
              }`}
            >
              Submit
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={() => setChatOpen(!chatOpen)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-[#7765DA] hover:bg-[#5767D0] text-white rounded-full shadow-2xl flex items-center justify-center text-2xl z-40"
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
