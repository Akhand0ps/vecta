
import {prisma} from "db/client";
import { Request,Response } from "express";


interface UserRouteParams{
    userId?:string;
    orgId?:string;
}

export const createOrgController = async(req:Request<UserRouteParams>,res:Response)=>{
    
    try{


        const {name,description} = req.body;
        const userId = req.headers["userId"] as string;

        const org = await prisma.org.create({
            data:{
                name,
                description,
                userId
            }
        })

        return res.status(201).json({
            message:"org created successfully",
            org
        })

    }catch(err){
        return res.status(500).json({message:"INTERNAL SERVER ERROR"});
    }

}



export const getOrgController = async(req:Request<UserRouteParams>,res:Response)=>{
    

    const{orgId} = req.params;
    const org = await prisma.org.findUnique({
        where:{id:orgId}
    })

    return res.status(200).json({
        message:"org fetched successfully",
        org
    })
}


export const getOrgsController = async(req:Request<UserRouteParams>,res:Response)=>{


}