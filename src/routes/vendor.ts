import express from "express";
import {authVendor} from '../middleware/authorization'
import {createProperty, vendorLogin, vendorProfile, deleteProperty, registerVendor} from "../controller/vendorController";

const router = express.Router();

router.post('/register', registerVendor)
router.post('/login', vendorLogin)
router.post('/create-food', authVendor, createProperty)
router.get('/get-profile', authVendor, vendorProfile)
router.delete('/delete-property/:propertyid', authVendor, deleteProperty)


export default router;