interface Props {
  results: { [key: string]: number };
}

export default function Results({ results }: Props) {
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        📊 Live Results
      </h2>
      <div className="space-y-4">
        {Object.entries(results).map(([option, percentage]) => (
          <div key={option}>
            <div className="flex justify-between mb-2">
              <span className="font-semibold text-gray-700">{option}</span>
              <span className="font-bold text-purple-600">
                {percentage.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden">
              <div
                className="bg-gradient-to-r from-purple-600 to-indigo-600 h-full rounded-full transition-all duration-500 flex items-center justify-center text-white font-semibold text-sm"
                style={{ width: `${percentage}%` }}
              >
                {percentage > 10 && `${percentage.toFixed(1)}%`}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
