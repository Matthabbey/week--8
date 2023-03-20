"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authorization_1 = require("../middleware/authorization");
const vendorController_1 = require("../controller/vendorController");
const router = express_1.default.Router();
router.post('/register', vendorController_1.registerVendor);
router.post('/login', vendorController_1.vendorLogin);
router.post('/create-food', authorization_1.authVendor, vendorController_1.createProperty);
router.get('/get-profile', authorization_1.authVendor, vendorController_1.vendorProfile);
router.delete('/delete-property/:propertyid', authorization_1.authVendor, vendorController_1.deleteProperty);
exports.default = router;
