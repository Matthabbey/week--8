import { JwtPayload } from 'jsonwebtoken';
import { validatePassword } from "./../utils/utility";
import { mailSent } from "./../utils/notifications";
import express, { Request, Response, NextFunction } from "express";
import {
  registerSchema,
  option,
  GenerateOTP,
  onRequestOTP,
  emailHtml,
  GenerateSignature,
  loginSchema,
  updateSchema
} from "../utils";
import {
  GenerateSalt,
  GeneratePassword,
  verifySignature,
} from "../utils/utility";
import { UserAttributes, UserInstance } from "../model/userModel";
import { v4 as uuidV4 } from "uuid";
import { fromAdminMail, userSubject } from "../config";
import SendmailTransport from "nodemailer/lib/sendmail-transport";

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

export const Register = async (req: Request, res: Response) => {
  try {
    const { email, phone, password, confirm_password } = req.body;
    const uuiduser = uuidV4();

    const validateResult = registerSchema.validate(req.body, option);

    if (validateResult.error) {
      return res
        .status(400)
        .json({ Error: validateResult.error.details[0].message });
    }

    const salt = await GenerateSalt();
    const userPassword = await GeneratePassword(password, salt);
    console.log(userPassword);

    //Generate OTP
    const { otp, expiry } = GenerateOTP();
    console.log(otp, expiry);

    //check if user already exists using key value pairs in the object
    const User = await UserInstance.findOne({ where: { email: email } });

    //Create User
    if (!User) {
      let user = await UserInstance.create({
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
      await onRequestOTP(otp, phone);

      //send email to user
      const html = emailHtml(otp);

      await mailSent(fromAdminMail, email, userSubject, html);

      //check if user already exists using key value pairs in the object
      const User = (await UserInstance.findOne({
        where: { email: email },
      })) as unknown as UserAttributes;

      let signature = await GenerateSignature({
        id: User.id,
        email: User.email,
        verified: User.verified,
      });

      return res.status(201).json({
        message:
          "User created successfully, check your email or phone for OTP verification",
         signature,
        verified: User.verified,
      });
    }

    //User already exists
    return res.status(400).json({ Error: "User already exists" });
  } catch (err) {
    res.status(500)
      .json({ Error: "internal server error", route: "/users/signup" });
  }
};

/** ================verify users ============== */

export const verifyUser = async (req: Request, res: Response) => {
  try {
    const token = req.params.signature;
    const decode = verifySignature(token);

    // check if user exists/is registered

    const User = (await UserInstance.findOne({
      where: { email: decode.email },
    })) as unknown as UserAttributes;

    if (User) {
      const { otp } = req.body;
      if (parseInt(otp) === User.otp && User.otp_expiry >= new Date()) {
        const updatedUser = (await UserInstance.update(
          { verified: true },
          { where: { email: decode.email } }
        )) as unknown as UserAttributes;

        //generate signature again for user
        let signature = await GenerateSignature({
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
  } catch (err) {
    res
      .status(500)
      .json({ Error: "internal server error", route: "/users/verify" });
  }
};

/** ================login users ============== */

export const Login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const validateResult = loginSchema.validate(req.body, option);
    if (validateResult.error) {
      return res.status(400).json({
        Error: validateResult.error.details[0].message,
      });
    }

    const User = (await UserInstance.findOne({
      where: { email: email },
    })) as unknown as UserAttributes;

    if (User.verified === true) {
      const validation = await validatePassword(
        password,
        User.password,
        User.salt
      );

      if (validation) {
        let signature = await GenerateSignature({
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
  } catch (err) {
    res
      .status(500)
      .json({ Error: "internal server error", route: "/users/login" });
  }
};


/** ================ resend OTP ============== */

export const resendOTP = async (req: Request, res: Response) => {
  try {
    const token = req.params.signature;
    const decode = verifySignature(token);

    // check if user exists/is registered
    const User = (await UserInstance.findOne({
      where: { email: decode.email },
    })) as unknown as UserAttributes;

if(User) {
  //generate OTP
  const {otp, expiry} = GenerateOTP();
  const updatedUser = await UserInstance.update(
    {
      otp,
      otp_expiry: expiry
    }, {where: { email:decode.email}}
  ) as unknown as UserAttributes

  if(updatedUser) {
    
        const User = (await UserInstance.findOne({
          where: { email: decode.email },
        })) as unknown as UserAttributes;

    // await onRequestOTP(otp, User.phone)

  

  const html = emailHtml(otp);
  await mailSent(fromAdminMail, updatedUser.email, userSubject, html);

  return res.status(200).json({
    message: "OTP resent to resgistered phone and email"
  })
}

}
return res.status(400).json({ Error: "error sending OTP" });
  

  } catch (err) {
    res
      .status(500)
      .json({ Error: "internal server error", route: "/users/resend-otp" });
  }
};



/** ================ User Profile ================== */

export const getAllUsers =  async (req:Request, res:Response) => {
  try {
    // const users = await UserInstance.findAll({})
    //limit numbers of users showing/pagiantion
    const limit = req.query.limit as number | undefined
    const users = await UserInstance.findAndCountAll({
      //limit numbers of users showing/pagiantion
      limit:limit
    })
    return  res.status(200).json({
     message: "you have succesfully retireved all users", count: users.count, Users: users.rows
    })
  } catch(err) {
      return res.status(500).json({
        Error: "internal server error",
        Route: "/users/get-all-users"
      })
  }
};


export const getSingleUser = async (req: JwtPayload, res: Response) => {
  try {
const {id} = req.user

//find user by id
const user = await UserInstance.findOne({
 where: { id : id }
}) as unknown as UserAttributes

if(user) {
 return res.status(200).json({
  user
})
} 

return res.status(400).json({
  Message: "User not found"
})
 
}catch (err) {
 return res.status(500).json({
        Error: "internal server error",
        Route: "/users/get-user"
      })
  }
};


export const updateUserProfile = async (
  req: JwtPayload | any,
  res: Response
) => {
  try {
    const {id} = req.user
    const { firstName, lastName, address, phone } = req.body;
    const validateResult = updateSchema.validate(req.body, option);
    if (validateResult.error) {
      return res.status(400).json({
        Error: validateResult.error.details[0].message,
      });
    }
    //check if its a reg user
    const User = (await UserInstance.findOne({
      where: { id: id },
    })) as unknown as UserAttributes;
    if (!User) {
      return res.status(400).json({
        Error: "you are not authorised to update your profile",
      });
    }
    const updatedUser = (await UserInstance.update(
      {
        firstName,
        lastName,
        address,
        phone,
      },
      { where: { id: id } }
    )) as unknown as UserAttributes;
    
    if (updatedUser) {
      const User = (await UserInstance.findOne({
        where: { id: id },
      })) as unknown as UserAttributes;
      return res.status(200).json({
        message: "u have succesfully updated your profile",
        User,
      });
    }
    return res.status(500).json({
      message: "Error Occured",
    });
  } catch (error) {
    return res.status(500).json({
      Error: "internal Serer Error",
      route: "/users/update-profile",
    });
  }
};