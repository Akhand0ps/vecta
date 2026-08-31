
import express  from "express"

import {prisma} from "db/client"
import orgRouter from "./routes/org.route";
import boardRouter from "./routes/board.route";

const app = express()
app.use(express.json())

app.use("/org",orgRouter);
app.use("/board",boardRouter)

app.get("/health",(req,res)=>{

    res.status(200).json({
        message:"OK"
    })
})

app.post("/signup",async(req,res)=>{

    const {username,password} = req.body;
    
    await prisma.user.create({
        data:{
            username,
            password
        }
    })

    return res.status(201).json({
        message:"user created successfully"
    })
    
})

 

app.listen(3000,()=>{

    console.log(`Server is running on port 3000`)
})