import {describe,it,expect,beforeAll,afterAll} from "bun:test";

import app from "../app";

import {redis} from "db/client";


let server:any;
const PORT = 9998;

beforeAll(()=>{
    server = app.listen(PORT);
})

afterAll(()=>{

    server.close();
});



describe("Auth Check",()=>{


    it("POST /auth/login should return 400 if username is missing",async()=>{
        
        const res = await fetch(`http://localhost:${PORT}/auth/login`,{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body: JSON.stringify({})
        })
        

        const body:any = await res.json();

        expect(res.status).toBe(400);
        expect(body.message).toBe("Please provide all the required fields");

    }),
    it("POST /auth/login should return 429 on 4th attempt",async()=>{
        
        //clear any previous key so this test starts fresh - smjha main

        const keys = await redis.keys("rl:login:*");
        if(keys.length>0) await redis.del(keys);


        //3 bad attempts


        for(let i=0;i<3;i++){

            const res = await fetch(`http://localhost:${PORT}/auth/login`,{
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body:JSON.stringify({})
            });

            expect(res.status).toBe(400);
        }
        
        const blockedRes = await fetch(`http://localhost:9998/auth/login`,{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({})
        });

        const resbody:any = await blockedRes.json();

        expect(blockedRes.status).toBe(429);
        expect(resbody.message).toBe("Too many requests. Please try again later");

    })
})