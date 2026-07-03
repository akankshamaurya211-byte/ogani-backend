import express from "express";
import cors  from "cors";
import mongoose from "mongoose";
import fs from "fs/promises";
import "dotenv/config";

mongoose.connect("mongodb://127.0.0.1:27017/ogani")
.then(()=>console.log("Connected to the ogani database successfully!"))
.catch((error)=>console.log(error))

const cartSchema = new mongoose.Schema({
    productId : String,
    userId : String,
    quantity : Number
});

const Cart = mongoose.model("cart", cartSchema);

const app = express();
app.use (express.json());
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}));

app.get("/cart", async(req , res)=>{
    try {
        const {productId} = req.params;
        const ogani = mongoose.connection.db;
        const item = await ogani.collection("items").findOne({_id: new mongoose.Types.ObjectId(productId)})
        res.status(200).json({items});
        
    } catch (error) {
        
    }
})







