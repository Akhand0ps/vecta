import { GetObjectCommand } from "@aws-sdk/client-s3";
import {s3} from "./client";

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";


const BUCKET = process.env.AWS_S3_BUCKET || "vecta-s3";


export const getdownloadUrl = async(

    key:string,
    expiresIn:number=15*60
)=>{

    const command = new GetObjectCommand({
        Bucket:BUCKET,
        Key:key
    });

    return await getSignedUrl(s3,command,{expiresIn:expiresIn});

}


