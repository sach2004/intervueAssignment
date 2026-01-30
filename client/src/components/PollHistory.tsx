import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const SERVER_URL = "http://localhost:3001";

interface HistoricalPoll {
  _id: string;
  question: string;
  options: string[];
  results: { [key: string]: number };
  createdAt: string;
}

export default function PollHistory() {
  const navigate = useNavigate();
  const [polls, setPolls] = useState<HistoricalPoll[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${SERVER_URL}/api/poll/history`)
      .then((res) => {
        setPolls(res.data.polls);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching history:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-20 h-20 border-8 border-[#7765DA] border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-4xl font-bold text-black">View Poll History</h1>
          <button
            onClick={() => navigate("/teacher")}
            className="text-[#6E6E6E] hover:text-black font-semibold text-base"
          >
            ← Back
          </button>
        </div>

        {polls.length === 0 ? (
          <div className="text-center text-[#6E6E6E] py-12 text-lg">
            No poll history available
          </div>
        ) : (
          <div className="space-y-12">
            {polls.map((poll, pollIndex) => (
              <div key={poll._id}>
                <h2 className="text-2xl font-bold text-black mb-6">
                  Question {pollIndex + 1}
                </h2>
                <div className="bg-[#6E6E6E] text-white p-5 rounded-2xl mb-6 text-lg">
                  {poll.question}
                </div>
                <div className="space-y-4">
                  {Object.entries(poll.results)
                    .sort((a, b) => b[1] - a[1])
                    .map(([option, percentage], index) => (
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
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
