import { propertyAttributes } from '../model/propertyModel';
import { Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { VendorAttributes, VendorInstance } from "../model/vendorModel";
import {
  GenerateSignature,
  loginSchema,
  option,
  validatePassword, vendorSchema
} from "../utils";
import { propertyInstance } from "../model/propertyModel";
import { v4 as uuidv4 } from "uuid";
import { GenerateSalt, GeneratePassword } from '../utils';

/** ================= Vendor Login ===================== **/

export const registerVendor = async (req: JwtPayload, res: Response) => {
  try {

    const { name, ownerName, pincode, phone, address, email, password } =
      req.body;
    const uuidvendor = uuidv4();
    const validateResult = vendorSchema.validate(req.body, option);
    if (validateResult.error) {
      return res.status(400).json({
        Error: validateResult.error.details[0].message,
      });
    }

    // Generate salt
    const salt = await GenerateSalt();
    const vendorPassword = await GeneratePassword(password, salt);

    // check if the vendor exist
    const Vendor = (await VendorInstance.findOne({
      where: { email: email },
    })) as unknown as VendorAttributes;

    
      if (!Vendor) {
        const createVendor = await VendorInstance.create({
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
    
  } catch (err) {
    res.status(500).json({
      Error: "Internal server Error",
      route: "/admins/create-vendors",
    });
  }

}


export const vendorLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const validateResult = loginSchema.validate(req.body, option);
    if (validateResult.error) {
      return res.status(400).json({
        Error: validateResult.error.details[0].message,
      });
    }

    // check if the vendor exist
    const Vendor = (await VendorInstance.findOne({
      where: { email: email },
    })) as unknown as VendorAttributes;

    if (Vendor) {
      const validation = await validatePassword(
        password,
        Vendor.password,
        Vendor.salt
      );
      console.log(validation)
      if (validation) {
        //Generate signature for vendor
        let signature = await GenerateSignature({
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
  } catch (err) {
    res.status(500).json({
      Error: "Internal server Error",
      route: "/vendors/login",
    });
  }
};

/** ================= Vendor Add Food ===================== **/

export const createProperty = async (req: JwtPayload, res: Response) => {
  try {
    const id = req.vendor.id;
    const { name, description, category, propertyType, readyTime, price } =
      req.body;

    // check if the vendor exist
    const Vendor = (await VendorInstance.findOne({
      where: { id: id },
    })) as unknown as VendorAttributes;
    const foodid = uuidv4();
    if (Vendor) {
      const createfood = await propertyInstance.create({
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
  } catch (err) {
    res.status(500).json({
      Error: "Internal server Error",
      route: "/vendors/create-food",
    });
  }
};

/** ================= Get Vendor Profile ===================== **/

export const vendorProfile = async (req: JwtPayload, res: Response) => {
try {
    const id = req.vendor.id;

    const Vendor = (await VendorInstance.findOne({
        where: { id: id },
        // attributes: [""],
        include: [
            {
                model: propertyInstance,
                as: "food",
                attributes: ["id", "name", "description", "category", "foodType", "readyTime", "price", "rating", "vendorId"]
            }
        ]
      })) as unknown as VendorAttributes;
      return res.status(200).json({
        Vendor
      })
} catch(err) {
    res.status(500).json({
        Error: "Internal server Error",
        route: "/vendor/get-profile",
      });
}
}


/** ================= Vendor Delete Food ===================== **/

export const deleteProperty = async(req: JwtPayload, res: Response) => {
    try {
        const id = req.vendor.id;

        const propertyid = req.params.propertyid

        //check if the vendor exist
        const Vendor = (await VendorInstance.findOne({
            where: { id: id },
          })) as unknown as VendorAttributes;

          if(Vendor) {

            const deletedProperty = (await propertyInstance.destroy({
                where: {id: propertyid},
            }))  as unknown as propertyAttributes

            return res.status(200).json({
                message: 'food successfully deleted',
                deletedProperty
            })
        }
    
    } catch(err) {
        res.status(500).json({
            Error: "Internal server Error",
            route: "/vendor/delete-food",
          }); 
    }};