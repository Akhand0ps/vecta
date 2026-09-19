import {describe, it, expect, beforeAll, afterAll} from "bun:test";

import app from "../app";


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
}) 