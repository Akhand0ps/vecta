
import express  from "express"

import {prisma} from "db/client"
import orgRouter from "./routes/org.route";
import boardRouter from "./routes/board.route";
import sectionRouter from "./routes/section.route";
import issueRouter from "./routes/issue.route";
import commentRouter from "./routes/comment.route";
import memberRouter from "./routes/member.route";


const app = express()
app.use(express.json())

app.use("/org",orgRouter);
app.use("/board",boardRouter);
app.use("/section",sectionRouter);
app.use("/issue",issueRouter);
app.use("/comment",commentRouter);
app.use("/invite",memberRouter);


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