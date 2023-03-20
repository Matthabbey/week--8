"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserProfile = exports.getSingleUser = exports.getAllUsers = exports.resendOTP = exports.Login = exports.verifyUser = exports.Register = void 0;
const utility_1 = require("./../utils/utility");
const notifications_1 = require("./../utils/notifications");
const utils_1 = require("../utils");
const utility_2 = require("../utils/utility");
const userModel_1 = require("../model/userModel");
const uuid_1 = require("uuid");
const config_1 = require("../config");
// export const Register = async (req:Request, res:Response) => {
//     try{
//         //destructure the request body
//         const  {email, phone, password, confirm_password} = req.body;
//         //validate the request body using the registerSchema from Joi
//         const validateResult = registerSchema.validate(req.body, option);
//         if(validateResult.error){
//         //console.log(validateResult.error.details);
//             return res.status(400).json({message: validateResult.error.details[0].message
//             })
//         }
//         //generate salt and hash password
//             const salt = await GenerateSalt();
//             const userPassword = await GeneratePassword(password, salt);
//             console.log(userPassword);
//     } catch(err){
//                     res.status(500).json({Error: 'internal server error',
//                     route: '/users/signup'})
//     }
// }
const Register = async (req, res) => {
    try {
        const { email, phone, password, confirm_password } = req.body;
        const uuiduser = (0, uuid_1.v4)();
        const validateResult = utils_1.registerSchema.validate(req.body, utils_1.option);
        if (validateResult.error) {
            return res
                .status(400)
                .json({ Error: validateResult.error.details[0].message });
        }
        const salt = await (0, utility_2.GenerateSalt)();
        const userPassword = await (0, utility_2.GeneratePassword)(password, salt);
        console.log(userPassword);
        //Generate OTP
        const { otp, expiry } = (0, utils_1.GenerateOTP)();
        console.log(otp, expiry);
        //check if user already exists using key value pairs in the object
        const User = await userModel_1.UserInstance.findOne({ where: { email: email } });
        //Create User
        if (!User) {
            let user = await userModel_1.UserInstance.create({
                id: uuiduser,
                email,
                password: userPassword,
                firstName: "",
                lastName: "",
                salt,
                address: "",
                phone,
                otp,
                otp_expiry: expiry,
                lng: 0,
                lat: 0,
                verified: false,
                role: "user"
            });
            //send OTP to user
            await (0, utils_1.onRequestOTP)(otp, phone);
            //send email to user
            const html = (0, utils_1.emailHtml)(otp);
            await (0, notifications_1.mailSent)(config_1.fromAdminMail, email, config_1.userSubject, html);
            //check if user already exists using key value pairs in the object
            const User = (await userModel_1.UserInstance.findOne({
                where: { email: email },
            }));
            let signature = await (0, utils_1.GenerateSignature)({
                id: User.id,
                email: User.email,
                verified: User.verified,
            });
            return res.status(201).json({
                message: "User created successfully, check your email or phone for OTP verification",
                signature,
                verified: User.verified,
            });
        }
        //User already exists
        return res.status(400).json({ Error: "User already exists" });
    }
    catch (err) {
        res.status(500)
            .json({ Error: "internal server error", route: "/users/signup" });
    }
};
exports.Register = Register;
/** ================verify users ============== */
const verifyUser = async (req, res) => {
    try {
        const token = req.params.signature;
        const decode = (0, utility_2.verifySignature)(token);
        // check if user exists/is registered
        const User = (await userModel_1.UserInstance.findOne({
            where: { email: decode.email },
        }));
        if (User) {
            const { otp } = req.body;
            if (parseInt(otp) === User.otp && User.otp_expiry >= new Date()) {
                const updatedUser = (await userModel_1.UserInstance.update({ verified: true }, { where: { email: decode.email } }));
                //generate signature again for user
                let signature = await (0, utils_1.GenerateSignature)({
                    id: updatedUser.id,
                    email: updatedUser.email,
                    verified: updatedUser.verified,
                });
                return res.status(200).json({
                    signature,
                    verified: User.verified,
                    message: "User verified successfully",
                });
            }
        }
        return res
            .status(400)
            .json({ Error: "OTP expired, wrong credential  or User not found" });
    }
    catch (err) {
        res
            .status(500)
            .json({ Error: "internal server error", route: "/users/verify" });
    }
};
exports.verifyUser = verifyUser;
/** ================login users ============== */
const Login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const validateResult = utils_1.loginSchema.validate(req.body, utils_1.option);
        if (validateResult.error) {
            return res.status(400).json({
                Error: validateResult.error.details[0].message,
            });
        }
        const User = (await userModel_1.UserInstance.findOne({
            where: { email: email },
        }));
        if (User.verified === true) {
            const validation = await (0, utility_1.validatePassword)(password, User.password, User.salt);
            if (validation) {
                let signature = await (0, utils_1.GenerateSignature)({
                    id: User.id,
                    email: User.email,
                    verified: User.verified,
                });
                return res.status(200).json({
                    message: "You have successfully logged in",
                    signature,
                    email: User.email,
                    verified: User.verified,
                    role: User.role
                });
            }
        }
        return res.status(400).json({ Error: "wrong username/email or password or not verified" });
    }
    catch (err) {
        res
            .status(500)
            .json({ Error: "internal server error", route: "/users/login" });
    }
};
exports.Login = Login;
/** ================ resend OTP ============== */
const resendOTP = async (req, res) => {
    try {
        const token = req.params.signature;
        const decode = (0, utility_2.verifySignature)(token);
        // check if user exists/is registered
        const User = (await userModel_1.UserInstance.findOne({
            where: { email: decode.email },
        }));
        if (User) {
            //generate OTP
            const { otp, expiry } = (0, utils_1.GenerateOTP)();
            const updatedUser = await userModel_1.UserInstance.update({
                otp,
                otp_expiry: expiry
            }, { where: { email: decode.email } });
            if (updatedUser) {
                const User = (await userModel_1.UserInstance.findOne({
                    where: { email: decode.email },
                }));
                // await onRequestOTP(otp, User.phone)
                const html = (0, utils_1.emailHtml)(otp);
                await (0, notifications_1.mailSent)(config_1.fromAdminMail, updatedUser.email, config_1.userSubject, html);
                return res.status(200).json({
                    message: "OTP resent to resgistered phone and email"
                });
            }
        }
        return res.status(400).json({ Error: "error sending OTP" });
    }
    catch (err) {
        res
            .status(500)
            .json({ Error: "internal server error", route: "/users/resend-otp" });
    }
};
exports.resendOTP = resendOTP;
/** ================ User Profile ================== */
const getAllUsers = async (req, res) => {
    try {
        // const users = await UserInstance.findAll({})
        //limit numbers of users showing/pagiantion
        const limit = req.query.limit;
        const users = await userModel_1.UserInstance.findAndCountAll({
            //limit numbers of users showing/pagiantion
            limit: limit
        });
        return res.status(200).json({
            message: "you have succesfully retireved all users", count: users.count, Users: users.rows
        });
    }
    catch (err) {
        return res.status(500).json({
            Error: "internal server error",
            Route: "/users/get-all-users"
        });
    }
};
exports.getAllUsers = getAllUsers;
const getSingleUser = async (req, res) => {
    try {
        const { id } = req.user;
        //find user by id
        const user = await userModel_1.UserInstance.findOne({
            where: { id: id }
        });
        if (user) {
            return res.status(200).json({
                user
            });
        }
        return res.status(400).json({
            Message: "User not found"
        });
    }
    catch (err) {
        return res.status(500).json({
            Error: "internal server error",
            Route: "/users/get-user"
        });
    }
};
exports.getSingleUser = getSingleUser;
const updateUserProfile = async (req, res) => {
    try {
        const { id } = req.user;
        const { firstName, lastName, address, phone } = req.body;
        const validateResult = utils_1.updateSchema.validate(req.body, utils_1.option);
        if (validateResult.error) {
            return res.status(400).json({
                Error: validateResult.error.details[0].message,
            });
        }
        //check if its a reg user
        const User = (await userModel_1.UserInstance.findOne({
            where: { id: id },
        }));
        if (!User) {
            return res.status(400).json({
                Error: "you are not authorised to update your profile",
            });
        }
        const updatedUser = (await userModel_1.UserInstance.update({
            firstName,
            lastName,
            address,
            phone,
        }, { where: { id: id } }));
        if (updatedUser) {
            const User = (await userModel_1.UserInstance.findOne({
                where: { id: id },
            }));
            return res.status(200).json({
                message: "u have succesfully updated your profile",
                User,
            });
        }
        return res.status(500).json({
            message: "Error Occured",
        });
    }
    catch (error) {
        return res.status(500).json({
            Error: "internal Serer Error",
            route: "/users/update-profile",
        });
    }
};
exports.updateUserProfile = updateUserProfile;
