import dotenv from 'dotenv'
import { app } from './app.js';
import connectDB from './db/index.js';

dotenv.config({
    path: './env'
})

const port = process.env.PORT || 8080;

connectDB()
    .then(() => {
        app.listen(port, () => {
            console.log(`Server started on port : ${port}`)
        })
    })
    .catch((err) => {
        console.log("MONGO DB connection failed !!! ", err)
    })
