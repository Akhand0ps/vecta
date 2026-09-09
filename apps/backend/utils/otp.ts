import crypto from "crypto";





export const generateOtp = async()=>{

    const otp = crypto.randomInt(100000,999999).toString();

    const hashedOtp = crypto.createHash('sha256').update(otp).digest("hex");

    
    
    return {otp,hashedOtp};
} 



export const isValidOtp = (otp:string,hashedOtp:string)=>{

    return crypto.createHash('sha256').update(otp).digest('hex') === hashedOtp;
}
