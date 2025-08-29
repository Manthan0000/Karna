// require('dotenv').config() // make all the environment variables to all the file
import 'dotenv/config'
import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";
import connectDB from "./db/index.js";
import {app} from './app.js'

connectDB()
.then(() => {
   app.listen(process.env.PORT || 8000, ()=>{
      console.log(`Server is listeing on Port: ${process.env.PORT}`)
   })
})
.catch((error) => {
   console.log("Monogo DB connection Failed !!!");
   
});


/*
// Approach 1 :-
import express from "express";
const app = express()
// Another way of defining function and executing it directly after
;(async () => {
   try {
      mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
      app.on("errror", () => {
         console.log("ERRR: ", error);
         throw error
      })

      app.listen(process.env.PORT, ()=> {
         console.log(`App is Listening on Port: `, 
         process.env.PORT);
      })
   } catch (error) {
      console.error("ERROR:", error)
      throw error
   }
})()

// Approach 2 is making and writning code in a more production grade and professional approach,
// writting the code by making Differnt files for DataBase and then importing it in Index
*/