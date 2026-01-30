import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";

interface ChatMessage {
  id: string;
  sender: string;
  message: string;
  timestamp: Date;
  isTeacher: boolean;
}

interface Props {
  socket: Socket | null;
  isOpen: boolean;
  onClose: () => void;
  isTeacher?: boolean;
  currentStudentName?: string;
}

export default function ChatPopup({
  socket,
  isOpen,
  onClose,
  isTeacher = false,
  currentStudentName = "",
}: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [activeTab, setActiveTab] = useState<"chat" | "participants">("chat");

  useEffect(() => {
    if (!socket || !isOpen) return;

    socket.emit("get-chat-history");

    socket.on("chat-history", (history: ChatMessage[]) => {
      setMessages(history);
    });

    socket.on("chat-message", (message: ChatMessage) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.off("chat-history");
      socket.off("chat-message");
    };
  }, [socket, isOpen]);

  const sendMessage = () => {
    if (!socket || !newMessage.trim()) return;

    socket.emit("send-chat-message", { message: newMessage.trim() });
    setNewMessage("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-24 right-8 w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col z-50">
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab("chat")}
          className={`flex-1 py-3 font-semibold ${
            activeTab === "chat"
              ? "text-purple-600 border-b-2 border-purple-600"
              : "text-gray-500"
          }`}
        >
          Chat
        </button>
        <button
          onClick={() => setActiveTab("participants")}
          className={`flex-1 py-3 font-semibold ${
            activeTab === "participants"
              ? "text-purple-600 border-b-2 border-purple-600"
              : "text-gray-500"
          }`}
        >
          Participants
        </button>
        <button
          onClick={onClose}
          className="px-4 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      {activeTab === "chat" ? (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => {
              const isOwnMessage = isTeacher
                ? msg.isTeacher
                : msg.sender === currentStudentName;

              return (
                <div
                  key={msg.id}
                  className={isOwnMessage ? "text-right" : "text-left"}
                >
                  <div className="text-xs text-gray-500 mb-1">
                    {msg.isTeacher ? "Teacher" : msg.sender}
                  </div>
                  <div
                    className={`inline-block px-4 py-2 rounded-lg max-w-[80%] ${
                      msg.isTeacher
                        ? "bg-gray-700 text-white"
                        : "bg-purple-600 text-white"
                    }`}
                  >
                    {msg.message}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 border-t flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:border-purple-500"
            />
            <button
              onClick={sendMessage}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Send
            </button>
          </div>
        </>
      ) : (
        <ParticipantsList socket={socket} isTeacher={isTeacher} />
      )}
    </div>
  );
}

function ParticipantsList({
  socket,
  isTeacher,
}: {
  socket: Socket | null;
  isTeacher: boolean;
}) {
  const [students, setStudents] = useState<
    { socketId: string; name: string }[]
  >([]);

  useEffect(() => {
    if (!socket) return;

    socket.emit("get-students-list");

    socket.on("students-updated", (updatedStudents) => {
      setStudents(updatedStudents);
    });

    return () => {
      socket.off("students-updated");
    };
  }, [socket]);

  const kickStudent = (socketId: string) => {
    if (socket && isTeacher) {
      socket.emit("kick-student", { socketId });
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="space-y-2">
        <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded font-semibold text-sm">
          <span>Name</span>
          {isTeacher && <span>Action</span>}
        </div>
        {students.map((student) => (
          <div
            key={student.socketId}
            className="flex justify-between items-center py-2 px-3 hover:bg-gray-50 rounded"
          >
            <span className="font-medium">{student.name}</span>
            {isTeacher && (
              <button
                onClick={() => kickStudent(student.socketId)}
                className="text-blue-600 hover:text-blue-800 text-sm font-semibold"
              >
                Kick out
              </button>
            )}
          </div>
        ))}
        {students.length === 0 && (
          <div className="text-center text-gray-500 py-4">
            No students connected
          </div>
        )}
      </div>
    </div>
  );
}
