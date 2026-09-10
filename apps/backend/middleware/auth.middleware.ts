import {prisma} from "db/client";
import type {Request,Response,NextFunction} from "express";
import crypto from "crypto";


export const authMiddleware = async(req:Request,res:Response,next:NextFunction)=>{

    try{
        const token = req.cookies["session"];

        // console.log("=============================================");
        // console.log(req.cookies);
        // console.log("=============================================");
        if(!token)return res.status(401).json({message:"Unauthorised"});

        const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

        const session = await prisma.session.findUnique({
            where:{
                tokenHash:tokenHash
            },
            include:{
                user:{
                    select:{
                        id:true
                    }
                }
            }
        })
        if(!session) return res.status(401).json({
            message:"session not found please login"
        })

        if(session.expiresAt < new Date()){
            await prisma.session.delete({
                where:{
                    tokenHash:tokenHash
                }
            })
            return res.status(401).json({
                message:"session expired please login"
            })
        }

        (req as any).userId = session.user.id;
        (req as any).sessionId = session.id;
        next()
    }catch(err:any){

        const statusCode = err.status? err.status : 500;
        return res.status(statusCode).json({
            message:err.message || "internal server error"
        })
    }
}

