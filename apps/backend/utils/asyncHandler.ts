
import type { Request,Response,NextFunction } from "express";

export const asyncHandler = (fn: any)=>{

    return (req:Request,res:Response,next:NextFunction)=>{
        fn(req,res,next).catch((err:any)=>next(err))
        /*
            fn(req,res,next).catch(next)

            fn-> returns promise

            if it rejects-throws error-> .catcch() invokes next with the
            rejection reason(AppError) object.

            so .catch((err)=>next(err)) is same as .catch(next)



            async function + throw = Promise that rejects with that error

         */
    }
}



/*
const makeGreeter = ()=>{
    console.log("f1")
    return ()=> console.log("f2");
}

const greet = makeGreeter();

console.log(typeof greet);

const p = Promise.reject("something broke")


p.catch((err)=>console.log(err));


const log = (err:any)=>console.log(err);

p.catch(log);

*/


//.catch invokes the callback with the rejection reason as its first argument.
//So p.catch(log) → .catch invokes log with the rejection reason as the first argument.