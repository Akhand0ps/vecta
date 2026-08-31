
import {prisma} from "db/client";
import { Request,Response } from "express";


interface UserRouteParams{
    userId?:string;
    orgId?:string;
}

export const createOrgController = async(req:Request<UserRouteParams>,res:Response)=>{
    
    try{


        const {name,description} = req.body;
        console.log("=================");
        console.log(name);
        console.log(description);
        console.log("=================");
        const org = await prisma.org.create({
            data:{
                name,
                description,
            }
        })
        return res.status(201).json({
            message:"org created successfully",
            org
        })
    }catch(err:any){
        return res.status(500).json({message:err.message});
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

    const orgs = await prisma.org.findMany();


    return res.status(200).json({
        message:"orgs fetched successfully",
        orgs
    })

}


export const deleteOrgController = async(req:Request<UserRouteParams>,res:Response)=>{
    try{


        const {orgId } = req.params;


        const deletedOrg = await prisma.org.delete({

            where:{id:orgId},
            select:{
                id:true,
                name:true
            }
        })

        return res.status(200).json({
            message:"org deleted successfully",
            deletedOrg
        })
    }catch(err:any){

        return res.status(500).json({message:err.message});
    }
}