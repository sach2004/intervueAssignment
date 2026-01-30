import { config } from "dotenv";
config();

import cors from "cors";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { connectDB } from "./db/mongo.js";
import * as pollService from "./services/pollService.js";
import { setupPollSocket } from "./socket/pollSocket.js";

const app = express();
const httpServer = createServer(app);

app.use(
  cors({
    origin: "*",
    credentials: true,
  }),
);
app.use(express.json());

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date() });
});

app.get("/api/poll/active", async (req, res) => {
  try {
    const poll = await pollService.getActivePoll();

    if (!poll) {
      return res.json({ poll: null });
    }

    res.json({
      poll: {
        _id: poll._id.toString(),
        question: poll.question,
        options: poll.options,
        timer: poll.timer,
        remainingTime: poll.getRemainingTime(),
        status: poll.status,
        results: Object.fromEntries(poll.results),
        createdAt: poll.createdAt,
        expiresAt: poll.expiresAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/poll/history", async (req, res) => {
  try {
    const history = await pollService.getPollHistory();

    const polls = history.map((poll) => ({
      _id: poll._id.toString(),
      question: poll.question,
      options: poll.options,
      results: Object.fromEntries(poll.results),
      createdAt: poll.createdAt,
      status: poll.status,
    }));

    res.json({ polls });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/vote/check/:pollId/:studentName", async (req, res) => {
  try {
    const { pollId, studentName } = req.params;
    const vote = await pollService.checkIfVoted(pollId, studentName);

    res.json({
      hasVoted: !!vote,
      vote: vote
        ? {
            selectedOption: vote.selectedOption,
            votedAt: vote.votedAt,
          }
        : null,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

async function startServer() {
  try {
    await connectDB();

    setupPollSocket(io);

    const PORT = process.env.PORT || 3001;

    httpServer.listen(PORT, () => {
      console.log(`\nServer running on http://localhost:${PORT}`);
      console.log(`Socket.io ready`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
