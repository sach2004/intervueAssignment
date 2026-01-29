interface Props {
  onSelectRole: (role: "teacher" | "student") => void;
}

export default function RoleSelector({ onSelectRole }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
      <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
        Live Polling System
      </h1>
      <p className="text-gray-600 text-center mb-8">
        Select your role to continue
      </p>
      <div className="flex flex-col gap-4">
        <button
          onClick={() => onSelectRole("teacher")}
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg"
        >
          👨‍🏫 I'm a Teacher
        </button>
        <button
          onClick={() => onSelectRole("student")}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg"
        >
          👨‍🎓 I'm a Student
        </button>
      </div>
    </div>
  );
}
