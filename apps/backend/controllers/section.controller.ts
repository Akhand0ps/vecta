import {prisma} from "db/client";
import { Request,Response } from "express";


interface createSectionInterface{
    title: string,
    boardId:string
}

export const createSectionController = async(req:Request<createSectionInterface>,res:Response)=>{
    try{

        const {boardId} = req.params;
        const{title} = req.body;


        const boardExists = await prisma.board.findUnique({
            where:{id:boardId}
        })

        if(!boardExists){
            res.status(404).json({message:"Board does not exist"});
            return;
        }

        const section = await prisma.section.create({
            data:{
                title:title,
                boardId:boardId
            }
        })


        return res.status(201).json({
            message:"section successfully created!!",
            section
        })
    }catch(err:any){

        res.status(500).json({err:err.message});
    }
}


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
            where:{id:sectionId}
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

export const getALlSectionController = async(req:Request<getSectionInterface>,res:Response)=>{

    try{
        const {boardId} = req.params;


        const boardExists = await prisma.board.findUnique({
            where:{id:boardId}
        })

        if(!boardExists){
            res.status(404).json({message:"Board does not exist"});
            return;
        }

        const sections = await prisma.section.findMany({
            where:{id:boardId}
        })

        if(!sections){
            return res.status(404).json({message:`there are no such sections for this board ${boardId}`})
        }

        return res.status(200).json({
            message:"Sections fetched successfully",
            sections
        })
    }catch(err:any){
        res.status(500).json({err:err.message});
    }
}

export const deleteSectionController = async(req:Request<getSectionInterface>,res:Response)=>{


    try{

        const {boardId,sectionId} = req.params;


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


        const deleteSection = await prisma.section.delete({
            where:{id:sectionId,boardId:boardId}
        })


        return res.status(200).json({
            message:"Section deleted successfully",
            deleteSection
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



