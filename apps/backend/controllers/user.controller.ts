import {prisma,redis} from "db/client";
import type { Request,Response } from "express";
import { hashpassword,comparePassword} from "../utils/hash";
import { sendWelcomeEmail,sendOtpEmail } from "mailer";
import { generateOtp, isValidOtp } from "../utils/otp";


export const createUser = async(req:Request,res:Response)=>{

    try{

        console.log("==================");

        const {username,password} = req.body;

        if(!username || !password){
            return res.status(400).json({message:"Please provide all the required fields"});
        }

        console.log(username,password);

        const user = await prisma.user.findUnique({
            where:{username:username}
        })

        if(user)return res.status(409).json({message:"user already exist"})

        const hashedpassword = await hashpassword(password);
        const createUser = await prisma.user.create({
            data:{
                username:username,
                password:hashedpassword
            },
            select:{
                username:true
            }
        })

        const email = await sendWelcomeEmail({to:username});
        // console.log(email);

        // if(!email.success){
        //     return res.status(500).json({message:"Failed to send welcome email"});
        // }

        return res.status(201).json({
            message:"User successfully created!",
            user:createUser
        })

    }catch(err:any){

        const statusCode = err.status ? err.status : 500;
        return res.status(statusCode).json({err: err.message || "Internal Server Error"});
    }
}


export const login = async(req:Request,res:Response)=>{


    try{

        const{username} = req.body;

        if(!username)return res.status(400).json({message:"Please provide all the required fields"})

        const user = await prisma.user.findUnique({
            where:{username:username},
            select:{
                id:true,
                username:true
            }
        })

        if(!user)return res.status(404).json({message:"User does not exist"})

        const {otp,hashedOtp} = await generateOtp();

        await redis.set(`otp:${user.id}`,hashedOtp,{EX:60*2});

        await redis.set(`otp:${user.id}:attempts`,"0",{EX:60*2});

        
        const emailResponse = await sendOtpEmail({to:username,otp:otp});
        
        if(!emailResponse.success){
            return res.status(500).json({message:"Failed to send otp email"});
        }

        return res.status(200).json({
            message:"Otp sent successfully!",
            user:user
        })
    }catch(err:any){
        return res.status(500).json({
            message:err.message
        })
    }
}

interface verifyInterface{

    username:string;
    otp:string;
    rememberMe?:Boolean
}

export const verify = async(req:Request,res:Response)=>{

    try{


        const {username,otp,rememberMe} = req.body as verifyInterface;

        const user = await prisma.user.findUnique({
            where:{username:username},
            select:{
                id:true,
                username:true
            }
        })

        if(!user)return res.status(404).json({message:"User does not exist"})

        const storedOtp = await redis.get(`otp:${user.id}`);
        
        if(!storedOtp)return res.status(401).json({message:"Otp has been expired"})

        const isvalidOtp = await isValidOtp(otp,storedOtp);

        if(!isvalidOtp)return res.status(401).json({message:"Invalid otp"})

        const attempts = await redis.get(`otp:${user.id}:attempts`);

        // if(attempts>=3)return res.status(401).json({message:"Max attempts reached"})
        //we yaha pe maximum 3 chances de.


        

        await redis.del(`otp:${user.id}`);
        await redis.del(`otp:${user.id}:attempts`);

        return res.status(200).json({
            message:"you're logged in",
            user
        })

        
    }catch(err:any){

        const statusCode  = err.status ? err.status : 500;
        return res.status(statusCode).json({
            message:err.message
        })
    }

}