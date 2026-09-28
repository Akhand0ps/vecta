import {Queue} from "bullmq";
import redis from "@repo/redis/client";

import type { EmailJobMap } from "./jobs/email.jobs";

const queue = new Queue("email",{connection:redis});




export const emailQueue = {
    
    add<K extends keyof EmailJobMap>(
        name:K,data:EmailJobMap[K]
    ){
        return queue.add(name,data,{
            attempts:3,
            backoff:{
                type:"exponential",
                delay:10000
            }
        });
    }
}

