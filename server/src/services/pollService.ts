import { Poll, Student, Vote } from "../models/index.js";

export async function createPoll(
  question: string,
  options: string[],
  timer: number,
) {
  try {
    await Poll.updateMany({ status: "active" }, { status: "completed" });

    const poll = new Poll({
      question,
      options,
      timer,
    });

    await poll.save();

    await Student.updateMany({}, { voted: false });

    return poll;
  } catch (error: any) {
    throw new Error(`Failed to create Poll: ${error.message}`);
  }
}

export async function getActivePoll() {
  try {
    const poll = await Poll.findOne({ status: "active" });

    if (!poll) {
      return null;
    }

    if (poll.hasExpired()) {
      poll.status = "completed";
      await poll.save();
      return null;
    }

    return poll;
  } catch (error: any) {
    throw new Error(`Failed to get active poll: ${error.message}`);
  }
}

export async function submitVote(
  pollId: string,
  studentName: string,
  selectedOption: string,
) {
  try {
    const poll = await Poll.findById(pollId);

    if (!poll) {
      throw new Error("Poll not found");
    }

    if (poll.status !== "active") {
      throw new Error("Poll not active");
    }

    if (poll.hasExpired()) {
      poll.status = "completed";
      await poll.save();
      throw new Error("Poll has expired");
    }

    try {
      const vote = new Vote({
        pollId,
        studentName,
        selectedOption,
      });

      await vote.save();

      await Student.updateOne({ name: studentName }, { voted: true });

      return vote;
    } catch (error: any) {
      if (error.code === 11000) {
        throw new Error("You have already voted");
      }
      throw error;
    }
  } catch (error) {
    throw error;
  }
}

export async function calculateLiveResults(pollId: string) {
  try {
    const poll = await Poll.findById(pollId);

    if (!poll) {
      throw new Error("Poll not found");
    }

    const votes = await Vote.find({ pollId });
    const totalVotes = votes.length;

    const voteCounts: any = {};
    poll.options.forEach((option: string) => {
      voteCounts[option] = 0;
    });

    votes.forEach((vote) => {
      if (voteCounts[vote.selectedOption] !== undefined) {
        voteCounts[vote.selectedOption]++;
      }
    });

    const results: any = {};
    poll.options.forEach((option: string) => {
      const count = voteCounts[option] || 0;
      const percentage = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
      results[option] = {
        count,
        percentage: Math.round(percentage * 10) / 10,
      };
    });

    return results;
  } catch (error: any) {
    throw new Error(`Failed to calculate live results: ${error.message}`);
  }
}

export async function calculateResults(pollId: string) {
  try {
    const poll = await Poll.findById(pollId);

    if (!poll) {
      throw new Error("Poll not found");
    }

    const votes = await Vote.find({ pollId });
    const totalVotes = votes.length;

    const voteCounts: any = {};
    poll.options.forEach((option: string) => {
      voteCounts[option] = 0;
    });

    votes.forEach((vote) => {
      if (voteCounts[vote.selectedOption] !== undefined) {
        voteCounts[vote.selectedOption]++;
      }
    });

    const results: any = {};
    poll.options.forEach((option: string) => {
      const count = voteCounts[option] || 0;
      const percentage = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
      results[option] = Math.round(percentage * 10) / 10;
      poll.results.set(option, results[option]);
    });

    await poll.save();

    return results;
  } catch (error: any) {
    throw new Error(`Failed to calculate results: ${error.message}`);
  }
}

export async function completePoll(pollId: string) {
  try {
    const poll = await Poll.findById(pollId);

    if (!poll) {
      throw new Error("No poll found");
    }

    await calculateResults(pollId);

    poll.status = "completed";
    await poll.save();

    return poll;
  } catch (error: any) {
    throw new Error(`Failed to complete poll: ${error.message}`);
  }
}

export async function getPollHistory() {
  try {
    const polls = await Poll.find({ status: "completed" })
      .sort({ createdAt: -1 })
      .limit(10);

    return polls;
  } catch (error: any) {
    throw new Error(`Failed to get poll history: ${error.message}`);
  }
}

export async function checkIfVoted(pollId: string, studentName: string) {
  try {
    const vote = await Vote.findOne({ pollId, studentName });
    return vote;
  } catch (error: any) {
    throw new Error(`Failed to check vote: ${error.message}`);
  }
}
