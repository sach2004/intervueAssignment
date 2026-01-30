interface Props {
  results: { [key: string]: number };
}

export default function Results({ results }: Props) {
  return (
    <div className="space-y-3">
      {Object.entries(results).map(([option, percentage], index) => (
        <div
          key={option}
          className="flex items-center gap-3 bg-[#F2F2F2] p-3 rounded-xl"
        >
          <div className="flex items-center justify-center w-8 h-8 bg-[#7765DA] text-white rounded-full font-bold text-sm">
            {index + 1}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-[#373737]">{option}</span>
              <span className="text-[#373737] font-bold">{percentage}%</span>
            </div>
            <div className="w-full bg-white rounded-full h-2">
              <div
                className="bg-[#7765DA] h-full rounded-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
