import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import {s3} from "./client";

export const deleteObject=async(key:string)=>{
    const command = new DeleteObjectCommand({
        Bucket:"vecta-s3",
        Key:key
    })
    return s3.send(command)
}