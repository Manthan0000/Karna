import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors" ;

const app = express()

app.use(cors())

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded())
app.use(express.static("public")) // for storing assets in public folder
app.use(cookieParser())


// Routes Import
import userRouter from "./routes/user.routes.js"

//Routes Declaration
app.use("/api/v1/user", userRouter) // when clicked the http://localhost:8000/api/v1/user/(then the control woud be given to user routes)


export { app }