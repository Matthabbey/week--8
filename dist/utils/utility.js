"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePassword = exports.loginSchema = exports.verifySignature = exports.GenerateSignature = exports.GeneratePassword = exports.GenerateSalt = exports.updateSchema = exports.adminSchema = exports.option = exports.vendorSchema = exports.registerSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
exports.registerSchema = joi_1.default.object().keys({
    email: joi_1.default.string().email().required(),
    phone: joi_1.default.string().required(),
    password: joi_1.default.string().regex(/^[a-zA-Z0-9]{3,30}$/).required(),
    confirm_password: joi_1.default.any().equal(joi_1.default.ref('password')).required()
        .label('confirm password').messages({ 'any.only': '{{#label}} does not match' })
});
exports.vendorSchema = joi_1.default.object().keys({
    email: joi_1.default.string().required(),
    phone: joi_1.default.string().required(),
    password: joi_1.default.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")),
    name: joi_1.default.string().required(),
    ownerName: joi_1.default.string().required(),
    address: joi_1.default.string().required(),
    pincode: joi_1.default.string().required(),
});
exports.option = {
    abortEarly: true,
    errors: {
        wrap: {
            label: ''
        }
    }
};
exports.adminSchema = joi_1.default.object().keys({
    email: joi_1.default.string().required(),
    phone: joi_1.default.string().required(),
    password: joi_1.default.string().regex(/[a-zA-Z0-9]{3,30}/),
    //.pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
    firstName: joi_1.default.string().required(),
    lastName: joi_1.default.string().required(),
    address: joi_1.default.string().required(),
});
exports.updateSchema = joi_1.default.object().keys({
    firstName: joi_1.default.string().required(),
    lastName: joi_1.default.string().required(),
    phone: joi_1.default.string().required(),
    address: joi_1.default.string().required(),
});
//generate salt and hash password with bcrypt
//generate salt 
// export const GenerateSalt = async() => {
//     return await bcrypt.genSalt()
// }
const GenerateSalt = async () => {
    return await bcrypt_1.default.genSalt();
};
exports.GenerateSalt = GenerateSalt;
//hash password with generated salt
// export const GeneratePassword = async(password:string, salt:string) => {
//     return await bcrypt.hash(password, salt)
// }
const GeneratePassword = async (password, salt) => {
    return await bcrypt_1.default.hash(password, salt);
};
exports.GeneratePassword = GeneratePassword;
//generate a signature or token using a payload(user id, email, verified status) and a secret key
const GenerateSignature = async (payload) => {
    return jsonwebtoken_1.default.sign(payload, config_1.APP_SECRET, { expiresIn: '5d' });
};
exports.GenerateSignature = GenerateSignature;
const verifySignature = (signature) => {
    return jsonwebtoken_1.default.verify(signature, config_1.APP_SECRET);
};
exports.verifySignature = verifySignature;
exports.loginSchema = joi_1.default.object().keys({
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().regex(/^[a-zA-Z0-9]{3,30}$/).required()
});
const validatePassword = async (enteredPassword, savedPassword, salt) => {
    return await (0, exports.GeneratePassword)(enteredPassword, salt) === savedPassword;
};
exports.validatePassword = validatePassword;
