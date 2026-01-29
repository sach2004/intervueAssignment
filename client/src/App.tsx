import { useState } from "react";
import RoleSelector from "./components/RoleSelector";
import Student from "./components/Student";
import Teacher from "./components/Teacher";

function App() {
  const [role, setRole] = useState<"teacher" | "student" | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center p-4">
      {!role && <RoleSelector onSelectRole={setRole} />}
      {role === "teacher" && <Teacher />}
      {role === "student" && <Student />}
    </div>
  );
}

export default App;
