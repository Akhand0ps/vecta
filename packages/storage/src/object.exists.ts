import { HeadObjectCommand, type Bucket } from "@aws-sdk/client-s3";
import {s3} from './client';



const BUCKET = process.env.AWS_BUCKET || "vecta-s3";


export const objectExists = async(

   key:string
)=>{


    try{

        const command = new HeadObjectCommand({
            Bucket:BUCKET,
            Key:key
        })

        return await s3.send(command);

    }catch(error){
        console.log("Error in objectExists: ",error);
        return false;
    }
    

}