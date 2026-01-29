import axios from "axios";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  decrementTimer,
  setHasVoted,
  setPoll,
  setSelectedOption,
  updateResults,
} from "../store/pollSlice";
import Results from "./Results";

const SERVER_URL = "http://localhost:3001";

export default function Student() {
  const dispatch = useAppDispatch();
  const { currentPoll, remainingTime, hasVoted, selectedOption } =
    useAppSelector((state) => state.poll);

  const [socket, setSocket] = useState<Socket | null>(null);
  const [name, setName] = useState("");
  const [hasSetName, setHasSetName] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const savedName = localStorage.getItem("studentName");
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
    });

    newSocket.on("polling-results", (results: any) => {
      dispatch(updateResults(results));
      dispatch(setHasVoted(true));
    });

    newSocket.on("already-voted", (data: any) => {
      dispatch(setSelectedOption(data.option));
      dispatch(setHasVoted(true));
    });

    newSocket.on("vote-success", () => {
      dispatch(setHasVoted(true));
    });

    newSocket.on("error", (data: any) => {
      setError(data.message);
      setTimeout(() => setError(""), 3000);
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
    localStorage.setItem("studentName", name.trim());
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
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
          👨‍🎓 Student Portal
        </h1>
        <p className="text-gray-600 text-center mb-6">
          Enter your name to participate
        </p>
        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          onKeyPress={(e) => e.key === "Enter" && handleSetName()}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none mb-4"
        />
        <button
          onClick={handleSetName}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-all"
        >
          Join Poll
        </button>
      </div>
    );
  }

  if (!currentPoll) {
    return (
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          👨‍🎓 Welcome, {name}!
        </h1>
        <div className="text-purple-600 text-lg">Waiting for question...</div>
      </div>
    );
  }

  if (hasVoted || currentPoll.status === "completed") {
    return (
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">👨‍🎓 {name}</h1>
        <div className="bg-purple-50 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            {currentPoll.question}
          </h2>
          {selectedOption && (
            <p className="text-purple-600 font-semibold">
              You voted for: {selectedOption}
            </p>
          )}
        </div>
        <Results results={currentPoll.results} />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">👨‍🎓 {name}</h1>
      <div className="bg-purple-50 rounded-xl p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          {currentPoll.question}
        </h2>
      </div>

      <div
        className={`text-center text-4xl font-bold mb-6 ${
          remainingTime <= 10 ? "text-red-600 animate-pulse" : "text-purple-600"
        }`}
      >
        ⏱️ {remainingTime}s
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 px-4 py-3 rounded-xl mb-4">
          {error}
        </div>
      )}

      <div className="space-y-3 mb-6">
        {currentPoll.options.map((option) => (
          <div
            key={option}
            onClick={() => dispatch(setSelectedOption(option))}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              selectedOption === option
                ? "border-purple-600 bg-purple-50 font-semibold"
                : "border-gray-300 hover:border-purple-300 hover:bg-gray-50"
            }`}
          >
            {option}
          </div>
        ))}
      </div>

      <button
        onClick={handleVote}
        disabled={!selectedOption}
        className={`w-full py-4 rounded-xl font-semibold transition-all ${
          selectedOption
            ? "bg-green-600 hover:bg-green-700 text-white"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
      >
        Submit Vote
      </button>
    </div>
  );
}
