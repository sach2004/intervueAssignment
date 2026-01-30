import { Server, Socket } from "socket.io";
import * as pollService from "../services/pollService.js";

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
        const { question, options, timer } = data;

        const poll = await pollService.createPoll(question, options, timer);

        const pollData = {
          _id: poll._id.toString(),
          question: poll.question,
          options: poll.options,
          timer: poll.timer,
          remainingTime: poll.getRemainingTime(),
          status: poll.status,
          results: Object.fromEntries(poll.results),
        };

        io.emit("new-question", pollData);

        setTimeout(async () => {
          try {
            await pollService.completePoll(poll._id.toString());
            const results = await pollService.calculateResults(
              poll._id.toString(),
            );

            io.emit("polling-results", results);
            io.emit("poll-completed", { pollId: poll._id.toString() });
          } catch (error) {
            console.error("Error completing poll:", error);
          }
        }, timer * 1000);
      } catch (error: any) {
        console.error("Error asking question:", error);
        socket.emit("error", { message: error.message });
      }
    });

    socket.on("handle-polling", async (data: any) => {
      try {
        const { option } = data;

        const poll = await pollService.getActivePoll();

        if (!poll) {
          socket.emit("error", { message: "No active poll" });
          return;
        }

        const student = (socket as any).studentName;

        if (!student) {
          socket.emit("error", { message: "Please set your name first" });
          return;
        }

        await pollService.submitVote(
          poll._id.toString(),
          socket.id,
          student,
          option,
        );

        const currentResults = await pollService.calculateLiveResults(
          poll._id.toString(),
        );
        io.emit("live-results-update", currentResults);

        socket.emit("vote-success", {
          message: "Vote submitted successfully",
          option,
        });

        console.log(`${student} voted for: ${option}`);
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

        const Student = (await import("../models/index.js")).Student;

        await Student.findOneAndUpdate(
          { socketId: socket.id },
          { socketId: socket.id, name, voted: false },
          { upsert: true, new: true },
        );

        console.log(`📝 Student ${name} connected (${socket.id})`);

        const poll = await pollService.getActivePoll();

        if (poll) {
          socket.emit("new-question", {
            _id: poll._id.toString(),
            question: poll.question,
            options: poll.options,
            timer: poll.timer,
            remainingTime: poll.getRemainingTime(),
            status: poll.status,
            results: Object.fromEntries(poll.results),
          });

          const Vote = (await import("../models/index.js")).Vote;
          const existingVote = await Vote.findOne({
            pollId: poll._id.toString(),
            studentSocketId: socket.id,
          });

          if (existingVote) {
            socket.emit("already-voted", {
              option: existingVote.selectedOption,
            });
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
        const Student = (await import("../models/index.js")).Student;
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
        const poll = await pollService.getActivePoll();

        if (poll) {
          socket.emit("new-question", {
            _id: poll._id.toString(),
            question: poll.question,
            options: poll.options,
            timer: poll.timer,
            remainingTime: poll.getRemainingTime(),
            status: poll.status,
            results: Object.fromEntries(poll.results),
          });
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
        const Student = (await import("../models/index.js")).Student;
        await Student.deleteOne({ socketId: socket.id });
      } catch (error) {
        console.error("Error removing student:", error);
      }
    });
  });
}
