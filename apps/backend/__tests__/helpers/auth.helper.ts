
import {prisma } from "db/client";
import crypto from "crypto";



export const createTestUserAndSession = async()=>{


    const user = await prisma.user.create({
        data:{
            username:`user${Date.now()}@test.com`,
            password:"123456"
        }
    })
    const rawToken = crypto.randomBytes(32).toString('hex')
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')

    const session = await prisma.session.create({
        data:{
            userId: user.id,
            tokenHash:tokenHash,
            expiresAt: new Date(Date.now()+1000 * 60 * 60)
        }
    })
    return {user,cookie: `session=${rawToken}`};
}