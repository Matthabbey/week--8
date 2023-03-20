// import express, {Request, Response, NextFunction} from 'express';
import express, {Request, Response, NextFunction} from 'express';

// import logger from 'morgan';
// import cookieParser from 'cookie-parser'
// import userRouter from './routes/users';
// import indexRouter from './routes/index';
// import {db} from './config/index';
import logger from 'morgan';
import cookieParser from 'cookie-parser'
import userRouter from "./routes/users"
import indexRouter from "./routes/index"
import adminRouter from './routes/admin'
import vendorRouter from './routes/vendor'
import {db} from './config/index'

//sequelize connection
//killall node (to kill all servers running)


// db.sync().then(() => {
//     console.log('Database connected')
// }).catch((err) => { console.log(err)})
// db.sync({force:true}).then(() => {

db.sync().then(() => {
    console.log('database connected successfully')
}).catch(err => console.log(err))



// const dbconnect = async() => {
//     let data = await db.sync()
//     if(data) { console.log('Database connected') }
// }

// const app = express();
const app = express();

// app.use(express.json());
// app.use(logger('dev'));
// app.use(cookieParser());
app.use(express.json());
app.use(logger('dev'));
app.use(cookieParser());

// app.use('/users', userRouter);
// app.use('/', indexRouter);
app.use('/users', userRouter);
app.use('/admin', adminRouter);
app.use('/vendor', vendorRouter);
app.use('/', indexRouter);

// app.get('/about', (req:Request, res:Response) => {
// res.status(200).json({message: 'Successful'});
// });
app.get('/about', (req:Request, res:Response) => {
    res.status(200).json({message: 'successful'})
})


// const port = 4000
// app.listen(port, () => { console.log(`Server is running on http://localhost:${port}`)})

// export default app;

const port = 4020;
app.listen(port, () => {console.log(`Server is listening on http://localhost:${port}`)})

export default app;