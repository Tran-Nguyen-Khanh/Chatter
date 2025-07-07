import express from "express"; //Server (backend) express
import dotenv from "dotenv"; //For loading variables from .env
import authRoutes from "./routes/auth.route.js"; //Routes in auth.route.js file
import { connectDB } from "./lib/db.js";

//loads .env
dotenv.config();

//Creats express application (server)
const app = express();
const PORT = process.env.PORT;

//converts json into js objects and attaches to req.body
app.use(express.json());

//For any request starting with /api/auth, delegate handling to the authRoutes router.
app.use("/api/auth", authRoutes);

//Starts express server and listens to PORT
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectDB(); //Connect to Database
});