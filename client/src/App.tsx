import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import KickedOut from "./components/KickedOut";
import PollHistory from "./components/PollHistory";
import RoleSelector from "./components/RoleSelector";
import Student from "./components/Student";
import Teacher from "./components/Teacher";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RoleSelector />} />
        <Route path="/teacher" element={<Teacher />} />
        <Route path="/student" element={<Student />} />
        <Route path="/poll-history" element={<PollHistory />} />
        <Route path="/kicked-out" element={<KickedOut />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
