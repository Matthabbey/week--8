import express, {Request, Response} from 'express';
import {Register} from '../controller/usersController';

const router = express.Router();

router.get('/', (req:Request, res:Response) => {
    res.status(200).send(`welcome to omogod store`)
});


export default router;