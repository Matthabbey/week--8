"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const adminController_1 = require("../controller/adminController");
const authorization_1 = require("../middleware/authorization");
const router = express_1.default.Router();
//adminLogin = router.post('/users/login', Login)
router.post("/create-super-admin", adminController_1.SuperAdminRegister);
router.post("/create-admin", authorization_1.auth, adminController_1.AdminRegister);
// router.post("/create-vendor", auth, createVendor);
router.get("/get-all-users", authorization_1.auth, adminController_1.getAllUsers);
router.get("/get-all-vendors", authorization_1.auth, adminController_1.getAllVendors);
router.get("/get-all-Properties", authorization_1.auth, adminController_1.getAllProperties);
router.get("/get-single-vendor/:vendorId", authorization_1.auth, adminController_1.getSingleVendor);
router.delete("/delete-vendor/:vendorid", authorization_1.auth, adminController_1.deleteVendor);
router.delete("/delete-property/:propertyid", authorization_1.auth, adminController_1.deleteProperty);
router.delete("/delete-user/:userid", authorization_1.auth, adminController_1.deleteUser);
router.patch("/suspend-vendor/:vendorid", authorization_1.auth, adminController_1.suspendVendor);
router.patch("/suspend-property/:propertyid", authorization_1.auth, adminController_1.suspendProperty);
router.patch("/unsuspend-vendor/:vendorid", authorization_1.auth, adminController_1.unsuspendVendor);
exports.default = router;
