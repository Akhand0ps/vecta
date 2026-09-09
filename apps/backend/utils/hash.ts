import bcrypt from "bcrypt";



export const hashpassword = async(password:string)=>{

    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash(password,salt);
    return hash;
}

export const comparePassword = async(password:string,hash:string)=>{

    return await bcrypt.compare(password,hash);
}