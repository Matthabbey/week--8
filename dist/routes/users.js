"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const usersController_1 = require("../controller/usersController");
const authorization_1 = require("../middleware/authorization");
const router = express_1.default.Router();
router.post('/signup', usersController_1.Register);
// ":id" is a query parameter
router.post('/verify/:signature', usersController_1.verifyUser);
// create route for login
router.post('/login', usersController_1.Login);
router.get('/resend-otp/:signature', usersController_1.resendOTP);
router.get('/get-all-users', usersController_1.getAllUsers);
router.get('/get-user', authorization_1.auth, usersController_1.getSingleUser);
router.patch('/update-profile', authorization_1.auth, usersController_1.updateUserProfile);
exports.default = router;
