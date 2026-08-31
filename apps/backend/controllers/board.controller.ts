
import {prisma} from "db/client";
import { Request,Response } from "express";


interface createBoardInterface{
    orgId:string;
    title:string;
}


export const createBoardController = async(req:Request<createBoardInterface>,res:Response)=>{


    try{

        const{title} = req.body;
        const{orgId} = req.params;

        //check org if exist

        const orgExists = await prisma.org.findUnique({
            where:{id:orgId}
        })

        if(!orgExists){
            return res.status(404).json({message:"Org not found"});
        }

        const board = await prisma.board.create({
            data:{
                title,
                orgId,    
            }
        })

        return res.status(200).json({
            message:"Board created successfully",
            board
        })
    }catch(err:any){

        res.status(500).json({err:err.message});
    }
}



interface getBoardInterface{
    boardId:string;
    orgId:string;
}


export const getBoardController = async(req:Request<getBoardInterface>,res:Response)=>{

    
    try{

        const {boardId,orgId} = req.params;

        const orgExists = await prisma.org.findUnique({
            where:{id:orgId}
        })

        if(!orgExists){
            return res.status(404).json({message:"Org not found"});
        }

        const boardExists = await prisma.board.findUnique({
            where:{id:boardId}
        })

        if(!boardExists){
            return res.status(404).json({message:"Board not found"});
        }
        

        const board = await prisma.board.findUnique({
            where:{id:boardId,orgId:orgId}
        })

        return res.status(200).json({
            message:"Board fetched successfully",
            board
        })
 
    }catch(err:any){

        res.status(500).json({err:err.message});
    }
}


export const getAllBoardController = async(req:Request<getBoardInterface>,res:Response)=>{

    try{

        const {orgId} = req.params;

        const orgExists = await prisma.org.findUnique({
            where:{id:orgId}
        })

        if(!orgExists){
            return res.status(404).json({message:"Org not found"});
        }


        const boards = await prisma.board.findMany({
            where:{orgId:orgId}
        })

        return res.status(200).json({
            message:"Boards fetched successfully",
            boards
        })
    }catch(err:any){
        res.status(500).json({err:err.message})
    }
}

interface deleteInterface{
    boardId:string;
    orgId:string;
}
export const deleteBoardController = async(req:Request<deleteInterface>,res:Response)=>{
    try{

        const {boardId,orgId} = req.params;


        const orgExists = await prisma.org.findUnique({
            where:{id:orgId}
        })

        if(!orgExists){
            return res.status(404).json({message:"Org not found"});
        }

        const boardExists = await prisma.board.findUnique({
            where:{id:boardId}
        })

        if(!boardExists){
            return res.status(404).json({message:"Board not found"});
        }
        

        const deleteboard = await prisma.board.delete({
            where:{id:boardId,orgId:orgId}
        })

        return res.status(200).json({
            message:"Board deleted successfully",
            deleteboard
        })
    }catch(err:any){
        
        res.status(500).json({err:err.message});
    }
}

