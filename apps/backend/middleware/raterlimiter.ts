import {redis} from "db/client";
import type { Request,Response,NextFunction } from "express";
import { asyncHandler } from "../utils/asyncHandler";


interface RateLimiterOptions{

    windowSeconds: number;  //60 or 120seconds
    maxAttempts: number; // 3 or 5
    keyPrefix: string;   // "rl:login" or "rl:health"
}

export const rateLimiter = (options:RateLimiterOptions)=>{


    return asyncHandler(async(req:Request,res:Response,next:NextFunction)=>{

        const ip = req.ip || req.socket.remoteAddress || "127.0.0.1:3001";
        const key = `${options.keyPrefix}:${ip}`;

        const now = Date.now();

        const clearBefore = now - (options.windowSeconds*1000);

        //atomic transaction pipeline

        const multi = redis.multi();

        //delete all knocs older than clearbefore
        multi.zRemRangeByScore(key,0,clearBefore);

        //count how many valid knows are left;
        multi.zCard(key);

        //add currnet request timestamp as a new knowc
        multi.zAdd(key,[{score:now,value:`${now}:${Math.random()}`}]);


        //set TTL so redis cleans up this IP after silence

        multi.expire(key,options.windowSeconds);

        const results = await multi.exec();

        // number of requests this IP has made inthe window
        const currentAttempts = (results?.[1] || 0) as number;
 
        //standard rate limit headers

        res.setHeader("X-RateLimit-Limit",options.maxAttempts);
        res.setHeader('X-RateLimit-Remaining',Math.max(0,options.maxAttempts - (currentAttempts+1)));

        //the decision


        if(currentAttempts >= options.maxAttempts){

            res.setHeader("Retry-After",options.windowSeconds);

            return res.status(429).json({
                message:"Too many requests. Please try again later",
                retryAfter: `${options.windowSeconds}s`
            })
        }

        //allowed now
        next();
    })
}

