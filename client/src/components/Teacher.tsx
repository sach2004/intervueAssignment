import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { resetPoll, setPoll, updateResults } from "../store/pollSlice";
import ChatPopup from "./ChatPopup";

const SERVER_URL = "http://localhost:3001";

export default function Teacher() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentPoll = useAppSelector((state) => state.poll.currentPoll);

  const [socket, setSocket] = useState<Socket | null>(null);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [correctOption, setCorrectOption] = useState<number | null>(null);
  const [timer, setTimer] = useState(60);
  const [showResults, setShowResults] = useState(false);
  const [liveResults, setLiveResults] = useState<any>({});
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    const newSocket = io(SERVER_URL);
    setSocket(newSocket);

    newSocket.emit("teacher-joined");

    newSocket.on("new-question", (poll: any) => {
      dispatch(setPoll(poll));
      setShowResults(true);
      setLiveResults({});
    });

    newSocket.on("polling-results", (results: any) => {
      dispatch(updateResults(results));
    });

    newSocket.on("live-results-update", (results: any) => {
      setLiveResults(results);
    });

    axios.get(`${SERVER_URL}/api/poll/active`).then((res) => {
      if (res.data.poll) {
        dispatch(setPoll(res.data.poll));
        setShowResults(true);
      }
    });

    return () => {
      newSocket.close();
    };
  }, [dispatch]);

  const addOption = () => {
    if (options.length < 4) {
      setOptions([...options, ""]);
    }
  };

  const changeOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const askQuestion = () => {
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

  const askAnother = () => {
    setQuestion("");
    setOptions(["", ""]);
    setCorrectOption(null);
    setTimer(60);
    setShowResults(false);
    setLiveResults({});
    dispatch(resetPoll());
  };

  if (showResults && currentPoll) {
    return (
      <>
        <div className="min-h-screen bg-white flex items-start justify-center p-8">
          <div className="max-w-2xl w-full mt-8">
            <div className="flex items-center justify-between mb-8">
              <div className="bg-[#7765DA] text-white px-5 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
                <span>⚡</span>
                <span>Intervue Poll</span>
              </div>
              <button
                onClick={() => navigate("/poll-history")}
                className="bg-[#7765DA] hover:bg-[#5767D0] text-white px-6 py-3 rounded-full font-semibold flex items-center gap-2 text-sm"
              >
                <span>👁️</span>
                <span>View Poll history</span>
              </button>
            </div>

            <h2 className="text-3xl font-bold text-black mb-6">Question</h2>

            <div className="bg-[#6E6E6E] text-white p-5 rounded-2xl mb-8 text-lg">
              {currentPoll.question}
            </div>

            <div className="space-y-4 mb-10">
              {currentPoll.options.map((option, index) => {
                const result = liveResults[option] || {
                  count: 0,
                  percentage: 0,
                };
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
                          {result.percentage}%
                        </span>
                      </div>
                      <div className="w-full bg-[#F2F2F2] rounded-full h-3">
                        <div
                          className="bg-[#7765DA] h-full rounded-full transition-all duration-500"
                          style={{ width: `${result.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-center">
              <button
                onClick={askAnother}
                className="bg-[#7765DA] hover:bg-[#5767D0] text-white px-10 py-4 rounded-full font-semibold text-base"
              >
                + Ask a new question
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
          isTeacher={true}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-start justify-center p-8">
      <div className="max-w-4xl w-full mt-8">
        <div className="flex items-center justify-center mb-8">
          <div className="bg-[#7765DA] text-white px-5 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
            <span>⚡</span>
            <span>Intervue Poll</span>
          </div>
        </div>

        <h1 className="text-4xl font-bold text-black mb-3">
          Let's Get Started
        </h1>
        <p className="text-[#6E6E6E] mb-10 text-base">
          you'll have the ability to create and manage polls, ask questions, and
          monitor your students' responses in real-time.
        </p>

        <div className="flex items-center justify-between mb-4">
          <label className="text-black font-bold text-base">
            Enter your question
          </label>
          <select
            value={timer}
            onChange={(e) => setTimer(Number(e.target.value))}
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm bg-white text-[#7765DA] font-semibold"
          >
            <option value={10}>10 seconds ▼</option>
            <option value={20}>20 seconds ▼</option>
            <option value={30}>30 seconds ▼</option>
            <option value={40}>40 seconds ▼</option>
            <option value={50}>50 seconds ▼</option>
            <option value={60}>60 seconds ▼</option>
            <option value={90}>90 seconds ▼</option>
            <option value={120}>120 seconds ▼</option>
          </select>
        </div>

        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Rahul Bajaj"
          className="w-full bg-[#F2F2F2] border-none rounded-2xl p-5 mb-2 focus:outline-none focus:ring-2 focus:ring-[#7765DA] resize-none text-base"
          rows={3}
        />
        <div className="text-right text-sm text-[#6E6E6E] mb-10">
          {question.length}/100
        </div>

        <div className="grid grid-cols-2 gap-12 mb-8">
          <div>
            <label className="text-black font-bold mb-4 block text-base">
              Edit Options
            </label>
            <div className="space-y-4">
              {options.map((option, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-[#7765DA] text-white rounded-full font-bold text-base flex-shrink-0">
                    {index + 1}
                  </div>
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => changeOption(index, e.target.value)}
                    placeholder="Rahul Bajaj"
                    className="flex-1 bg-[#F2F2F2] border-none rounded-xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-[#7765DA] text-base"
                  />
                </div>
              ))}
            </div>
            {options.length < 4 && (
              <button
                onClick={addOption}
                className="mt-4 text-[#6E6E6E] border border-[#E0E0E0] px-5 py-2 rounded-full text-sm hover:border-[#7765DA] hover:text-[#7765DA]"
              >
                + Add More option
              </button>
            )}
          </div>

          <div>
            <label className="text-black font-bold mb-4 block text-base">
              Is it Correct?
            </label>
            <div className="space-y-4">
              {options.map((option, index) => (
                <div key={index} className="flex items-center gap-6 h-[52px]">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className="relative">
                      <input
                        type="radio"
                        name="correct"
                        checked={correctOption === index}
                        onChange={() => setCorrectOption(index)}
                        className="w-6 h-6 appearance-none border-2 border-gray-300 rounded-full checked:border-[#7765DA] checked:border-8"
                      />
                    </div>
                    <span className="text-black font-medium">Yes</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className="relative">
                      <input
                        type="radio"
                        name={`option-${index}`}
                        checked={correctOption !== index}
                        onChange={() => {}}
                        className="w-6 h-6 appearance-none border-2 border-gray-300 rounded-full checked:border-[#7765DA] checked:border-8"
                      />
                    </div>
                    <span className="text-black font-medium">No</span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={askQuestion}
            className="bg-[#7765DA] hover:bg-[#5767D0] text-white px-12 py-4 rounded-full font-semibold text-base"
          >
            Ask Question
          </button>
        </div>
      </div>
    </div>
  );
}
