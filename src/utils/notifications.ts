import { accountSid, authToken, fromAdminPhone, GMAIL_USER, GMAIL_PASS, fromAdminMail, userSubject} from '../config' 
import nodemailer from 'nodemailer'



// GenerateOTP();
export const GenerateOTP = () => {
    const otp = Math.floor(1000 + Math.random() * 9000);
    // console.log(otp);
    const expiry = new Date();

    //set time from date and then get out the time
   expiry.setTime(new Date().getTime() + (30 * 60 * 1000))

return {otp, expiry}
}



// SendOTP(); using twilio
export const onRequestOTP = async (otp:number, toPhoneNumber:string) => {
    const client = require('twilio')(accountSid, authToken); 

   const response = await client.messages 
      .create({ 
        body: `Your OTP is ${otp}`,        
        to: toPhoneNumber,
        from: fromAdminPhone
       }) 

       return response;
}



//send email using nodemailer.....a. create transport
const transport = nodemailer.createTransport({
    service: 'gmail',   
    auth: {
        user: GMAIL_USER,
        pass: GMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
})

//send email using nodemailer.....b. send mail
export const mailSent = async (
    from:string,
    to:string,
    subject:string,
    html:string
) => {
try {
const response = await transport.sendMail({
    from: fromAdminMail, to, subject: userSubject, html
})
return response
} catch (err) {
    console.log(err);
}
}

export const emailHtml = (otp:number):string => {
    let response = `
    <div style="max-width:700px;
    margin: auto; border:10px; solid #add;
    padding:50px 20px; font-size:110%;
    "> 
    <h2 style="text-align: center; text-transform: uppercase; 
    color: teal;">Welcome to Food App
    </h2>
    <p>Congratulations! You're almost set to start using Food App. your otp is ${otp}</p>
    </div>
    `
    return response
}

