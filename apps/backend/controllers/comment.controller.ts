import {prisma} from "db/client";


import type { Request,Response } from "express";


interface createcommentInterface{

    content:string;
    issueId:string;
}

export const createCommentController = async(req:Request<createcommentInterface>,res:Response)=>{

    try{

        const {issueId} = req.params;
        const {content} = req.body;

        const issue = await prisma.issue.findUnique({
            where:{id:issueId}
        })

        if(!issue){
            return res.status(404).json({
                message:"Issue does not exits. you cannott comment!"
            })
        }

        const comment = await prisma.comment.create({
            data:{
                content:content,
                issueId:issueId
            }
        })

        return res.status(201).json({
            message:"Comment created successfully",
            comment
        })
    }catch(err:any){
        return res.status(500).json({
            err:err.message
        })
    }
}


interface commentRequestInterface{
    issueId?:string;
    commentId:string
}
export const getCommentController = async(req:Request<commentRequestInterface>,res:Response)=>{
    try{
        const {issueId,commentId} = req.params;
        
        const issue = await prisma.issue.findUnique({
            where:{id:issueId}
        })

        if(!issue){
            return res.status(404).json({
                message:"Issue does not exits!"
            })
        }
        const comment = await prisma.comment.findUnique({
            where:{id:commentId,issueId:issueId}
        })

        if(!comment){
            return res.status(404).json({
                message:"Comment does not exits!",
            })
        }

        
        return res.status(200).json({
            message:"Comment fetched successfully",
            comment
        })

    }catch(err:any){
        return res.status(500).json({
            message:err.message
        })
    }
}

export const getAllCommentsController = async(req:Request<commentRequestInterface>,res:Response)=>{
    try{

        const {issueId} = req.params;

        const comments = await prisma.comment.findMany({
            where:{
                issueId:issueId
            }
        })

        if(!comments){
            return res.status(404).json({
                message:"no comments found!"
            })
        }

        return res.status(200).json({
            message:"Comments fetched successfully",
            comments
        })

    }catch(err:any){

        return res.status(500).json({
            err:err.message
        })
    }
}



interface deleteCommentInterface{
    issueId:string,
    commentIds:string[]
}
export const deleteCommentController = async(req:Request<deleteCommentInterface>,res:Response)=>{
    
    try{

        const {issueId,commentIds} = req.params;
        
        const issue = await prisma.issue.findUnique({
            where:{id:issueId}
        })
        if(!issue){
            return res.status(404).json({
                message:"Issue does not exits! you can't delete comments",
            })
        }
        
        commentIds.forEach(async(commentId)=>{
            const comment = await prisma.comment.delete({
                where:{id:commentId}
            })
        })
 
        return res.status(200).json({
            message:"Comments deleted successfully",
        })
    }catch(err:any){

        return res.status(500).json({
            err:err.message
        })
    }
}

interface editCommentInterface{
    issueId:string,
    commentId:string,
    content:string
}

export const editCommentController = async(req:Request<editCommentInterface>,res:Response)=>{

    try{

        const {issueId,commentId} = req.params;
        const {content} = req.body;

        const comment = await prisma.comment.update({
            where:{id:commentId,issueId:issueId},
            data:{
                content:content
            }
        })

        if(!comment){
            return res.status(404).json({
                message:"no comment found!"
            })
        }

        return res.status(200).json({
            message:"Comment updated successfully",
            comment
        })
    }catch(err:any){

        return res.status(500).json({
            err:err.message
        })
    }
}
