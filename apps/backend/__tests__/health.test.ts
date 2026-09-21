import {describe, it, expect, beforeAll, afterAll} from "bun:test";

import app from "../app";
import {redis} from "db/client";

let server:any;



beforeAll(()=>{
    server = app.listen(9999);
})


afterAll(()=>{

    server.close();
})
describe("Health Check",()=>{
    it("GET /health should return 200 and OK",async()=>{
        

        // bun's built in fetch handles an express app directly.
        const req = new Request("http://localhost:9999/health");
        
        const response = await fetch(req);
        const body:any = await response.json();

        expect(response.status).toBe(200); 
        expect(body.message).toBe("OK")
    })

    // it("should return 429 when rate limit is exceeded on 4th request",async()=>{

    //     //1: clean redis- because of above test

    //     await redis.del("rl:health:127.0.0.1:9999/health");
    //     for(let i =0;i<3;i++){

    //         const res = await fetch("http:127.0.0.1:9999/health");
    //         expect(res.status).toBe(200);
    //     }

    //     //for the 4th one , it shoudl be 429

    //     const blockedRes = await fetch("http:127.0.0.1:9999/health");

    //     const body:any = await blockedRes.json();

    //     expect(blockedRes.status).toBe(429);
    //     expect(body.message).toBe("Too many requests. Please try again later");

    // })
}) 