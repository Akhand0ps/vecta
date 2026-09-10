
import crypto from "crypto";
import {prisma} from "db/client";



interface requiredPara{

    orgId:string;
    username:string;
    inviteById:string;
}


export const token = crypto.randomBytes(32).toString('hex')


export const tokenHash = crypto.createHash('sha256').update(token).digest('hex')

export const generateUrl = async(requestData:requiredPara)=>{ 

    
    const baseUrl = process.env.BASE_URL || "http://localhost:3000"

    const url = `${baseUrl}/invite/${token}`

    const expiresAt:Date = new Date(Date.now() + 24 * 60 * 60 * 1000)



    const invitationData = await prisma.invitation.create({

        data:{
            username:requestData.username,
            tokenHash:tokenHash,
            expiresAt:expiresAt,
            orgId:requestData.orgId,
            inviteById:requestData.inviteById,
        }
    })

    const invitation = {
        ...invitationData,
        url:url
    }


    return invitation;
}


