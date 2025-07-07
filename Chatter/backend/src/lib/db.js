import mongoose from "mongoose";

//Connecting to Database MongoDB
export const connectDB = async ( )=> {
    try{
        const conn = await mongoose.connect(process.env.MONGO_URI); //Connect to DB with .env variable MONGO_URI
        console.log(`MongoDB Connected: ${conn.connection.host}`);


    } catch (error){
        console.log("Error in connecting to MongoDB", error);
        process.exit(1); 

    }
}