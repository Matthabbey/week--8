
import Joi, { string } from 'joi';
import bcrypt from 'bcrypt';
import { AuthPayload } from '../interface';
import jwt, {JwtPayload} from 'jsonwebtoken';
import { APP_SECRET } from '../config';


export const registerSchema = Joi.object().keys({
email : Joi.string().email().required(),
phone: Joi.string().required(),
password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).required(),
confirm_password: Joi.any().equal(Joi.ref('password')).required()
.label('confirm password').messages({'any.only': '{{#label}} does not match'})
})



export const vendorSchema = Joi.object().keys({
  email: Joi.string().required(),
  phone: Joi.string().required(),
  password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")),
   name: Joi.string().required(),
   ownerName: Joi.string().required(),
   address: Joi.string().required(),
   pincode: Joi.string().required(),
  
});

    export const option = {
        abortEarly: true,
        errors: {
            wrap: {
                label: ''
            }
        }
    };

    export const adminSchema = Joi.object().keys({
        email: Joi.string().required(),
        phone: Joi.string().required(),
        password: Joi.string().regex(/[a-zA-Z0-9]{3,30}/),
        //.pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        address: Joi.string().required(),
    })
    
    export const updateSchema = Joi.object().keys({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        phone: Joi.string().required(),
        address: Joi.string().required(),
    })


    
    //generate salt and hash password with bcrypt
//generate salt 

// export const GenerateSalt = async() => {
//     return await bcrypt.genSalt()
// }

export const GenerateSalt = async () => {
    return await bcrypt.genSalt();
}

//hash password with generated salt

// export const GeneratePassword = async(password:string, salt:string) => {
//     return await bcrypt.hash(password, salt)
// }

export const GeneratePassword = async (password:string, salt:string) => {
    return await bcrypt.hash(password, salt);
}

//generate a signature or token using a payload(user id, email, verified status) and a secret key
export const GenerateSignature = async (payload:AuthPayload) => {
    return jwt.sign(payload, APP_SECRET, {expiresIn: '5d'});
}

export const verifySignature = (signature:string) => {
    return jwt.verify(signature, APP_SECRET) as JwtPayload;
}

export const loginSchema = Joi.object().keys({
    email : Joi.string().email().required(),
    password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).required()
    });

export const validatePassword = async (enteredPassword:string, savedPassword:string,  salt:string) => {
    return await GeneratePassword(enteredPassword, salt) === savedPassword
}

