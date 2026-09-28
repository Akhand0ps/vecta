
export type LoginOtpJob = {
    to:string,
    otp:string
}


export type EmailJobMap = {
    "login-otp":LoginOtpJob
}