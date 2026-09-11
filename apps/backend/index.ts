
import express  from "express"

import {prisma} from "db/client"
import orgRouter from "./routes/org.route";
import boardRouter from "./routes/board.route";
import sectionRouter from "./routes/section.route";
import issueRouter from "./routes/issue.route";
import commentRouter from "./routes/comment.route";
import memberRouter from "./routes/member.route";
import userRouter from "./routes/user.route";


import { authMiddleware } from "./middleware/auth.middleware";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middleware/errorHandler";

const app = express()
app.use(express.json())
app.use(cookieParser())



// //apply auth middleware to all routes after this line

app.use("/org",authMiddleware,orgRouter);
app.use("/board",authMiddleware,boardRouter);
app.use("/section",authMiddleware,sectionRouter);
app.use("/issue",authMiddleware,issueRouter);
app.use("/comment",authMiddleware,commentRouter);
app.use("/invite",authMiddleware,memberRouter);
app.use("/auth",userRouter);


app.get("/health",(req,res)=>{

    res.status(200).json({
        message:"OK"
    })
})


 
app.use(errorHandler);
app.listen(3000,()=>{

    console.log(`Server is running on port 3000`)
})