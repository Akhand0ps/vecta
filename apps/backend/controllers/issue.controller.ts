import {prisma} from "db/client"
import type { Request,Response } from "express"

interface createSection{

    title:string,
    description:string,
    boardId:string,
    sectionId:string
}


export const createIssueController = async(req:Request<createSection>,res:Response)=>{


    try{
        const {boardId} = req.params;

        const {title,description} = req.body;

        const board = await prisma.board.findUnique({
            where:{id:boardId}
        })

        if(!board){
            return res.status(404).json({
                message:"Board does not exist"
            })
        }

        // ← look up UPCOMING section automatically
        const upcomingSection = await prisma.section.findFirst({
            where: { boardId: boardId, title: "UPCOMING" }
        })
        if (!upcomingSection) {
            return res.status(404).json({ message: "Board has no UPCOMING section" })
        }

        const issue = await prisma.issue.create({
            data:{
                title:title,
                description:description,
                boardId:boardId,
                sectionId:upcomingSection.id
            }
        })

        return res.status(201).json({
            message:"issue created succesfully!!",
            issue
        })
    }catch(err:any){
        return res.status(500).json({
            err:err.message
        })
    }
}

interface getIssueInterface{
    boardId:string;
    sectionId:string;
    issueId?:string;
}
export const getIssueController = async(req:Request<getIssueInterface>,res:Response)=>{
    try{

        const{boardId,sectionId,issueId} = req.params;

        const board = await prisma.board.findUnique({
            where:{id:boardId}
        })

        if(!board){
            return res.status(404).json({
                message:"board does not exist, issue cannot be fetched"
            })
        }
        const issue = await prisma.issue.findUnique({
            where:{id:issueId,boardId:boardId,sectionId:sectionId},
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
        })

        if(!issue){
            return res.status(404).json({
                message:"Issue does not exist"
            })
        }

        return res.status(200).json({
            message:"issue found succesfully",
            issue
        })
    }catch(err:any){
        return res.status(500).json({
            err:err.message
        })
    }
}

export const getAllIssuesController = async(req:Request<getIssueInterface>,res:Response)=>{
    try{
        const{boardId,sectionId} = req.params;

        const board = await prisma.board.findUnique({
            where:{id:boardId}
        })

        if(!board){
            return res.status(404).json({
                message:"board does not exist, issues cannot be fetched"
            })
        }
        const section = await prisma.section.findUnique({
            where:{id:sectionId,boardId:boardId}
        })
        if(!section){
            return res.status(404).json({
                message:"Board exists but there is no such section, issues cannot be fetched"
            })
        }

        const issues = await prisma.issue.findMany({
            where:{boardId:boardId,sectionId:sectionId}
        })

        return res.status(200).json({
            message:"issues found succesfully",
            issues
        })
    }catch(err:any){
        
        return res.status(500).json({
            err:err.message
        })
    
    }

}

interface updateIssueInterface{
    boardId:string;
    sectionId:string;
    issueId:string;
    title?:string;
    description?:string;
}
export const updateIssueController = async(req:Request<updateIssueInterface>,res:Response)=>{
    try{
        const{boardId,sectionId,issueId} = req.params;
        const{title,description} = req.body;

        const board = await prisma.board.findUnique({
            where:{id:boardId}
        })

        if(!board){
            return res.status(404).json({
                message:"board does not exist, issue cannot be updated"
            })
        }
        const section = await prisma.section.findUnique({
            where:{id:sectionId,boardId:boardId}
        })
        if(!section){
            return res.status(404).json({
                message:"Board exists but there is no such section, issue cannot be updated"
            })
        }

        const issue = await prisma.issue.update({
            where:{id:issueId,boardId:boardId,sectionId:sectionId},
            data:{title:title,description:description}
        })

        return res.status(200).json({
            message:"issue updated succesfully",
            issue
        })
    }catch(err:any){
        return res.status(500).json({
            err:err.message
        })
    }
}

interface delInterface{
    boardId:string;
    sectionId:string;
    issueId:string;
}
export const deleteIssueController = async(req:Request<delInterface>,res:Response)=>{
    try{
        const {boardId,sectionId,issueId} = req.params;
        const board = await prisma.board.findUnique({
            where:{id:boardId}
        })
        if(!board){
            return res.status(404).json({
                message:"Board does not exist, issue cannot be deleted"
            })
        }
        const section = await prisma.section.findUnique({
            where:{id:sectionId,boardId:boardId}
        })
        if(!section){
            return res.status(404).json({
                message:"Board exists but there is no such section, issue cannot be deleted"
            })
        }
        const issue = await prisma.issue.delete({
            where:{id:issueId,boardId:boardId,sectionId:sectionId}
        })
        return res.status(200).json({
            message:"issue deleted succesfully",
            issue
        })
    }catch(err:any){
        return res.status(500).json({
            err:err.message
        })
    }
}

interface issueMove{
    boardId?:string;
    sectionId?:string;
    issueId?:string;
    targetSectionId?:string;
}

export const issueMoveController = async(req:Request<issueMove>,res:Response)=>{


    try{


        const {issueId,boardId} = req.params; 

        const {targetSectionId} = req.body;

        const issue = await prisma.issue.findUnique({
            where:{id:issueId,boardId:boardId}
        })

        if(!issue){
            return res.status(404).json({
                message:"Issue not found on this board"
            })
        }

        const targetsection = await prisma.section.findUnique({
            where:{id:targetSectionId,boardId:boardId}
        })
        if(!targetsection){
            return res.status(404).json({
                message:"Target section does not exist"
            })
        }

        if(issue.sectionId === targetSectionId){
            return res.status(400).json({
                message:"Issue is already in the target section"
            })
        }

        const updatedIssue = await prisma.issue.update({
            where:{id:issueId,boardId:boardId,sectionId:issue.sectionId},
            data:{sectionId:targetSectionId}
        })
        return res.status(200).json({
            message:"issue moved succesfully",
            updatedIssue
        })        

    }catch(err:any){

        res.status(500).json({
            err:err.message
        })
    }





}



//  issueMappning


interface issueMappingsInterface{
    userId:string,
    issueId:string,
    status?:string
}

// enum AssignStatus{
//     ACTIVE="ACTIVE",
//     INACTIVE="INACTIVE"
// }

export const assignIssueController = async(req:Request<issueMappingsInterface>,res:Response)=>{

    try{
        
        const {issueId} = req.params;
        const {userId} = req.body;

        const user = await prisma.user.findUnique({
            where:{id:userId}
        })

        const issue = await prisma.issue.findUnique({
            where:{id:issueId}
        })
        if(!issue)return res.status(404).json({message:"Issue not foundd!!"})
        const alreadAssigned = await prisma.issueMapping.findFirst({
            where:{issueId,userId}
        })

        if(alreadAssigned){

            return res.status(400).json({
                message:"User already assingned"
            })
        }


        const issueassign = await prisma.issueMapping.create({
            data:{
                issueId:issueId,
                userId:userId,
                status:"ACTIVE"
            }
        })

        return res.status(200).json({
            message:"Issue assigned successfully",
            issueassign
        })

    }catch(err:any){
        return res.status(500).json({
            err:err.message
        })
    }
}


export const unAssignIssueContrller = async(req:Request<issueMappingsInterface>,res:Response)=>{

    try{
        const {issueId} = req.params;
        const {userId} = req.body;

        const user = await prisma.user.findUnique({
            where:{id:userId}
        })
        if(!user) return res.status(400).json({message:"user not found nice try"});

        const issue = await prisma.issue.findUnique({
            where:{id:issueId}
        })
        if(!issue)return res.status(404).json({message:"issue not found"})
        

        const unassigned = await prisma.issueMapping.updateMany({
            where:{
                issueId:issueId,
                userId:userId,
                status:"ACTIVE"
            },
            data:{
                status:"INACTIVE"
            }
        })

        if (unassigned.count === 0) {
            return res.status(400).json({
                message: "User is not assigned to this issue"
            })
        }

        return res.status(200).json({
            message:"issue unassigned successfully"
        })

    }catch(err:any){
        return res.status(500).json({
            err:err.message
        })
    }
    
}

interface getAssigneesInterface{
    issueId:string;
}
export const getIssueAssigneesController = async(req:Request<getAssigneesInterface>,res:Response)=>{
    try{

        const {issueId} = req.params;

        const assignees = await prisma.issueMapping.findMany({
            where:{
                issueId:issueId,
                status:"ACTIVE"
            },
            include:{
                user:{
                    select:{
                        id:true,
                        username:true
                    }
                }
            }
        })

        if(!assignees){
            return res.status(404).json({
                message:"No assignees found for this issue"
            })
        }

        return res.status(200).json({
            message:"Issue assignees fetched successfully",
            assignees
        })
    
    }catch(err:any){
        return res.status(500).json({
            err:err.message
        })
    }
}


export const getAssignHistoryController = async(req:Request<getAssigneesInterface>,res:Response)=>{
    try{
        const {issueId} = req.params;

        const assignees = await prisma.issueMapping.findMany({
            where:{
                issueId:issueId
            },
            include:{
                user:{
                    select:{
                        id:true,
                        username:true
                    }
                }
            }
        })

        if(!assignees){
            return res.status(404).json({
                message:"No assignees found for this issue"
            })
        }

        return res.status(200).json({
            message:"Issue assignees fetched successfully",
            assignees
        })
    }catch(err:any){
        return res.status(500).json({
            err:err.message
        })
    }
}
