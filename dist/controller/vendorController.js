"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProperty = exports.vendorProfile = exports.createProperty = exports.vendorLogin = exports.registerVendor = void 0;
const vendorModel_1 = require("../model/vendorModel");
const utils_1 = require("../utils");
const propertyModel_1 = require("../model/propertyModel");
const uuid_1 = require("uuid");
const utils_2 = require("../utils");
/** ================= Vendor Login ===================== **/
const registerVendor = async (req, res) => {
    try {
        const { name, ownerName, pincode, phone, address, email, password } = req.body;
        const uuidvendor = (0, uuid_1.v4)();
        const validateResult = utils_1.vendorSchema.validate(req.body, utils_1.option);
        if (validateResult.error) {
            return res.status(400).json({
                Error: validateResult.error.details[0].message,
            });
        }
        // Generate salt
        const salt = await (0, utils_2.GenerateSalt)();
        const vendorPassword = await (0, utils_2.GeneratePassword)(password, salt);
        // check if the vendor exist
        const Vendor = (await vendorModel_1.VendorInstance.findOne({
            where: { email: email },
        }));
        if (!Vendor) {
            const createVendor = await vendorModel_1.VendorInstance.create({
                id: uuidvendor,
                name,
                ownerName,
                pincode,
                phone,
                address,
                email,
                password: vendorPassword,
                salt,
                role: "vendor",
                serviceAvailable: false,
                rating: 0,
                suspended: false
            });
            return res.status(201).json({
                message: "Vendor created successfully",
                createVendor,
            });
        }
        return res.status(400).json({
            message: "Vendor already exist",
        });
    }
    catch (err) {
        res.status(500).json({
            Error: "Internal server Error",
            route: "/admins/create-vendors",
        });
    }
};
exports.registerVendor = registerVendor;
const vendorLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const validateResult = utils_1.loginSchema.validate(req.body, utils_1.option);
        if (validateResult.error) {
            return res.status(400).json({
                Error: validateResult.error.details[0].message,
            });
        }
        // check if the vendor exist
        const Vendor = (await vendorModel_1.VendorInstance.findOne({
            where: { email: email },
        }));
        if (Vendor) {
            const validation = await (0, utils_1.validatePassword)(password, Vendor.password, Vendor.salt);
            console.log(validation);
            if (validation) {
                //Generate signature for vendor
                let signature = await (0, utils_1.GenerateSignature)({
                    id: Vendor.id,
                    email: Vendor.email,
                    serviceAvailable: Vendor.serviceAvailable,
                });
                return res.status(200).json({
                    message: "You have successfully logged in",
                    signature,
                    email: Vendor.email,
                    serviceAvailable: Vendor.serviceAvailable,
                    role: Vendor.role,
                });
            }
        }
        return res.status(400).json({
            Error: "Wrong Username or password or not a verified vendor ",
        });
    }
    catch (err) {
        res.status(500).json({
            Error: "Internal server Error",
            route: "/vendors/login",
        });
    }
};
exports.vendorLogin = vendorLogin;
/** ================= Vendor Add Food ===================== **/
const createProperty = async (req, res) => {
    try {
        const id = req.vendor.id;
        const { name, description, category, propertyType, readyTime, price } = req.body;
        // check if the vendor exist
        const Vendor = (await vendorModel_1.VendorInstance.findOne({
            where: { id: id },
        }));
        const foodid = (0, uuid_1.v4)();
        if (Vendor) {
            const createfood = await propertyModel_1.propertyInstance.create({
                id: foodid,
                name,
                description,
                category,
                propertyType,
                readyTime,
                price,
                rating: 0,
                vendorId: id,
                suspended: false
            });
            return res.status(201).json({
                message: "Food added successfully",
                createfood,
            });
        }
    }
    catch (err) {
        res.status(500).json({
            Error: "Internal server Error",
            route: "/vendors/create-food",
        });
    }
};
exports.createProperty = createProperty;
/** ================= Get Vendor Profile ===================== **/
const vendorProfile = async (req, res) => {
    try {
        const id = req.vendor.id;
        const Vendor = (await vendorModel_1.VendorInstance.findOne({
            where: { id: id },
            // attributes: [""],
            include: [
                {
                    model: propertyModel_1.propertyInstance,
                    as: "food",
                    attributes: ["id", "name", "description", "category", "foodType", "readyTime", "price", "rating", "vendorId"]
                }
            ]
        }));
        return res.status(200).json({
            Vendor
        });
    }
    catch (err) {
        res.status(500).json({
            Error: "Internal server Error",
            route: "/vendor/get-profile",
        });
    }
};
exports.vendorProfile = vendorProfile;
/** ================= Vendor Delete Food ===================== **/
const deleteProperty = async (req, res) => {
    try {
        const id = req.vendor.id;
        const propertyid = req.params.propertyid;
        //check if the vendor exist
        const Vendor = (await vendorModel_1.VendorInstance.findOne({
            where: { id: id },
        }));
        if (Vendor) {
            const deletedProperty = (await propertyModel_1.propertyInstance.destroy({
                where: { id: propertyid },
            }));
            return res.status(200).json({
                message: 'food successfully deleted',
                deletedProperty
            });
        }
    }
    catch (err) {
        res.status(500).json({
            Error: "Internal server Error",
            route: "/vendor/delete-food",
        });
    }
};
exports.deleteProperty = deleteProperty;
