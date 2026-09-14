import {PutObjectCommand} from "@aws-sdk/client-s3";
import {s3} from "./client";



export const uploadObject=(
    key:string,
    body:string | Buffer,
    contentType: string
)=>{

    const command = new PutObjectCommand({
        Bucket:"vecta-s3",
        Key:key,
        Body:body,
        ContentType:contentType
    })



    return s3.send(command)
}