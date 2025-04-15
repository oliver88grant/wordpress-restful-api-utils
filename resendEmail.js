import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config(); 

const resend = new Resend(process.env.RESEND_API_KEY);

(async function () {
  const { data, error } = await resend.emails.send({
    from: 'Acme <no-reply@resend.dev>',
    to: ['oliver.88.grant@gmail.com'],
    subject: 'Hello World',
    html: '<strong>It works from resend service!</strong>',
  });

  if (error) {
    return console.error({ error });
  }

  console.log({ data });
})();