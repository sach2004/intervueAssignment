import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { resetPoll, setPoll, updateResults } from "../store/pollSlice";
import Results from "./Results";

const SERVER_URL = "http://localhost:3001";

export default function Teacher() {
  const dispatch = useAppDispatch();
  const currentPoll = useAppSelector((state) => state.poll.currentPoll);

  const [socket, setSocket] = useState<Socket | null>(null);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [timer, setTimer] = useState(60);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const newSocket = io(SERVER_URL);
    setSocket(newSocket);

    newSocket.on("new-question", (poll: any) => {
      dispatch(setPoll(poll));
      setShowResults(true);
    });

    newSocket.on("polling-results", (results: any) => {
      dispatch(updateResults(results));
    });

    return () => {
      newSocket.close();
    };
  }, [dispatch]);

  const handleAddOption = () => {
    if (options.length < 4) {
      setOptions([...options, ""]);
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleAskQuestion = () => {
    if (!socket || !question.trim()) {
      alert("Please enter a question");
      return;
    }

    const validOptions = options.filter((opt) => opt.trim() !== "");
    if (validOptions.length < 2) {
      alert("Please provide at least 2 options");
      return;
    }

    socket.emit("teacher-ask-question", {
      question: question.trim(),
      options: validOptions,
      timer,
    });
  };

  const handleAskAnother = () => {
    setQuestion("");
    setOptions(["", ""]);
    setTimer(60);
    setShowResults(false);
    dispatch(resetPoll());
  };

  if (showResults && currentPoll) {
    return (
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          👨‍🏫 Teacher Dashboard
        </h1>
        <div className="bg-purple-50 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            {currentPoll.question}
          </h2>
        </div>
        <Results results={currentPoll.results} />
        <button
          onClick={handleAskAnother}
          className="mt-8 w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl transition-all"
        >
          Ask Another Question
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        👨‍🏫 Teacher Dashboard
      </h1>

      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Question
        </label>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Enter your question..."
          rows={3}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Options (2-4)
        </label>
        <div className="space-y-3">
          {options.map((option, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                placeholder={`Option ${index + 1}`}
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
              />
              {options.length > 2 && (
                <button
                  onClick={() => handleRemoveOption(index)}
                  className="px-4 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-all"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
        {options.length < 4 && (
          <button
            onClick={handleAddOption}
            className="mt-3 text-purple-600 hover:text-purple-700 font-semibold"
          >
            + Add Option
          </button>
        )}
      </div>

      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Timer (seconds)
        </label>
        <input
          type="number"
          value={timer}
          onChange={(e) => setTimer(Number(e.target.value))}
          min={10}
          max={60}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
        />
      </div>

      <button
        onClick={handleAskQuestion}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 rounded-xl transition-all transform hover:scale-105 shadow-lg"
      >
        Ask Question
      </button>
    </div>
  );
}
