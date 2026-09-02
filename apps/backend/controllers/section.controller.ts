import {prisma} from "db/client";
import  type { Request,Response } from "express";



interface getSectionInterface{
    boardId:string;
    sectionId?:string;
    title?:string
}
export const getSectionController = async(req:Request<getSectionInterface>,res:Response)=>{
    try{
        const {boardId,sectionId} = req.params;
        const boardExists = await prisma.board.findUnique({
            where:{id:boardId}
        })

        if(!boardExists){
            res.status(404).json({message:"Board does not exist"});
            return;
        }
        const section = await prisma.section.findUnique({
            where:{id:sectionId},
            include:{
                issues:{
                    include:{
                        issueMappings:{
                            include:{
                                user:{
                                    select:{
                                        id:true,
                                        username:true
                                    }
                                }
                            }
                        },
                        comments:true   
                    }
                }
            }

        })

        if(!section){
            res.status(404).json({message:"Section does not exist. nice try!"});
            return;
        }

        return res.status(200).json({
            section
        })

    }catch(err:any){
        res.status(500).json({err:err.message});
    }
}




export const changeSectionController = async(req:Request<getSectionInterface>,res:Response)=>{


    try{
        const {boardId,sectionId,title} = req.params;


        const boardExists = await prisma.board.findUnique({
            where:{id:boardId}
        })

        if(!boardExists){
            res.status(404).json({message:"Board does not exist"});
            return;
        }

        const sectionExists = await prisma.section.findUnique({
            where:{id:sectionId}
        })

        if(!sectionExists){
            res.status(404).json({message:"Section does not exist. nice try!"});
            return;
        }


        const updateSection = await prisma.section.update({
            where:{id:sectionId,boardId:boardId},
            data:{title:title}
        })

        return res.status(200).json({
            message:"Section updated successfully",
            updateSection
        })


    }catch(err:any){
        res.status(500).json({err:err.message});
    }
}



