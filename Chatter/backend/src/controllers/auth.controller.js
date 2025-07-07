import { upsertStreamUser } from "../lib/stream.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

export async function signup(req, res) {
    //get data from body
    const {email, password, fullName}=req.body;

    try{
        if(!email || !password || !fullName){//if one of these are missing
            return res.status(400).json({message: "All fields are required"});
        }

        if(password.length < 6){
            return res.status(400).json({message: "Password must be at least 6 characters"});
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)){
            return res.status(400).json({message: "Invalid email format"});
        }

        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({message: "Email already exists."});
        }

        //create random profile image
        const idx = Math.floor(Math.random() * 100) + 1; //generate random number between 1-100
        const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;

        const newUser = await User.create({
            email, 
            fullName,
            password,
            profilePic: randomAvatar,
        });

        //Upsert Stream for videocall and chat function
        try{
            await upsertStreamUser({
                id:newUser._id.toString(),
                name:newUser.fullName,
                image:newUser.profilePic || "",
            });

            console.log(`Stream user created for ${newUser.fullName}`)

        } catch(error){
            console.log("Error creating Stream user:", error);
        }
        

        //create token
        const token = jwt.sign({userId:newUser._id}, process.env.JWT_SECRET_KEY, {expiresIn: "7d"});

        //setup cookie
        res.cookie("jwt", token, {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true, //prevent XSS attacks
            sameSite: "strict", // prevent CSRF attacks
            secure: process.env.NODE_ENV === "production"
        })

        //send respond back to User
        res.status(201).json({success:true, user:newUser});

    } catch(error){
        console.log("Error in signup controller", error);
        return res.status(500).json({message: "Internal Server Error"});
    }

};

export async function login(req, res) {
    try{
        const {email, password } = req.body;
        if(!email || !password){//if one of these are missing
            return res.status(400).json({message: "All fields are required"});
        }

        //Check Email
        const user = await User.findOne({email});
        if(!user) return res.status(401).json({message: "Invalid email or password"});

        //Check Password
        const isPasswordCorrect = await user.matchPassword(password);
        if(!isPasswordCorrect) return res.status(401).json({message: "Invalid email or password"});

        //create token
        const token = jwt.sign({userId:user._id}, process.env.JWT_SECRET_KEY, {expiresIn: "7d"});

        //setup cookie
        res.cookie("jwt", token, {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true, //prevent XSS attacks
            sameSite: "strict", // prevent CSRF attacks
            secure: process.env.NODE_ENV === "production"
        })

        //send respond back to User
        res.status(200).json({success:true, user});

    } catch(error){
        console.log("Error in login controller", error);
        return res.status(500).json({message: "Internal Server Error"});
    }
};

//Logout by just clearing the cookie
export function logout(req, res) {
    res.clearCookie("jwt");
    res.status(200).json({success: true, message: "Logout successful"});
};