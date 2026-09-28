import {describe,it,expect,beforeAll,afterAll,mock,afterEach} from "bun:test";

import app from "../app";

import {prisma, redis} from "db/client";
import {createTestUserAndSession} from "./helpers/auth.helper";

let server:any;
const PORT = 9998;

beforeAll(()=>{
    server = app.listen(PORT);
})

afterAll(()=>{

    server.close();
});

mock.module("mailer",()=>({
    sendOtpEmail: ()=>Promise.resolve({success:true}),
    sendWelcomeEmail:()=>Promise.resolve({success:true})
}));

/*
mock.module("mailer", () => {
    return {
        // Fake sendOtpEmail jo turant success return karega
        sendOtpEmail: async () => {
            return { success: true };
        },

        // Fake sendWelcomeEmail jo turant success return karega
        sendWelcomeEmail: async () => {
            return { success: true };
        }
    };
});


*/

describe("Auth Check",()=>{

    //after each test , clean the DB

    afterEach(async()=>{
        await prisma.invitation.deleteMany();
        await prisma.session.deleteMany();
        await prisma.user.deleteMany();
    })

    //after all the tests , close the db connection
    afterAll(async()=>{
        await prisma.$disconnect();
    })





    it("POST /api/v1/auth/login should return 400 if username is missing",async()=>{
        
        const res = await fetch(`http://localhost:${PORT}/api/v1/auth/login`,{
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
    it("POST /api/v1/auth/login should return 429 on 4th attempt",async()=>{
        
        //clear any previous key so this test starts fresh - smjha main

        const keys = await redis.keys("rl:login:*");
        if(keys.length>0) await redis.del(keys);


        //3 bad attempts


        for(let i=0;i<3;i++){

            const res = await fetch(`http://localhost:${PORT}/api/v1/auth/login`,{
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body:JSON.stringify({})
            });

            expect(res.status).toBe(400);
        }
        
        const blockedRes = await fetch(`http://localhost:${PORT}/api/v1/auth/login`,{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({})
        });

        const resbody:any = await blockedRes.json();

        expect(blockedRes.status).toBe(429);
        expect(resbody.message).toBe("Too many requests. Please try again later");

    }),
    it("POST /api/v1/auth/login should return 200 if OTP is sent",async()=>{
        

        const keys = await redis.keys("rl:login:*")
        if(keys.length>0) await redis.del(keys);

        const {user} = await createTestUserAndSession();

        const res = await fetch(`http://localhost:${PORT}/api/v1/auth/login`,{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                username:user.username
            })
        });

        const body:any = await res.json();
        expect(res.status).toBe(200);
        expect(body.message).toBe("Otp sent successfully!");
    }),
    it("should save user to PostgreSQL DB on successful signup",async()=>{


        const username = `user${Date.now()}@test.com`
        const res = await fetch("http:localhost:9998/api/v1/auth/register",{
            method:"POST",
            headers:{
                "Content-Type":"application/json",
            },
            body: JSON.stringify({
                username:username,
                password:"test123"
            })
        })
        expect(res.status).toBe(201);

        //check pg if the user is created or not.
        const responseData:any = await res.json();
        const user = await prisma.user.findUnique({
            where:{username:username}
        })

        //yaha assert kr

        expect(user).not.toBeNull();
        expect(user?.username).toBe(username);

    })

})