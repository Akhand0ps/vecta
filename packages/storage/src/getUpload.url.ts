import { Bucket$, PutObjectCommand } from "@aws-sdk/client-s3";
import {s3} from "./client";

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";



const BUCKET = process.env.AWS_S3_BUCKET || "vecta-s3";

export const getUploadUrl = async(

    key:string,
    contentType:string,
    expiresIn=900
)=>{


    const command = new PutObjectCommand({
        Bucket:BUCKET,
        Key:key,
        ContentType:contentType
    })

    const url = await getSignedUrl(s3,command,{expiresIn:expiresIn})
    return url;

}