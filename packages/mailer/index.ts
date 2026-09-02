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
            from: 'Vecta <[EMAIL_ADDRESS]>',
            to: [to],
            subject: `You're invited to join ${orgName}`,
            html: InviteEmailTemplate({ orgName,inviteLink }),
    });

    if (error) {
           return {success:false,err:error.message}
    }

    return {success:true,data:data};

}