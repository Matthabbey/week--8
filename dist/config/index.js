"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.superAdmin1 = exports.APP_SECRET = exports.userSubject = exports.fromAdminMail = exports.GMAIL_PASS = exports.GMAIL_USER = exports.fromAdminPhone = exports.authToken = exports.accountSid = exports.db = void 0;
const sequelize_1 = require("sequelize");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.db = new sequelize_1.Sequelize('app', '', '', {
    storage: "./admin.sqlite",
    dialect: "sqlite",
    logging: false
});
exports.accountSid = process.env.AccountSID;
exports.authToken = process.env.AuthToken;
exports.fromAdminPhone = process.env.FromAdminPhone;
exports.GMAIL_USER = process.env.GMAIL_USER;
exports.GMAIL_PASS = process.env.GMAIL_PASS;
exports.fromAdminMail = process.env.FromAdminMail;
exports.userSubject = process.env.userSubject;
exports.APP_SECRET = process.env.APP_SECRET;
exports.superAdmin1 = process.env.superAdmin1;
