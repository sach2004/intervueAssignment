import { Server, Socket } from "socket.io";
import * as pollService from "../services/pollService.js";

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

        const results = await pollService.calculateResults(poll._id.toString());

        io.emit("polling-results", results);

        socket.emit("vote-success", {
          message: "Vote submitted",
          option,
        });
      } catch (error: any) {
        console.error("Error handling vote:", error);
        socket.emit("error", { message: error.message });
      }
    });

    socket.on("student-set-name", async (data: any) => {
      try {
        const { name } = data;

        (socket as any).studentName = name;

        const Student = (await import("../models/index.js")).Student;

        await Student.findOneAndUpdate(
          { socketId: socket.id },
          { socketId: socket.id, name, voted: false },
          { upsert: true, new: true },
        );

        console.log(`📝 Student ${name} set (${socket.id})`);

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

      try {
        const Student = (await import("../models/index.js")).Student;
        await Student.deleteOne({ socketId: socket.id });
      } catch (error) {
        console.error("Error removing student:", error);
      }
    });
  });
}
