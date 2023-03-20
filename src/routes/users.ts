import express from 'express';
import {Register, verifyUser, Login, resendOTP, getAllUsers, getSingleUser, updateUserProfile} from '../controller/usersController';
import {auth} from '../middleware/authorization'
const router = express.Router();

router.post('/signup', Register);
// ":id" is a query parameter
router.post('/verify/:signature', verifyUser);
// create route for login

router.post('/login', Login);
router.get('/resend-otp/:signature', resendOTP);
router.get('/get-all-users', getAllUsers)
router.get('/get-user', auth, getSingleUser)
router.patch('/update-profile', auth, updateUserProfile)

export default router;