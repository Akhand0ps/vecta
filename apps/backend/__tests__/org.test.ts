import {describe,it,expect,beforeAll,afterAll,mock,afterEach} from "bun:test";

import app from "../app";

import {createTestUserAndSession} from "./helpers/auth.helper";


let server:any;
const PORT = 9998;




describe("org tests",()=>{
    beforeAll(()=>{ 
        server = app.listen(PORT);
    })

    afterAll(()=>{
        server.close();
    })


    it("POST  /api/v1/org/ should return 400 if there is no name and description",async()=>{


        const {user,cookie} = await createTestUserAndSession();

        const res = await fetch('http:localhost:9998/api/v1/org/',{
            method:"POST",
            headers:{
                "Content-Type":"application/json",
                "Cookie":cookie
                
            },
            body: JSON.stringify({})
        })

        const responsebody:any = await res.json();
        
        expect(res.status).toBe(400);
        expect(responsebody.message).toBe("name and description are required");
        
    })
})