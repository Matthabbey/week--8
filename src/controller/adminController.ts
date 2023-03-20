import { Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

import {
  adminSchema,
  GenerateOTP,
  GeneratePassword,
  GenerateSalt,
  GenerateSignature,
  vendorSchema,
  option,
} from "../utils";

import { UserAttributes, UserInstance } from "../model/userModel";
import { v4 as uuidv4 } from "uuid";
import { fromAdminMail, superAdmin1, userSubject } from "../config";
import { VendorAttributes, VendorInstance } from "../model/vendorModel";
import { propertyAttributes, propertyInstance } from "../model/propertyModel";

/**==============SUPER ADMIN REGISTRATION=============== */

export const SuperAdminRegister = async (req: JwtPayload, res: Response) => {
  try {
    const { email, phone, password, firstName, lastName, address } = req.body;
    //to create user Id from uuid
    const uuiduser = uuidv4();
    const validateResult = adminSchema.validate(req.body, option);
    if (validateResult.error) {
      return res.status(400).json({
        Error: validateResult.error.details[0].message,
      });
    }
    //generate salt
    const salt = await GenerateSalt();
    //encrypt password
    const userPassword = await GeneratePassword(password, salt);
    //Generte OTP
    const { otp, expiry } = GenerateOTP();
    //check if the admin exist
    const Admin = (await UserInstance.findOne({
      where: { email: email },
    })) as unknown as UserAttributes;
    //create admin if not existing
    if (!Admin) {
      //.role  === "superadmin")
      //to create admin u must add all the model properties
      await UserInstance.create({
        id: uuiduser, // user id created from uuidv4
        email,
        password: userPassword, //we set the password to user password that has been hashed
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
      const Admin = (await UserInstance.findOne({
        where: { email: email },
      })) as unknown as UserAttributes; //attributes comes from the User attribute
      //generate signature
      const signature = await GenerateSignature({
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
  } catch (error) {
    res.status(500).json({
      Error: "Internal Server Error",
      route: "/admin/create-superadmin",
    });
  }
};

/**=============ADMIN REGISTER ===================== */

export const AdminRegister = async (req: JwtPayload, res: Response) => {
  try {
    // const id = req.user.id
    const { email, phone, password, firstName, lastName, address } = req.body;
    //to create user Id from uuid
    const uuiduser = uuidv4();
    const validateResult = adminSchema.validate(req.body, option);
    if (validateResult.error) {
      return res.status(400).json({
        Error: validateResult.error.details[0].message,
      });
    }
    //generate salt
    const salt = await GenerateSalt();
    //encrypt password
    const userPassword = await GeneratePassword(password, salt);
    //Generte OTP
    const { otp, expiry } = GenerateOTP();
    //check if the admin exist
    const Admin = (await UserInstance.findOne({
      where: { email: email },
    })) as unknown as UserAttributes;
    //create admin if not existing

    if (!Admin) {
      const superadmin = (await UserInstance.findOne({
        where: { email: superAdmin1 },
      })) as unknown as UserAttributes;

      if (superadmin.role === "superadmin") {
        //.role  === "superadmin")
        //to create admin u must add all the model properties
        await UserInstance.create({
          id: uuiduser, // user id created from uuidv4
          email,
          password: userPassword, //we set the password to user password that has been hashed
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
        const Admin = (await UserInstance.findOne({
          where: { email: email },
        })) as unknown as UserAttributes; //attributes comes from the User attribute
        //generate signature
        const signature = await GenerateSignature({
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
  } catch (error) {
    res.status(500).json({
      Error: "Internal Server Error",
      route: "/admin/signup",
    });
  }
};

/**============= GET ALL ===================== */

export const getAllUsers = async (req: JwtPayload, res: Response) => {
  try {
    const { id } = req.user;
    //find user by id

    const admin = (await UserInstance.findOne({
      where: { id: id },
    })) as unknown as UserAttributes;

    if (admin) {
      const limit = req.query.limit as number | undefined;
      const users = await UserInstance.findAndCountAll({
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
  } catch (err) {
    return res.status(500).json({
      Error: "internal server error",
      Route: "/admin/get-all-users",
    });
  }
};

export const getAllVendors = async (req: JwtPayload, res: Response) => {
  try {
    const { id } = req.user;

    const admin = (await UserInstance.findOne({
      where: { id: id },
    })) as unknown as UserAttributes;

    if (admin) {
      const limit = req.query.limit as number | undefined;
      const vendors = await VendorInstance.findAndCountAll({
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
  } catch (err) {
    return res.status(500).json({
      Error: "internal server error",
      Route: "/admin/get-all-vendors",
    });
  }
};

export const getAllProperties = async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit as number | undefined;
    const property = await propertyInstance.findAndCountAll({
      limit: limit,
    });
    return res.status(200).json({
      message: "you have succesfully retireved all vendors",
      count: property.count,
      Vendors: property.rows,
    });
  } catch (err) {
    return res.status(500).json({
      Error: "internal server error",
      Route: "/admin/get-all-vendors",
    });
  }
};

export const getSingleVendor = async (req: JwtPayload, res: Response) => {
  try {
    const { id } = req.user;
    const vendorId = req.params.vendorId;
    //find user by id
    const admin = (await UserInstance.findOne({
      where: { id: id },
    })) as unknown as UserAttributes;

    if (admin) {
      const Vendor = (await VendorInstance.findOne({
        where: { id: vendorId },
      })) as unknown as VendorAttributes;

      return res.status(200).json({
        Vendor,
      });
    }

    return res.status(400).json({
      Message: "not authorised",
    });
  } catch (err) {
    return res.status(500).json({
      Error: "internal server error",
      Route: "/admin/get-vendor",
    });
  }
};

export const deleteVendor = async (req: JwtPayload, res: Response) => {
  try {
    const id = req.user.id;

    const vendorid = req.params.vendorid;

    //check if the vendor exist
    const admin = (await UserInstance.findOne({
      where: { id: id },
    })) as unknown as UserAttributes;

    if (admin) {
      const deletedVendor = (await VendorInstance.destroy({
        where: { id: vendorid },
      })) as unknown as VendorAttributes;

      return res.status(200).json({
        message: "vendor successfully deleted",
        deletedVendor,
      });
    }
  } catch (err) {
    res.status(500).json({
      Error: "Internal server Error",
      route: "/admin/delete-vendor",
    });
  }
};

export const deleteProperty = async (req: JwtPayload, res: Response) => {
  try {
    const id = req.user.id;

    const propertyid = req.params.propertyid;

    const admin = (await UserInstance.findOne({
      where: { id: id },
    })) as unknown as UserAttributes;

    if (admin) {
      const deletedProperty = (await propertyInstance.destroy({
        where: { id: propertyid },
      })) as unknown as propertyAttributes;

      return res.status(200).json({
        message: "vendor successfully deleted",
        deletedProperty,
      });
    }
  } catch (err) {
    res.status(500).json({
      Error: "Internal server Error",
      route: "/admin/delete-property",
    });
  }
};

export const deleteUser = async (req: JwtPayload, res: Response) => {
  try {
    const id = req.user.id;

    const userid = req.params.userid;

    const admin = (await UserInstance.findOne({
      where: { id: id },
    })) as unknown as UserAttributes;

    if (admin) {
      const deletedProperty = (await UserInstance.destroy({
        where: { id: userid },
      })) as unknown as UserAttributes;

      return res.status(200).json({
        message: "User successfully deleted",
        deletedProperty,
      });
    }
  } catch (err) {
    res.status(500).json({
      Error: "Internal server Error",
      route: "/admin/delete-property",
    });
  }
};




export const suspendVendor = async (req: JwtPayload | any, res: Response) => {
  try {
    const { id } = req.user;
    const vendorid = req.params.vendorid;

    const Admin = (await UserInstance.findOne({
      where: { id: id },
    })) as unknown as UserAttributes;

    if (Admin) {
      const Vendor = (await VendorInstance.findOne({
        where: { id: vendorid },
      })) as unknown as VendorAttributes;

      const suspendedVendor = (await VendorInstance.update(
        { suspended: true },
        { where: { id: Vendor.id } }
      )) as unknown as VendorAttributes;

      if (suspendedVendor){
        await propertyInstance.update({
          isSuspended: true
        },{where:{vendorId : vendorid}})
      }
      return res.status(200).json({
        message: "vendor suspended",
        suspendedVendor,
      });
    }

    return res.status(500).json({
      message: "Unauthorised to carry out this operation",
    });
  } catch (error) {
    return res.status(500).json({
      Error: "internal Serer Error",
      route: "/admin/suspend-vendor",
    });
  }
};




export const suspendProperty = async (req: JwtPayload | any, res: Response) => {
  try {
    const { id } = req.user;
    const propertyid = req.params.propertyid;

    const Admin = (await UserInstance.findOne({
      where: { id: id },
    })) as unknown as UserAttributes;
    if (Admin) {
      const property = (await propertyInstance.findOne({
        where: { id: propertyid },
      })) as unknown as propertyAttributes;

      const suspendedproperty = (await propertyInstance.update(
        { isSuspended: true },
        { where: { id: property.id } }
      )) as unknown as UserAttributes;
      return res.status(200).json({
        message: "vendor isSuspended",
        suspendedproperty,
      });
    }

    return res.status(500).json({
      message: "Unauthorised",
    });
  } catch (error) {
    return res.status(500).json({
      Error: "internal Serer Error",
      route: "/admin/suspend-vendor",
    });
  }
};


export const unsuspendVendor = async (req: JwtPayload | any, res: Response) => {
  try {
    const { id } = req.user;
    const vendorid = req.params.vendorid;

    const Admin = (await UserInstance.findOne({
      where: { id: id },
    })) as unknown as UserAttributes;

    if (Admin) {

      const Vendor = (await VendorInstance.findOne({
        where: { id: vendorid },
      })) as unknown as VendorAttributes;

      const unsuspendedVendor = (await VendorInstance.update(
        { suspended: false },
        { where: { id: Vendor.id } }
      )) as unknown as VendorAttributes;
      return res.status(200).json({
        message: "vendor unsuspended",
        unsuspendedVendor,
      });
    }

    return res.status(500).json({
      message: "Unauthorised",
    });
  } catch (error) {
    return res.status(500).json({
      Error: "internal Serer Error",
      route: "/admin/unsuspend-vendor",
    });
  }
};