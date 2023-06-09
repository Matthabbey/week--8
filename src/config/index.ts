import {Sequelize} from 'sequelize'
import dotenv from 'dotenv'

dotenv.config()

export const db = new Sequelize('app', '', '', {
    storage:"./admin.sqlite",
    dialect: "sqlite",
    logging: false
});


export const accountSid = process.env.AccountSID;

export const authToken = process.env.AuthToken;

export const fromAdminPhone = process.env.FromAdminPhone;

export const GMAIL_USER = process.env.GMAIL_USER;

export const GMAIL_PASS = process.env.GMAIL_PASS;

export const fromAdminMail = process.env.FromAdminMail as string

export const userSubject = process.env.userSubject as string

export const APP_SECRET = process.env.APP_SECRET as string

export const superAdmin1 = process.env.superAdmin1 as string