
import {prisma} from "db/client";
import type { Request,Response } from "express";
import {sendInviteEmail} from "mailer";
import {generateUrl} from "../utils/url"

interface addMemberInterface{
    userId:string;
    orgId:string
    role:string;
}


export const AddMemberController = async(req:Request<addMemberInterface>,res:Response)=>{

    try{

        const{userId,orgId,role} = req.body;
        if(!userId || !orgId || !role){
            return res.status(400).json({
                message:"Please provide all the required fields"
            })
        }
        const org = await prisma.org.findUnique({
            where:{id:orgId}
        })
        if(!org)return res.status(404).json({message:"Organization does not exist."})

        

        const user = await prisma.user.findUnique({
            where:{id:userId}
        })
        if(!user)return res.status(404).json({message:"User does not exist. you cannot add, kindly ask user to signup."})



        //first check if the current user is "admin of the org"
        const currentUser :string | undefined = "1";
        const membership = await prisma.membership.findFirst({
            where:{userId:currentUser,orgId:orgId,role:"ADMIN",accepted:true}
        })

        if(!membership){
            return res.status(403).json({
                message:"You are not authorized to add members to this organization."
            })
        }

        //check if the user is already a member of the org.
        const existingMembership = await prisma.membership.findFirst({
            where:{userId:userId,orgId:orgId}
        })

        if(existingMembership){
            
            if(!existingMembership.accepted){
                return res.status(400).json({
                    message:"Invitation is already sent to the user. Waiting for user to accept"
                })
            }

            return res.status(400).json({
                message:"User is already a member. You can change their role instead."
            })

            
        }
        
        const addMember = await prisma.membership.create({
            data:{
                userId:userId,
                orgId:orgId,
                role:role,
                accepted:false
            }
        })


        ///background jobs to send the email to the user,

        const invitation = await generateUrl({
            orgId:orgId,
            username:user.username,
            inviteById:currentUser
        })


        const email = await sendInviteEmail({
            to:user.username,
            orgName:org.name,
            inviteLink:invitation.url
        })

        if(email.err){
            return res.status(400).json({
                message:"Failed to send invitation email"
            })
        }
        

        return res.status(200).json({
            message:"Invitation sent to the user.",
            addMember:addMember
        })

    }catch(err:any){
        return res.status(500).json({
            err:err.message
        })
    }
}