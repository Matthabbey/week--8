"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unsuspendVendor = exports.suspendProperty = exports.suspendVendor = exports.deleteUser = exports.deleteProperty = exports.deleteVendor = exports.getSingleVendor = exports.getAllProperties = exports.getAllVendors = exports.getAllUsers = exports.AdminRegister = exports.SuperAdminRegister = void 0;
const utils_1 = require("../utils");
const userModel_1 = require("../model/userModel");
const uuid_1 = require("uuid");
const config_1 = require("../config");
const vendorModel_1 = require("../model/vendorModel");
const propertyModel_1 = require("../model/propertyModel");
/**==============SUPER ADMIN REGISTRATION=============== */
const SuperAdminRegister = async (req, res) => {
    try {
        const { email, phone, password, firstName, lastName, address } = req.body;
        //to create user Id from uuid
        const uuiduser = (0, uuid_1.v4)();
        const validateResult = utils_1.adminSchema.validate(req.body, utils_1.option);
        if (validateResult.error) {
            return res.status(400).json({
                Error: validateResult.error.details[0].message,
            });
        }
        //generate salt
        const salt = await (0, utils_1.GenerateSalt)();
        //encrypt password
        const userPassword = await (0, utils_1.GeneratePassword)(password, salt);
        //Generte OTP
        const { otp, expiry } = (0, utils_1.GenerateOTP)();
        //check if the admin exist
        const Admin = (await userModel_1.UserInstance.findOne({
            where: { email: email },
        }));
        //create admin if not existing
        if (!Admin) {
            //.role  === "superadmin")
            //to create admin u must add all the model properties
            await userModel_1.UserInstance.create({
                id: uuiduser,
                email,
                password: userPassword,
                firstName,
                lastName,
                salt,
                address,
                phone,
                otp,
                otp_expiry: expiry,
                lng: 0,
                lat: 0,
                verified: true,
                role: "superadmin", //admin
            });
            //send OTP to USer phone number
            //await onRequestOTP(otp, phone)
            //check if admin Exist, if yes, he is given a signature(token)
            const Admin = (await userModel_1.UserInstance.findOne({
                where: { email: email },
            })); //attributes comes from the User attribute
            //generate signature
            const signature = await (0, utils_1.GenerateSignature)({
                id: Admin.id,
                email: Admin.email,
                verified: Admin.verified,
            });
            //   console.log(signature)
            // return statement on creation of user
            return res.status(201).json({
                message: "Admin created Successfull",
                signature,
                verified: Admin.verified,
            });
        }
        // return statement if user exist
        return res.status(400).json({
            message: "Admin already exist",
        });
    }
    catch (error) {
        res.status(500).json({
            Error: "Internal Server Error",
            route: "/admin/create-superadmin",
        });
    }
};
exports.SuperAdminRegister = SuperAdminRegister;
/**=============ADMIN REGISTER ===================== */
const AdminRegister = async (req, res) => {
    try {
        // const id = req.user.id
        const { email, phone, password, firstName, lastName, address } = req.body;
        //to create user Id from uuid
        const uuiduser = (0, uuid_1.v4)();
        const validateResult = utils_1.adminSchema.validate(req.body, utils_1.option);
        if (validateResult.error) {
            return res.status(400).json({
                Error: validateResult.error.details[0].message,
            });
        }
        //generate salt
        const salt = await (0, utils_1.GenerateSalt)();
        //encrypt password
        const userPassword = await (0, utils_1.GeneratePassword)(password, salt);
        //Generte OTP
        const { otp, expiry } = (0, utils_1.GenerateOTP)();
        //check if the admin exist
        const Admin = (await userModel_1.UserInstance.findOne({
            where: { email: email },
        }));
        //create admin if not existing
        if (!Admin) {
            const superadmin = (await userModel_1.UserInstance.findOne({
                where: { email: config_1.superAdmin1 },
            }));
            if (superadmin.role === "superadmin") {
                //.role  === "superadmin")
                //to create admin u must add all the model properties
                await userModel_1.UserInstance.create({
                    id: uuiduser,
                    email,
                    password: userPassword,
                    firstName,
                    lastName,
                    salt,
                    address,
                    phone,
                    otp,
                    otp_expiry: expiry,
                    lng: 0,
                    lat: 0,
                    verified: true,
                    role: "admin", //admin
                });
                //send OTP to USer phone number
                //await onRequestOTP(otp, phone)
                //check if admin Exist, if yes, he is given a signature(token)
                const Admin = (await userModel_1.UserInstance.findOne({
                    where: { email: email },
                })); //attributes comes from the User attribute
                //generate signature
                const signature = await (0, utils_1.GenerateSignature)({
                    id: Admin.id,
                    email: Admin.email,
                    verified: Admin.verified,
                });
                //   console.log(signature)
                // return statement on creation of user
                return res.status(201).json({
                    message: "Admin Created Successfull",
                    signature,
                    verified: Admin.verified,
                });
            }
        }
        // return statement if user exist
        return res.status(400).json({
            message: "Admin Already Exist",
        });
    }
    catch (error) {
        res.status(500).json({
            Error: "Internal Server Error",
            route: "/admin/signup",
        });
    }
};
exports.AdminRegister = AdminRegister;
/**============= GET ALL ===================== */
const getAllUsers = async (req, res) => {
    try {
        const { id } = req.user;
        //find user by id
        const admin = (await userModel_1.UserInstance.findOne({
            where: { id: id },
        }));
        if (admin) {
            const limit = req.query.limit;
            const users = await userModel_1.UserInstance.findAndCountAll({
                limit: limit,
            });
            return res.status(200).json({
                message: "you have succesfully retireved all users",
                count: users.count,
                Users: users.rows,
            });
        }
        return res.status(200).json({
            message: "unauthorised",
        });
    }
    catch (err) {
        return res.status(500).json({
            Error: "internal server error",
            Route: "/admin/get-all-users",
        });
    }
};
exports.getAllUsers = getAllUsers;
const getAllVendors = async (req, res) => {
    try {
        const { id } = req.user;
        const admin = (await userModel_1.UserInstance.findOne({
            where: { id: id },
        }));
        if (admin) {
            const limit = req.query.limit;
            const vendors = await vendorModel_1.VendorInstance.findAndCountAll({
                limit: limit,
            });
            return res.status(200).json({
                message: "you have succesfully retireved all vendors",
                count: vendors.count,
                Vendors: vendors.rows,
            });
        }
        return res.status(200).json({
            message: "unauthorised",
        });
    }
    catch (err) {
        return res.status(500).json({
            Error: "internal server error",
            Route: "/admin/get-all-vendors",
        });
    }
};
exports.getAllVendors = getAllVendors;
const getAllProperties = async (req, res) => {
    try {
        const limit = req.query.limit;
        const property = await propertyModel_1.propertyInstance.findAndCountAll({
            limit: limit,
        });
        return res.status(200).json({
            message: "you have succesfully retireved all vendors",
            count: property.count,
            Vendors: property.rows,
        });
    }
    catch (err) {
        return res.status(500).json({
            Error: "internal server error",
            Route: "/admin/get-all-vendors",
        });
    }
};
exports.getAllProperties = getAllProperties;
const getSingleVendor = async (req, res) => {
    try {
        const { id } = req.user;
        const vendorId = req.params.vendorId;
        //find user by id
        const admin = (await userModel_1.UserInstance.findOne({
            where: { id: id },
        }));
        if (admin) {
            const Vendor = (await vendorModel_1.VendorInstance.findOne({
                where: { id: vendorId },
            }));
            return res.status(200).json({
                Vendor,
            });
        }
        return res.status(400).json({
            Message: "not authorised",
        });
    }
    catch (err) {
        return res.status(500).json({
            Error: "internal server error",
            Route: "/admin/get-vendor",
        });
    }
};
exports.getSingleVendor = getSingleVendor;
const deleteVendor = async (req, res) => {
    try {
        const id = req.user.id;
        const vendorid = req.params.vendorid;
        //check if the vendor exist
        const admin = (await userModel_1.UserInstance.findOne({
            where: { id: id },
        }));
        if (admin) {
            const deletedVendor = (await vendorModel_1.VendorInstance.destroy({
                where: { id: vendorid },
            }));
            return res.status(200).json({
                message: "vendor successfully deleted",
                deletedVendor,
            });
        }
    }
    catch (err) {
        res.status(500).json({
            Error: "Internal server Error",
            route: "/admin/delete-vendor",
        });
    }
};
exports.deleteVendor = deleteVendor;
const deleteProperty = async (req, res) => {
    try {
        const id = req.user.id;
        const propertyid = req.params.propertyid;
        const admin = (await userModel_1.UserInstance.findOne({
            where: { id: id },
        }));
        if (admin) {
            const deletedProperty = (await propertyModel_1.propertyInstance.destroy({
                where: { id: propertyid },
            }));
            return res.status(200).json({
                message: "vendor successfully deleted",
                deletedProperty,
            });
        }
    }
    catch (err) {
        res.status(500).json({
            Error: "Internal server Error",
            route: "/admin/delete-property",
        });
    }
};
exports.deleteProperty = deleteProperty;
const deleteUser = async (req, res) => {
    try {
        const id = req.user.id;
        const userid = req.params.userid;
        const admin = (await userModel_1.UserInstance.findOne({
            where: { id: id },
        }));
        if (admin) {
            const deletedProperty = (await userModel_1.UserInstance.destroy({
                where: { id: userid },
            }));
            return res.status(200).json({
                message: "User successfully deleted",
                deletedProperty,
            });
        }
    }
    catch (err) {
        res.status(500).json({
            Error: "Internal server Error",
            route: "/admin/delete-property",
        });
    }
};
exports.deleteUser = deleteUser;
const suspendVendor = async (req, res) => {
    try {
        const { id } = req.user;
        const vendorid = req.params.vendorid;
        const Admin = (await userModel_1.UserInstance.findOne({
            where: { id: id },
        }));
        if (Admin) {
            const Vendor = (await vendorModel_1.VendorInstance.findOne({
                where: { id: vendorid },
            }));
            const suspendedVendor = (await vendorModel_1.VendorInstance.update({ suspended: true }, { where: { id: Vendor.id } }));
            return res.status(200).json({
                message: "vendor suspended",
                suspendedVendor,
            });
        }
        return res.status(500).json({
            message: "Unauthorised",
        });
    }
    catch (error) {
        return res.status(500).json({
            Error: "internal Serer Error",
            route: "/admin/suspend-vendor",
        });
    }
};
exports.suspendVendor = suspendVendor;
const suspendProperty = async (req, res) => {
    try {
        const { id } = req.user;
        const propertyid = req.params.propertyid;
        const Admin = (await userModel_1.UserInstance.findOne({
            where: { id: id },
        }));
        if (Admin) {
            const property = (await propertyModel_1.propertyInstance.findOne({
                where: { id: propertyid },
            }));
            const suspendedVendor = (await propertyModel_1.propertyInstance.update({ suspended: true }, { where: { id: property.id } }));
            return res.status(200).json({
                message: "vendor suspended",
                suspendedVendor,
            });
        }
        return res.status(500).json({
            message: "Unauthorised",
        });
    }
    catch (error) {
        return res.status(500).json({
            Error: "internal Serer Error",
            route: "/admin/suspend-vendor",
        });
    }
};
exports.suspendProperty = suspendProperty;
const unsuspendVendor = async (req, res) => {
    try {
        const { id } = req.user;
        const vendorid = req.params.vendorid;
        const Admin = (await userModel_1.UserInstance.findOne({
            where: { id: id },
        }));
        if (Admin) {
            const Vendor = (await vendorModel_1.VendorInstance.findOne({
                where: { id: vendorid },
            }));
            const unsuspendedVendor = (await vendorModel_1.VendorInstance.update({ suspended: false }, { where: { id: Vendor.id } }));
            return res.status(200).json({
                message: "vendor unsuspended",
                unsuspendedVendor,
            });
        }
        return res.status(500).json({
            message: "Unauthorised",
        });
    }
    catch (error) {
        return res.status(500).json({
            Error: "internal Serer Error",
            route: "/admin/unsuspend-vendor",
        });
    }
};
exports.unsuspendVendor = unsuspendVendor;
