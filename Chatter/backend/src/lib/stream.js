import {StreamChat} from "stream-chat"; //Is neccessaryfor real time messages and videcalling (api)
import "dotenv/config";

const apiKey = process.env.STEAM_API_KEY;
const apiSECRET = process.env.STEAM_API_SECRET;

if(!apiKey || !apiSECRET){
    console.error("Stream API key or Secret is missing");
}

const streamClient = StreamChat.getInstance(apiKey, apiSECRET); //Connect to stream.io instance

export const upsertStreamUser = async(userData) =>{
    try{
        await streamClient.upsertUser(userData);
        return userData;
    } catch(error){
        console.error("Error upserting Stream user:", error);
    }
}

//Do it later
export const generateStreamToken = (userId) =>{};