import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Keeps the stock of products cloned from Electro Darna up to date.
crons.interval("sync Electro Darna stock", { minutes: 15 }, internal.electrodarna.syncStock, {});

export default crons;
