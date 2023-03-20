import express from "express";
import { SuperAdminRegister,AdminRegister, getAllUsers, getAllVendors, getAllProperties, getSingleVendor, deleteVendor, deleteProperty, deleteUser, suspendVendor, suspendProperty, unsuspendVendor, } from "../controller/adminController";
import { auth } from "../middleware/authorization";


const router = express.Router();

//adminLogin = router.post('/users/login', Login)
router.post("/create-super-admin", SuperAdminRegister);
router.post("/create-admin", auth, AdminRegister);
// router.post("/create-vendor", auth, createVendor);
router.get("/get-all-users", auth, getAllUsers);
router.get("/get-all-vendors", auth, getAllVendors);
router.get("/get-all-Properties", auth, getAllProperties);
router.get("/get-single-vendor/:vendorId", auth, getSingleVendor);
router.delete("/delete-vendor/:vendorid", auth, deleteVendor)
router.delete("/delete-property/:propertyid", auth, deleteProperty)
router.delete("/delete-user/:userid", auth, deleteUser)
router.patch("/suspend-vendor/:vendorid", auth, suspendVendor)
router.patch("/suspend-property/:propertyid", auth, suspendProperty)
router.patch("/unsuspend-vendor/:vendorid", auth, unsuspendVendor)

export default router;