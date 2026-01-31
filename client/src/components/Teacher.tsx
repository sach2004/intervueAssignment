import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../hooks/useSocket";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { resetPoll, setPoll, updateResults } from "../store/pollSlice";
import ChatPopup from "./ChatPopup";

const SERVER_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const COLORS = {
  p1: "#7765DA",
  p2: "#5767D0",
  p3: "#4F0DCE",
  light: "#F2F2F2",
  dark: "#373737",
  mid: "#6E6E6E",
};

const GRADIENT_PURPLE = `linear-gradient(90deg, ${COLORS.p1} 0%, ${COLORS.p2} 50%, ${COLORS.p3} 100%)`;
const GRADIENT_DARK = `linear-gradient(90deg, ${COLORS.dark} 0%, ${COLORS.mid} 100%)`;

const ChatIcon = () => (
  <svg
    width="33"
    height="33"
    viewBox="0 0 33 33"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M27.625 0H4.875C3.58207 0 2.34209 0.513615 1.42785 1.42785C0.513615 2.34209 0 3.58207 0 4.875V21.125C0 22.4179 0.513615 23.6579 1.42785 24.5721C2.34209 25.4864 3.58207 26 4.875 26H23.7087L29.7213 32.0288C29.8731 32.1794 30.0532 32.2985 30.2512 32.3794C30.4491 32.4603 30.6611 32.5012 30.875 32.5C31.0882 32.5055 31.2996 32.461 31.4925 32.37C31.7893 32.2481 32.0433 32.0411 32.2226 31.775C32.4019 31.509 32.4984 31.1958 32.5 30.875V4.875C32.5 3.58207 31.9864 2.34209 31.0721 1.42785C30.1579 0.513615 28.9179 0 27.625 0ZM29.25 26.9588L25.5287 23.2213C25.3769 23.0706 25.1968 22.9515 24.9988 22.8706C24.8009 22.7898 24.5889 22.7488 24.375 22.75H4.875C4.44402 22.75 4.0307 22.5788 3.72595 22.274C3.42121 21.9693 3.25 21.556 3.25 21.125V4.875C3.25 4.44402 3.42121 4.0307 3.72595 3.72595C4.0307 3.42121 4.44402 3.25 4.875 3.25H27.625C28.056 3.25 28.4693 3.42121 28.774 3.72595C29.0788 4.0307 29.25 4.44402 29.25 4.875V26.9588Z"
      fill="white"
    />
  </svg>
);

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

const EyeIcon = () => (
  <svg
    width="28"
    height="19"
    viewBox="0 0 28 19"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M13.75 0C7.5 0 2.1625 3.8875 0 9.375C2.1625 14.8625 7.5 18.75 13.75 18.75C20.0063 18.75 25.3375 14.8625 27.5 9.375C25.3375 3.8875 20.0063 0 13.75 0ZM13.75 15.625C10.3 15.625 7.5 12.825 7.5 9.375C7.5 5.925 10.3 3.125 13.75 3.125C17.2 3.125 20 5.925 20 9.375C20 12.825 17.2 15.625 13.75 15.625ZM13.75 5.625C11.6812 5.625 10 7.30625 10 9.375C10 11.4438 11.6812 13.125 13.75 13.125C15.8188 13.125 17.5 11.4438 17.5 9.375C17.5 7.30625 15.8188 5.625 13.75 5.625Z"
      fill="white"
    />
  </svg>
);

const CaretDown = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M7 10L12 15L17 10"
      stroke={COLORS.p1}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

function GradientButton({
  children,
  className = "",
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{ background: disabled ? "#D3D3D3" : GRADIENT_PURPLE }}
      className={`text-white rounded-full font-semibold transition-all ${disabled ? "cursor-not-allowed" : "hover:opacity-90"} ${className}`}
    >
      {children}
    </button>
  );
}

function ResultRow({
  index,
  label,
  percentage,
}: {
  index: number;
  label: string;
  percentage: number;
}) {
  const textWhite = percentage >= 45;
  const barWidth = percentage <= 0 ? "0%" : `${Math.max(percentage, 12)}%`;

  return (
    <div className="flex items-center gap-4">
      <div className="relative w-full h-[64px] rounded-xl overflow-hidden border border-[#E6E6E6] bg-[#F2F2F2]">
        {percentage > 0 && (
          <div
            className="absolute left-0 top-0 h-full rounded-xl"
            style={{
              width: barWidth,
              background: COLORS.p1,
            }}
          />
        )}

        <div className="relative z-10 h-full px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-bold text-sm text-[#7765DA]">
              {index + 1}
            </div>
            <span
              className={`text-lg font-semibold ${textWhite ? "text-white" : "text-black"}`}
            >
              {label}
            </span>
          </div>

          <div className="text-black font-bold text-lg pr-2">{percentage}%</div>
        </div>
      </div>
    </div>
  );
}

export default function Teacher() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentPoll = useAppSelector((state) => state.poll.currentPoll);

  const socket = useSocket();

  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [correctOption, setCorrectOption] = useState<number | null>(null);
  const [timer, setTimer] = useState(60);

  const [showResults, setShowResults] = useState(false);
  const [liveResults, setLiveResults] = useState<any>({});
  const [chatOpen, setChatOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [askingQuestion, setAskingQuestion] = useState(false);

  useEffect(() => {
    if (!socket) return;

    socket.emit("teacher-joined");

    socket.on("new-question", (poll: any) => {
      dispatch(setPoll(poll));
      setShowResults(true);
      setLiveResults({});
      setAskingQuestion(false);
    });

    socket.on("polling-results", (results: any) => {
      dispatch(updateResults(results));
    });

    socket.on("live-results-update", (results: any) => {
      setLiveResults(results);
    });

    axios
      .get(`${SERVER_URL}/api/poll/active`)
      .then((res) => {
        if (res.data.poll) {
          dispatch(setPoll(res.data.poll));
          setShowResults(true);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch active poll:", err);
        setLoading(false);
      });

    return () => {
      socket.off("new-question");
      socket.off("polling-results");
      socket.off("live-results-update");
    };
  }, [socket, dispatch]);

  const addOption = () => {
    if (options.length < 4) setOptions([...options, ""]);
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

    setAskingQuestion(true);

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

  const resultsNormalized = useMemo(() => {
    if (!currentPoll) return [];
    return currentPoll.options.map((opt: string) => {
      const r = liveResults?.[opt] || { count: 0, percentage: 0 };
      return { option: opt, percentage: Number(r.percentage || 0) };
    });
  }, [currentPoll, liveResults]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-20 h-20 border-8 border-[#7765DA] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-3xl font-bold text-black">Loading...</h2>
        </div>
      </div>
    );
  }

  if (showResults && currentPoll) {
    return (
      <>
        <div className="min-h-screen bg-white">
          <div className="mx-auto max-w-[1100px] px-8 pt-14 pb-10 min-h-screen flex flex-col">
            <div className="flex items-center justify-end">
              <button
                onClick={() => navigate("/poll-history")}
                className="rounded-full px-7 py-4 text-sm font-semibold text-white flex items-center gap-3"
                style={{ background: COLORS.p1 }}
              >
                <EyeIcon />
                <span>View Poll history</span>
              </button>
            </div>

            <div className="flex-1 flex items-center justify-center">
              <div className="w-full max-w-[820px]">
                <h2 className="text-4xl font-bold text-black mb-8">Question</h2>

                <div
                  className="rounded-2xl overflow-hidden border-2"
                  style={{ borderColor: COLORS.p1 }}
                >
                  <div
                    className="px-6 py-4 text-white text-lg font-semibold"
                    style={{ background: GRADIENT_DARK }}
                  >
                    {currentPoll.question}
                  </div>

                  <div className="bg-white p-6 space-y-4">
                    {resultsNormalized.map((row, index) => (
                      <ResultRow
                        key={row.option}
                        index={index}
                        label={row.option}
                        percentage={row.percentage}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex justify-end mt-10">
                  <GradientButton
                    onClick={askAnother}
                    className="px-12 py-4 text-base"
                  >
                    + Ask a new question
                  </GradientButton>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => setChatOpen(!chatOpen)}
          style={{ background: "#5767D0" }}
          className="fixed bottom-8 right-8 w-16 h-16 text-white rounded-full shadow-2xl flex items-center justify-center z-40 hover:opacity-90 transition-all"
        >
          <ChatIcon />
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
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 flex items-center px-32 py-16">
        <div className="w-full">
          <div className="mb-8">
            <div
              className="inline-flex items-center gap-2 text-white px-4 py-2 rounded-full text-sm font-semibold"
              style={{ background: GRADIENT_PURPLE }}
            >
              <PollIcon />
              <span>Intervue Poll</span>
            </div>
          </div>

          <h1 className="text-6xl mb-6">
            <span className="font-light">Let's</span>{" "}
            <span className="font-bold">Get Started</span>
          </h1>

          <p className="text-[#9CA3AF] mb-12 text-lg max-w-2xl">
            you'll have the ability to create and manage polls, ask questions,
            and monitor your students' responses in real-time.
          </p>

          <div className="max-w-5xl">
            <div className="flex items-center justify-between mb-6">
              <label className="text-black font-bold text-lg">
                Enter your question
              </label>

              <div className="relative">
                <select
                  value={timer}
                  onChange={(e) => setTimer(Number(e.target.value))}
                  className="appearance-none border border-gray-300 rounded-lg pl-4 pr-10 py-2 text-sm bg-white text-black font-semibold focus:outline-none focus:ring-2 focus:ring-[#7765DA]"
                >
                  <option value={10}>10 seconds</option>
                  <option value={20}>20 seconds</option>
                  <option value={30}>30 seconds</option>
                  <option value={40}>40 seconds</option>
                  <option value={50}>50 seconds</option>
                  <option value={60}>60 seconds</option>
                  <option value={90}>90 seconds</option>
                  <option value={120}>120 seconds</option>
                </select>

                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                  <CaretDown />
                </div>
              </div>
            </div>

            <div className="relative mb-6">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Rahul Bajaj"
                className="w-full bg-[#F2F2F2] border-none rounded-2xl p-6 pb-14 focus:outline-none focus:ring-2 focus:ring-[#7765DA] resize-none text-base"
                rows={5}
              />
              <div className="absolute bottom-5 right-6 text-sm text-[#6E6E6E]">
                {question.length}/100
              </div>
            </div>

            <div className="grid grid-cols-2 gap-16">
              <div>
                <label className="text-black font-bold mb-5 block text-lg">
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
                        className="flex-1 bg-[#F2F2F2] border-none rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-[#7765DA] text-base"
                      />
                    </div>
                  ))}
                </div>
                {options.length < 4 && (
                  <button
                    onClick={addOption}
                    className="mt-5 ml-14 text-[#7765DA] border border-[#7765DA] px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-[#7765DA] hover:text-white transition-all"
                  >
                    + Add More option
                  </button>
                )}
              </div>

              <div>
                <label className="text-black font-bold mb-5 block text-lg">
                  Is it Correct?
                </label>

                <div className="space-y-4">
                  {options.map((_, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-6 h-[58px]"
                    >
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="correct"
                          checked={correctOption === index}
                          onChange={() => setCorrectOption(index)}
                          className="w-6 h-6 appearance-none border-2 border-gray-300 rounded-full checked:border-[#7765DA] checked:border-8"
                        />
                        <span className="text-black font-medium text-base">
                          Yes
                        </span>
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name={`option-${index}`}
                          checked={correctOption !== index}
                          onChange={() => {}}
                          className="w-6 h-6 appearance-none border-2 border-gray-300 rounded-full checked:border-[#7765DA] checked:border-8"
                        />
                        <span className="text-black font-medium text-base">
                          No
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200" />

      <div className="px-32 py-5">
        <div className="w-full flex justify-end">
          <GradientButton
            onClick={askQuestion}
            disabled={askingQuestion}
            className="px-12 py-3.5 text-base"
          >
            {askingQuestion ? "Asking..." : "Ask Question"}
          </GradientButton>
        </div>
      </div>
    </div>
  );
}
