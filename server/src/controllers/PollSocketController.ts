import * as pollService from "../services/pollService.js";

export class PollSocketController {
  static async handleAskQuestion(data: any) {
    const { question, options, timer } = data;
    const poll = await pollService.createPoll(question, options, timer);

    return {
      _id: poll._id.toString(),
      question: poll.question,
      options: poll.options,
      timer: poll.timer,
      remainingTime: poll.getRemainingTime(),
      status: poll.status,
      results: Object.fromEntries(poll.results),
    };
  }

  static async handleSubmitVote(studentName: string, option: string) {
    const poll = await pollService.getActivePoll();

    if (!poll) {
      throw new Error("No active poll");
    }

    if (!studentName) {
      throw new Error("Please set your name first");
    }

    await pollService.submitVote(poll._id.toString(), studentName, option);

    const currentResults = await pollService.calculateLiveResults(
      poll._id.toString(),
    );

    return { currentResults, option, pollId: poll._id.toString() };
  }

  static async handleStudentConnect(name: string) {
    const poll = await pollService.getActivePoll();

    if (!poll) {
      return { poll: null, hasVoted: false };
    }

    const existingVote = await pollService.checkIfVoted(
      poll._id.toString(),
      name,
    );

    return {
      poll: {
        _id: poll._id.toString(),
        question: poll.question,
        options: poll.options,
        timer: poll.timer,
        remainingTime: poll.getRemainingTime(),
        status: poll.status,
        results: Object.fromEntries(poll.results),
      },
      hasVoted: !!existingVote,
      votedOption: existingVote?.selectedOption,
    };
  }

  static async completePollTimer(pollId: string) {
    await pollService.completePoll(pollId);
    const results = await pollService.calculateResults(pollId);
    return results;
  }
}
