import { Worker } from "bullmq";
import redis from "@repo/redis/client";
import { sendOtpEmail } from "mailer";

import type { EmailJobMap } from "@repo/queue";


type EmailJob = EmailJobMap[keyof EmailJobMap];



//email is the queue name
//it keep listieing the email queue for any new job
const worker = new Worker<EmailJob>(
    "email",
    async(job)=>{
        
        switch(job.name){
            case 'login-otp':
                // console.log("trying............................");
                console.log(`[Job ID: ${job.id}] Attempt #${job.attemptsMade + 1} trying...`);
                try{
                    const {to,otp} = job.data;
                    const result = await sendOtpEmail({to:to,otp:otp})

                    if(!result.success){
                        throw new Error("Failed to send OTP email");
                    }
                    console.log("OTP email sent successfully!");
                }catch(error){
                    console.log("OTP email sent failed!",error)
                }
                break;
            default:
                throw new Error(`Unknown job: ${job.name}`);
        }
    },
    {
        connection:redis
    }
);



console.log("Email worker started.....")