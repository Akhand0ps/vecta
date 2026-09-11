
import {prisma} from "db/client";
import type { Request,Response } from "express";
import {sendInviteEmail,sendWelcomeOrgEmail} from "mailer";
import {generateUrl} from "../utils/url"
import crypto from "crypto";


interface addMemberInterface{
    userId:string;
    orgId:string
    role:string;
}


export const AddMemberController = async(req:Request<addMemberInterface>,res:Response)=>{

    console.log("addmember")
    try{

        const{userId,orgId,role} = req.body;
        if(!userId || !orgId || !role){
            return res.status(400).json({
                message:"Please provide all the required fields"
            })
        }

        // console.log("======================================")
        // console.log(userId)
        // console.log(orgId)
        // console.log(role)
        // console.log("======================================")
        const org = await prisma.org.findUnique({
            where:{id:orgId}
        })
        if(!org)return res.status(404).json({message:"Organization does not exist."})

        

        const user = await prisma.user.findUnique({
            where:{id:userId}
        })
        if(!user)return res.status(404).json({message:"User does not exist. you cannot add, kindly ask user to signup."})

        /*
            
        */

        //first check if the current user is "admin of the org"
        const currentUser = req.userId;
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
        


        ///background jobs to send the email to the user,

        const invitation = await generateUrl({
            orgId:orgId,
            username:user.username,
            inviteById:currentUser!,
            userId:userId,
        })


        console.log("==================email=====================");

        console.log(user.username)

        console.log("==================email=====================");


        const email = await sendInviteEmail({
            to:user.username,
            orgName:org.name,
            inviteLink:invitation.url
        })


        // console.log("============================================")
        // console.log(email);
        // console.log("============================================")

        if(!email.success){
            return res.status(400).json({
                message:"Failed to send invitation email"
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



interface InvitationInterface{
    token:string;
}
export const verifyInvitation = async(req:Request<InvitationInterface>,res:Response)=>{
    try{
        const{token} = req.params;


        if(!token)return res.status(400).json({message:"Token is required"});
        const tokenHash:string = crypto.createHash("sha256").update(token).digest("hex");
        

        const invitation  = await prisma.invitation.findUnique({
            where:{tokenHash:tokenHash},
            include:{
                org:{
                    select:{
                        name:true
                    }
                },
                
            }
        })



        if(!invitation)return res.status(404).json({message:"Invalid invitation."})
        
        if(invitation.expiresAt < new Date()) return res.status(400).json({message:"Invatation is expired"});

        if(invitation.acceptedAt)return res.status(200).json({message:"You are already a member of this organization!"});

        if(invitation.revoked) return res.status(400).json({message:"your invitation is revoked"});

        await prisma.invitation.update({
            where:{tokenHash:tokenHash},
            data:{acceptedAt:new Date()}
        })

        await prisma.membership.update({
            where:{
                userId_orgId:{
                    userId:invitation.userId,
                    orgId:invitation.orgId,
                }

            },
            data:{accepted:true}
        })

        res.status(200).json({message:"Invitation accepted successfully"});
        //send welcome org email


        const welcomeOrgMail = await sendWelcomeOrgEmail({
            to:invitation.username,
            orgName:invitation.org.name
            })

        if(!welcomeOrgMail.success){
            console.log("Failed to send welcome org email",welcomeOrgMail.err)
        }
        return; // we will return after sending the email in production for now we are returning here
    }catch(err:any){
        return res.status(500).json({
            message:err.message
        })
    }
}






//make route to revoked the invation before/after the invitation sent.

export const revokeInvitation = async(req:Request,res:Response)=>{

    try{

        const {orgId,userId} = req.body;

        if(!orgId || !userId)return res.status(400).json({message:"Please provide all the required fields"});

        const invitation = await prisma.invitation.findFirst({
            where:{userId:userId,orgId:orgId}
        })
        if(!invitation)return res.status(404).json({message:"Invitation not found"})

        await prisma.invitation.update({
            where:{id:invitation.id},
            data:{revoked:true}
        })

        return res.status(200).json({message:"Invitation revoked successfully"});
    }catch(err:any){
        return res.status(500).json({
            message:err.message
        })
    }
}


