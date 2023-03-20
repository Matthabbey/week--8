"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailHtml = exports.mailSent = exports.onRequestOTP = exports.GenerateOTP = void 0;
const config_1 = require("../config");
const nodemailer_1 = __importDefault(require("nodemailer"));
// GenerateOTP();
const GenerateOTP = () => {
    const otp = Math.floor(1000 + Math.random() * 9000);
    // console.log(otp);
    const expiry = new Date();
    //set time from date and then get out the time
    expiry.setTime(new Date().getTime() + (30 * 60 * 1000));
    return { otp, expiry };
};
exports.GenerateOTP = GenerateOTP;
// SendOTP(); using twilio
const onRequestOTP = async (otp, toPhoneNumber) => {
    const client = require('twilio')(config_1.accountSid, config_1.authToken);
    const response = await client.messages
        .create({
        body: `Your OTP is ${otp}`,
        to: toPhoneNumber,
        from: config_1.fromAdminPhone
    });
    return response;
};
exports.onRequestOTP = onRequestOTP;
//send email using nodemailer.....a. create transport
const transport = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: config_1.GMAIL_USER,
        pass: config_1.GMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});
//send email using nodemailer.....b. send mail
const mailSent = async (from, to, subject, html) => {
    try {
        const response = await transport.sendMail({
            from: config_1.fromAdminMail, to, subject: config_1.userSubject, html
        });
        return response;
    }
    catch (err) {
        console.log(err);
    }
};
exports.mailSent = mailSent;
const emailHtml = (otp) => {
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
    `;
    return response;
};
exports.emailHtml = emailHtml;
