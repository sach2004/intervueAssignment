import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const SERVER_URL = "http://localhost:3001";

interface HistoricalPoll {
  _id: string;
  question: string;
  options: string[];
  results: Record<string, number>;
  createdAt: string;
}

const COLORS = {
  p1: "#7765DA",
  p2: "#5767D0",
  p3: "#4F0DCE",
  light: "#F2F2F2",
  dark: "#373737",
  mid: "#6E6E6E",
};

const GRADIENT_DARK = `linear-gradient(90deg, ${COLORS.dark} 0%, ${COLORS.mid} 100%)`;

function ResultRow({
  index,
  label,
  percentage,
}: {
  index: number;
  label: string;
  percentage: number;
}) {
  const showBar = percentage > 0;
  const barWidth = showBar ? `${Math.max(percentage, 12)}%` : "0%";
  const textWhite = percentage >= 45;

  return (
    <div className="flex items-center gap-4">
      <div className="relative w-full h-[64px] rounded-xl overflow-hidden border border-[#E6E6E6] bg-[#F2F2F2]">
        {showBar && (
          <div
            className="absolute left-0 top-0 h-full rounded-xl"
            style={{ width: barWidth, background: COLORS.p1 }}
          />
        )}

        <div className="relative z-10 h-full px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-bold text-sm text-[#7765DA]">
              {index + 1}
            </div>
            <span
              className={`text-lg font-semibold ${
                textWhite ? "text-white" : "text-black"
              }`}
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

export default function PollHistory() {
  const navigate = useNavigate();
  const [polls, setPolls] = useState<HistoricalPoll[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${SERVER_URL}/api/poll/history`)
      .then((res) => {
        setPolls(res.data.polls || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching history:", err);
        setLoading(false);
      });
  }, []);

  const normalizedPolls = useMemo(() => {
    return polls.map((p) => {
      const rows = (p.options || []).map((opt) => ({
        option: opt,
        percentage: Number(p.results?.[opt] ?? 0),
      }));
      return { ...p, rows };
    });
  }, [polls]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-20 h-20 border-8 border-[#7765DA] border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-[1100px] px-8 pt-14 pb-16">
        <div className="relative flex items-center justify-center mb-10">
          <h1 className="text-5xl font-light text-black text-center">
            View <span className="font-bold">Poll History</span>
          </h1>

          <button
            onClick={() => navigate("/teacher")}
            className="absolute right-0 top-1/2 -translate-y-1/2 text-[#6E6E6E] hover:text-black font-semibold text-sm"
          >
            ← Back
          </button>
        </div>

        {normalizedPolls.length === 0 ? (
          <div className="text-center text-[#6E6E6E] py-12 text-lg">
            No poll history available
          </div>
        ) : (
          <div className="space-y-16">
            {normalizedPolls.map((poll, pollIndex) => (
              <div key={poll._id}>
                <h2 className="text-2xl font-bold text-black mb-6">
                  Question {pollIndex + 1}
                </h2>

                <div
                  className="rounded-2xl overflow-hidden border-2"
                  style={{ borderColor: COLORS.p1 }}
                >
                  <div
                    className="px-6 py-4 text-white text-lg font-semibold"
                    style={{ background: GRADIENT_DARK }}
                  >
                    {poll.question}
                  </div>

                  <div className="bg-white p-6 space-y-4">
                    {poll.rows.map((row, index) => (
                      <ResultRow
                        key={`${poll._id}-${row.option}`}
                        index={index}
                        label={row.option}
                        percentage={row.percentage}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
