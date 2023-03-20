"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// import express, {Request, Response, NextFunction} from 'express';
const express_1 = __importDefault(require("express"));
// import logger from 'morgan';
// import cookieParser from 'cookie-parser'
// import userRouter from './routes/users';
// import indexRouter from './routes/index';
// import {db} from './config/index';
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const users_1 = __importDefault(require("./routes/users"));
const index_1 = __importDefault(require("./routes/index"));
const admin_1 = __importDefault(require("./routes/admin"));
const vendor_1 = __importDefault(require("./routes/vendor"));
const index_2 = require("./config/index");
//sequelize connection
//killall node (to kill all servers running)
// db.sync().then(() => {
//     console.log('Database connected')
// }).catch((err) => { console.log(err)})
// db.sync({force:true}).then(() => {
index_2.db.sync().then(() => {
    console.log('database connected successfully');
}).catch(err => console.log(err));
// const dbconnect = async() => {
//     let data = await db.sync()
//     if(data) { console.log('Database connected') }
// }
// const app = express();
const app = (0, express_1.default)();
// app.use(express.json());
// app.use(logger('dev'));
// app.use(cookieParser());
app.use(express_1.default.json());
app.use((0, morgan_1.default)('dev'));
app.use((0, cookie_parser_1.default)());
// app.use('/users', userRouter);
// app.use('/', indexRouter);
app.use('/users', users_1.default);
app.use('/admin', admin_1.default);
app.use('/vendor', vendor_1.default);
app.use('/', index_1.default);
// app.get('/about', (req:Request, res:Response) => {
// res.status(200).json({message: 'Successful'});
// });
app.get('/about', (req, res) => {
    res.status(200).json({ message: 'successful' });
});
// const port = 4000
// app.listen(port, () => { console.log(`Server is running on http://localhost:${port}`)})
// export default app;
const port = 4020;
app.listen(port, () => { console.log(`Server is listening on http://localhost:${port}`); });
exports.default = app;
