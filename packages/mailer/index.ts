import {Resend} from "resend";




export interface SendInviteParams{
    to:string,
    orgName:string,
    inviteLink:string
}


interface InviteEmailTemplateProps {
  orgName: string;
  inviteLink: string;
}

export const InviteEmailTemplate = ({
  orgName,
  inviteLink,
}: InviteEmailTemplateProps) => {
  return `
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>You're invited to ${orgName}</title>
</head>

<body style="
  margin: 0;
  padding: 0;
  background-color: #f7f7f8;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  color: #18181b;
">

  <table
    role="presentation"
    width="100%"
    cellspacing="0"
    cellpadding="0"
    border="0"
    style="background-color: #f7f7f8; width: 100%;"
  >
    <tr>
      <td align="center" style="padding: 56px 20px;">

        <!-- Main container -->
        <table
          role="presentation"
          width="100%"
          cellspacing="0"
          cellpadding="0"
          border="0"
          style="
            max-width: 520px;
            background-color: #ffffff;
            border-radius: 16px;
            border: 1px solid #e7e7e9;
          "
        >

          <tr>
            <td style="padding: 48px 44px 44px;">

              <!-- Brand -->
              <div style="
                text-align: center;
                font-size: 18px;
                font-weight: 650;
                letter-spacing: -0.4px;
                color: #18181b;
                margin-bottom: 42px;
              ">
                vecta
              </div>

              <!-- Heading -->
              <h1 style="
                margin: 0 0 16px;
                text-align: center;
                font-size: 28px;
                line-height: 1.25;
                font-weight: 650;
                letter-spacing: -0.8px;
                color: #18181b;
              ">
                You're invited.
              </h1>

              <!-- Description -->
              <p style="
                margin: 0 auto;
                max-width: 390px;
                text-align: center;
                font-size: 15px;
                line-height: 1.7;
                color: #66666f;
              ">
                You've been invited to join
                <strong style="color: #303038; font-weight: 600;">
                  ${orgName}
                </strong>
                on Vecta.
              </p>

              <!-- CTA -->
              <table
                role="presentation"
                cellspacing="0"
                cellpadding="0"
                border="0"
                align="center"
                style="margin: 32px auto 0;"
              >
                <tr>
                  <td
                    align="center"
                    style="
                      border-radius: 9px;
                      background-color: #18181b;
                    "
                  >
                    <a
                      href="${inviteLink}"
                      target="_blank"
                      style="
                        display: inline-block;
                        padding: 13px 24px;
                        border-radius: 9px;
                        color: #ffffff;
                        font-size: 14px;
                        font-weight: 600;
                        line-height: 1;
                        text-decoration: none;
                      "
                    >
                      Accept invitation
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Fallback -->
              <p style="
                margin: 28px 0 0;
                text-align: center;
                font-size: 12px;
                line-height: 1.6;
                color: #9999a1;
              ">
                Or copy and paste this link into your browser:
              </p>

              <p style="
                margin: 6px auto 0;
                max-width: 390px;
                text-align: center;
                font-size: 12px;
                line-height: 1.6;
                word-break: break-all;
              ">
                <a
                  href="${inviteLink}"
                  style="
                    color: #66666f;
                    text-decoration: underline;
                  "
                >
                  ${inviteLink}
                </a>
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="
              padding: 20px 32px;
              border-top: 1px solid #eeeeef;
              text-align: center;
            ">
              <p style="
                margin: 0;
                font-size: 12px;
                line-height: 1.6;
                color: #a1a1aa;
              ">
                Vecta — love to make happy
              </p>
            </td>
          </tr>

        </table>

        <!-- Outside footer -->
        <p style="
          margin: 20px 0 0;
          font-size: 11px;
          line-height: 1.5;
          color: #b0b0b7;
          text-align: center;
        ">
          You received this email because someone invited you to their organization.
        </p>

      </td>
    </tr>
  </table>

</body>
</html>
`;
}



const resend = new Resend(process.env.RESEND_API_KEY);

export const sendInviteEmail = async({to,orgName,inviteLink}:SendInviteParams)=>{


    const { data, error } = await resend.emails.send({
            from: 'Vecta <invite@apscodes.tech>',
            to: [to],
            subject: `You're invited to join ${orgName}`,
            html: InviteEmailTemplate({ orgName,inviteLink }),
    });

    if (error) {
           return {success:false,err:error.message}
    }

    return {success:true,data:data};

}

interface SendWelcomeEmail{
    to:string,
}


const WelcomeEmailTemplate = () => {
    return `
    <!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to Vecta</title>
</head>

<body style="
  margin: 0;
  padding: 0;
  background-color: #f7f7f8;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  color: #18181b;
">

  <table
    role="presentation"
    width="100%"
    cellspacing="0"
    cellpadding="0"
    border="0"
    style="background-color: #f7f7f8; width: 100%;"
  >
    <tr>
      <td align="center" style="padding: 56px 20px;">

        <table
          role="presentation"
          width="100%"
          cellspacing="0"
          cellpadding="0"
          border="0"
          style="
            max-width: 520px;
            background-color: #ffffff;
            border-radius: 16px;
            border: 1px solid #e7e7e9;
          "
        >

          <tr>
            <td style="padding: 48px 44px 44px;">

              <div style="
                text-align: center;
                font-size: 18px;
                font-weight: 650;
                letter-spacing: -0.4px;
                color: #18181b;
                margin-bottom: 42px;
              ">
                vecta
              </div>

              <h1 style="
                margin: 0 0 16px;
                text-align: center;
                font-size: 28px;
                line-height: 1.25;
                font-weight: 650;
                letter-spacing: -0.8px;
                color: #18181b;
              ">
                Welcome to Vecta.
              </h1>

              <p style="
                margin: 0 auto 32px;
                max-width: 390px;
                text-align: center;
                font-size: 15px;
                line-height: 1.7;
                color: #66666f;
              ">
                We're excited to have you on board! Vecta is a modern
                workspace designed to help you organize, collaborate, and
                achieve more with less friction.
              </p>

              <table
                role="presentation"
                cellspacing="0"
                cellpadding="0"
                border="0"
                align="center"
                style="margin: 32px auto 0;"
              >
                <tr>
                  <td
                    align="center"
                    style="
                      border-radius: 9px;
                      background-color: #18181b;
                    "
                  >
                    <a
                      href="https://www.vecta.app"
                      target="_blank"
                      style="
                        display: inline-block;
                        padding: 13px 24px;
                        border-radius: 9px;
                        color: #ffffff;
                        font-size: 14px;
                        font-weight: 600;
                        line-height: 1;
                        text-decoration: none;
                      "
                    >
                      Start using Vecta
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <tr>
            <td style="
              padding: 20px 32px;
              border-top: 1px solid #eeeeef;
              text-align: center;
            ">
              <p style="
                margin: 0;
                font-size: 12px;
                line-height: 1.6;
                color: #a1a1aa;
              ">
                Vecta — love to make happy
              </p>
            </td>
          </tr>

        </table>

        <p style="
          margin: 20px 0 0;
          font-size: 11px;
          line-height: 1.5;
          color: #b0b0b7;
          text-align: center;
        ">
          You received this email because you signed up for a Vecta account.
        </p>

      </td>
    </tr>
  </table>

</body>
</html>
`
}


export const sendWelcomeEmail = async({to}:SendWelcomeEmail)=>{

    const { data, error } = await resend.emails.send({
            from: 'Vecta <no-reply@apscodes.tech>',
            to: [to],
            subject: `Welcome to Vecta`,
            html: WelcomeEmailTemplate(),
    });

    if (error) {
           return {success:false,err:error.message}
    }

    return {success:true,data:data};

}


interface emailData{
    to:string;
    otp:string;
}


const otpEmailTemplate = ({otp}:{otp:string})=>{
  return `
  <!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>OTP Verification for Vecta</title>
</head>

<body style="
  margin: 0;
  padding: 0;
  background-color: #f7f7f8;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  color: #18181b;
">

  <table
    role="presentation"
    width="100%"
    cellspacing="0"
    cellpadding="0"
    border="0"
    style="background-color: #f7f7f8; width: 100%;"
  >
    <tr>
      <td align="center" style="padding: 56px 20px;">

        <table
          role="presentation"
          width="100%"
          cellspacing="0"
          cellpadding="0"
          border="0"
          style="
            max-width: 520px;
            background-color: #ffffff;
            border-radius: 16px;
            border: 1px solid #eeeeef;
          "
        >

          <tr>
            <td style="padding: 44px 44px 32px;">

              <div style="
                text-align: center;
                font-size: 18px;
                font-weight: 650;
                letter-spacing: -0.4px;
                color: #18181b;
                margin-bottom: 32px;
              ">
                Vecta
              </div>

              <h1 style="
                margin: 0 0 20px;
                text-align: center;
                font-size: 28px;
                line-height: 1.25;
                font-weight: 650;
                letter-spacing: -0.8px;
                color: #18181b;
              ">
                Verify Your Email Address
              </h1>

              <p style="
                margin: 0 auto 28px;
                max-width: 390px;
                text-align: center;
                font-size: 15px;
                line-height: 1.7;
                color: #66666f;
              ">
                Enter the code below to verify your email address. This code
                is only valid for the next 2 minutes.
              </p>

              <table
                role="presentation"
                cellspacing="0"
                cellpadding="0"
                border="0"
                align="center"
                style="margin: 28px auto 24px;"
              >
                <tr>
                  <td style="
                    padding: 14px 24px;
                    border-radius: 10px;
                    background-color: #eeeeef;
                  ">
                    <span style="
                      font-size: 24px;
                      font-weight: 600;
                      letter-spacing: 6px;
                      color: #18181b;
                    ">
                      ${otp}
                    </span>
                  </td>
                </tr>
              </table>

              <p style="
                margin: 0 auto 28px;
                max-width: 390px;
                text-align: center;
                font-size: 14px;
                line-height: 1.7;
                color: #66666f;
              ">
                If you didn’t initiate this request, please ignore this
                email.
              </p>

            </td>
          </tr>

          <tr>
            <td style="
              padding: 16px 32px;
              border-top: 1px solid #eeeeef;
              text-align: center;
            ">
              <p style="
                margin: 0;
                font-size: 12px;
                line-height: 1.6;
                color: #a1a1aa;
              ">
                Vecta — love to make happy
              </p>
            </td>
          </tr>

        </table>

        <p style="
          margin: 20px 0 0;
          font-size: 11px;
          line-height: 1.5;
          color: #b0b0b7;
          text-align: center;
        ">
          This is an automated message. Please do not reply to this email.
        </p>

      </td>
    </tr>
  </table>

</body>
</html>
  `
}

export const sendOtpEmail = async({to,otp}:emailData)=>{

    const {data,error} = await resend.emails.send({
      from:'Vector <no-reply@apscodes.tech>',
      to:[to],
      subject:'Otp Verification for login to Vecta',
      html:otpEmailTemplate({otp})
    })

    if(error){
        return {success:false,err:error.message}
    }

    return {success:true,data:data}
}