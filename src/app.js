import express, { urlencoded } from 'express'
import cors from 'cors'
import cokkieParser from 'cookie-parser'
import testRouter from './routes/test.routes.js'
import userRouter from './routes/user.routes.js'
const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))
app.use(cokkieParser());


app.use('/', testRouter);
app.use('/users', userRouter);



export { app };