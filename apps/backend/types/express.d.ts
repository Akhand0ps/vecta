

//extend the express Request type

declare namespace Express{
    interface Request {
        userId?:string;
        sessionId?:string;
        file?:{
            mimetype:string;
            buffer:Buffer;
            size:number;
            originalname:string;
            path:string;
            
        }
    }
}