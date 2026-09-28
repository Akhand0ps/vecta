import { Queue } from "bullmq";
import  redis  from "@repo/redis/client";

const emailQueue = new Queue("email", {
    connection: redis,
});


//job creation.
await emailQueue.add("login-otp", {
    to: "test@example.com",
    otp: "123456",
});


console.log("Job added");
await redis.quit();