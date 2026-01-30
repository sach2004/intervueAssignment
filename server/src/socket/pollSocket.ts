import { Server, Socket } from "socket.io";
import { PollSocketController } from "../controllers/PollSocketController.js";
import { Student } from "../models/index.js";

interface ChatMessage {
  id: string;
  sender: string;
  message: string;
  timestamp: Date;
  isTeacher: boolean;
}

const chatMessages: ChatMessage[] = [];
const connectedStudents = new Map<string, { socketId: string; name: string }>();

export function setupPollSocket(io: Server) {
  io.on("connection", (socket: Socket) => {
    console.log("User connected:", socket.id);

    socket.on("teacher-ask-question", async (data: any) => {
      try {
        const pollData = await PollSocketController.handleAskQuestion(data);

        io.emit("new-question", pollData);

        setTimeout(async () => {
          try {
            const results = await PollSocketController.completePollTimer(
              pollData._id,
            );

            io.emit("polling-results", results);
            io.emit("poll-completed", { pollId: pollData._id });
          } catch (error) {
            console.error("Error completing poll:", error);
          }
        }, data.timer * 1000);
      } catch (error: any) {
        console.error("Error asking question:", error);
        socket.emit("error", { message: error.message });
      }
    });

    socket.on("handle-polling", async (data: any) => {
      try {
        const { option } = data;
        const studentName = (socket as any).studentName;

        const { currentResults, option: votedOption } =
          await PollSocketController.handleSubmitVote(studentName, option);

        io.emit("live-results-update", currentResults);

        socket.emit("vote-success", {
          message: "Vote submitted successfully",
          option: votedOption,
        });

        console.log(`${studentName} voted for: ${votedOption}`);
      } catch (error: any) {
        console.error("Error handling vote:", error);
        socket.emit("error", { message: error.message });
      }
    });

    socket.on("student-set-name", async (data: any) => {
      try {
        const { name } = data;

        (socket as any).studentName = name;
        (socket as any).isTeacher = false;

        connectedStudents.set(socket.id, { socketId: socket.id, name });

        io.emit("students-updated", Array.from(connectedStudents.values()));

        await Student.findOneAndUpdate(
          { name },
          { socketId: socket.id, name, voted: false },
          { upsert: true, new: true },
        );

        console.log(`Student ${name} connected (${socket.id})`);

        const { poll, hasVoted, votedOption } =
          await PollSocketController.handleStudentConnect(name);

        if (poll) {
          socket.emit("new-question", poll);

          if (hasVoted) {
            socket.emit("already-voted", { option: votedOption });
          }
        }
      } catch (error: any) {
        console.error("Error setting student name:", error);
        socket.emit("error", { message: error.message });
      }
    });

    socket.on("teacher-joined", () => {
      (socket as any).isTeacher = true;
      socket.emit("students-updated", Array.from(connectedStudents.values()));
    });

    socket.on("kick-student", async (data: { socketId: string }) => {
      const studentSocket = io.sockets.sockets.get(data.socketId);
      if (studentSocket) {
        studentSocket.emit("kicked-out");
        studentSocket.disconnect(true);
      }

      connectedStudents.delete(data.socketId);
      io.emit("students-updated", Array.from(connectedStudents.values()));

      try {
        await Student.deleteOne({ socketId: data.socketId });
      } catch (error) {
        console.error("Error removing student:", error);
      }
    });

    socket.on("send-chat-message", (data: { message: string }) => {
      const isTeacher = (socket as any).isTeacher || false;
      const senderName = isTeacher
        ? "Teacher"
        : (socket as any).studentName || "Anonymous";

      const chatMessage: ChatMessage = {
        id: Date.now().toString() + Math.random(),
        sender: senderName,
        message: data.message,
        timestamp: new Date(),
        isTeacher,
      };

      chatMessages.push(chatMessage);
      if (chatMessages.length > 100) {
        chatMessages.shift();
      }

      io.emit("chat-message", chatMessage);
    });

    socket.on("get-chat-history", () => {
      socket.emit("chat-history", chatMessages);
    });

    socket.on("get-students-list", () => {
      socket.emit("students-updated", Array.from(connectedStudents.values()));
    });

    socket.on("request-current-state", async () => {
      try {
        const studentName = (socket as any).studentName;
        if (!studentName) {
          socket.emit("no-active-poll");
          return;
        }

        const { poll, hasVoted, votedOption } =
          await PollSocketController.handleStudentConnect(studentName);

        if (poll) {
          socket.emit("new-question", poll);
          if (hasVoted) {
            socket.emit("already-voted", { option: votedOption });
          }
        } else {
          socket.emit("no-active-poll");
        }
      } catch (error: any) {
        console.error("Error getting current state:", error);
        socket.emit("error", { message: error.message });
      }
    });

    socket.on("disconnect", async () => {
      console.log("User disconnected:", socket.id);

      connectedStudents.delete(socket.id);
      io.emit("students-updated", Array.from(connectedStudents.values()));

      try {
        await Student.deleteOne({ socketId: socket.id });
      } catch (error) {
        console.error("Error removing student:", error);
      }
    });
  });
}
