

//extend the express Request type

declare namespace Express{
    interface Request {
        userId?:string;
        sessionId?:string
    }
}