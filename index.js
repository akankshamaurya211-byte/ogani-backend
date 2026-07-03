import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import "dotenv/config";
import cookieParser from "cookie-parser";
import multer, { MulterError } from "multer";
import path from "path";
import { fileTypeFromFile , fileTypeFromBuffer} from "file-type";
import fs from "fs/promises";
import {v2 as cloudinary} from "cloudinary";
import streamifier from "streamifier";
import nodemailer from "nodemailer";
import { title } from "process";
import Razorpay from "razorpay";
import crypto from "crypto"

const app = express();
app.use(express.json())
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));
app.use(cookieParser());

app.use("/image", express.static(path.join(process.cwd(),"uploads")));

    try {
        mongoose.connect("mongodb://akankshamaurya211_db_user:YC1HQFmQAaLBSeSU@ac-qmoi2tz-shard-00-00.jdz2tab.mongodb.net:27017,ac-qmoi2tz-shard-00-01.jdz2tab.mongodb.net:27017,ac-qmoi2tz-shard-00-02.jdz2tab.mongodb.net:27017/ogani?ssl=true&replicaSet=atlas-12g60l-shard-0&authSource=admin&appName=Cluster0")
        console.log("connected!!");
        
    } catch (error) {
        console.log(error);
        
    }

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        minlength: [3, "Name must be contain at least 3 letters"]
    },
    email: {
        type: String,
        unique:true,
        required: [true, "Email is required"],
        validate: [(value) => {
            const pattern = /^[A-Za-z0-9._]+@[A-Za-z]+\.[a-zA-Z]{2,}$/
            return pattern.test(value);

        }, "Please provide a vaild email address!"]
    },
   phone: {
     type:String,
     unique: true
},
    password: String,
    
    profile:String

});

const User = mongoose.model("users", userSchema);

const cartSchema = new mongoose.Schema({
    productId : mongoose.Types.ObjectId,
    userId : mongoose.Types.ObjectId,
    quantity : Number,
    images: String
});

const Cart = mongoose.model("cart", cartSchema);

const wishListSchema = new mongoose.Schema({
     productId : mongoose.Types.ObjectId,
    userId : mongoose.Types.ObjectId,
    quantity : Number,
    images: String
});

const WishList = mongoose.model("wishList", wishListSchema)



const transporter = nodemailer.createTransport({
    service:"gmail",
    auth:{
        user:"akankshamaurya211@gmail.com",
        pass:"zwmc wvxy ihoo txtv"
    }
});

const template= `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>New Customer Query</title>
<style>
    body{
        margin:0;
        padding:20px;
        background:#f4f7fb;
        font-family:Arial, Helvetica, sans-serif;
    }

    .wrapper{
        max-width:700px;
        margin:auto;
        background:#ffffff;
        border-radius:12px;
        overflow:hidden;
        box-shadow:0 4px 15px rgba(0,0,0,0.08);
    }

    .header{
        background:linear-gradient(135deg,#0d6efd,#4f46e5);
        color:#ffffff;
        text-align:center;
        padding:30px;
    }

    .header h1{
        margin:0;
        font-size:28px;
    }

    .header p{
        margin:8px 0 0;
        opacity:0.9;
    }

    .content{
        padding:30px;
    }

    .info-box{
        background:#f8faff;
        border-left:5px solid #0d6efd;
        padding:15px;
        margin-bottom:25px;
        border-radius:6px;
    }

    .query-table{
        width:100%;
        border-collapse:collapse;
        margin-top:15px;
    }

    .query-table th{
        width:180px;
        background:#f1f5f9;
        color:#333;
        text-align:left;
        padding:14px;
        border-bottom:1px solid #e5e7eb;
    }

    .query-table td{
        padding:14px;
        border-bottom:1px solid #e5e7eb;
        color:#555;
    }

    .message-box{
        background:#f8fafc;
        padding:15px;
        border-radius:8px;
        border:1px solid #e5e7eb;
        margin-top:15px;
    }

    .footer{
        text-align:center;
        padding:20px;
        background:#f8fafc;
        color:#6b7280;
        font-size:12px;
    }

    .badge{
        display:inline-block;
        background:#dcfce7;
        color:#166534;
        padding:6px 12px;
        border-radius:20px;
        font-size:12px;
        font-weight:bold;
        margin-bottom:15px;
    }
</style>
</head>
<body>

<div class="wrapper">

    <div class="header">
        <h1>📩 New Customer Query</h1>
        <p>A customer has submitted a new inquiry.</p>
    </div>

    <div class="content">

        <span class="badge">NEW REQUEST RECEIVED</span>

        <div class="info-box">
            Please review the customer details below and respond accordingly.
        </div>

        <table class="query-table">
            <tr>
                <th>👤 Customer Name</th>
                <td>{{CustomerName}}</td>
            </tr>
            <tr>
                <th>📧 Email Address</th>
                <td>{{CustomerEmail}}</td>
            </tr>
            <tr>
                <th>📝 Subject</th>
                <td>{{Subject}}</td>
            </tr>
            <tr>
                <th>📅 Submitted On</th>
                <td>{{SubmittedDate}}</td>
            </tr>
        </table>

        <h3 style="margin-top:25px;color:#333;">💬 Customer Message</h3>

        <div class="message-box">
            {{Message}}
        </div>

    </div>

    <div class="footer">
        This is an automated notification generated from the website contact form.<br>
        © 2026 Your Company Name
    </div>

</div>

</body>
</html>
<html>
<head>
    <title>Customer Query Form</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
        }

        .container {
            width: 500px;
            margin: 50px auto;
            background: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }

        h2 {
            text-align: center;
            color: #333;
        }

        table {
            width: 100%;
        }

        td {
            padding: 10px;
        }

        label {
            font-weight: bold;
        }

        input[type="text"],
        input[type="email"],
        textarea {
            width: 100%;
            padding: 8px;
            border: 1px solid #ccc;
            border-radius: 4px;
            box-sizing: border-box;
        }

        textarea {
            resize: vertical;
        }

        .btn {
            background-color: #007BFF;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
        }

        .btn:hover {
            background-color: #0056b3;
        }

        .center {
            text-align: center;
        }
    </style>
</head>
<body>

<div class="container">
    <h2>Customer Query Form</h2>

    <form action="#" method="post">
        <table>
            <tr>
                <td><label for="name">Name:</label></td>
                <td><input type="text" id="name" name="name" required></td>
            </tr>

            <tr>
                <td><label for="email">Email:</label></td>
                <td><input type="email" id="email" name="email" required></td>
            </tr>

            <tr>
                <td><label for="subject">Subject:</label></td>
                <td><input type="text" id="subject" name="subject" required></td>
            </tr>

            <tr>
                <td><label for="message">Message:</label></td>
                <td>
                    <textarea id="message" name="message" rows="5" required></textarea>
                </td>
            </tr>

            <tr>
                <td colspan="2" class="center">
                    <input type="submit" value="Send Query" class="btn">
                </td>
            </tr>
        </table>
    </form>
</div>

</body>
</html>`

const template2 = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Query Received</title>
<style>
    body{
        margin:0;
        padding:20px;
        background:#f4f7fc;
        font-family:Arial, Helvetica, sans-serif;
    }

    .container{
        max-width:700px;
        margin:auto;
        background:#ffffff;
        border-radius:16px;
        overflow:hidden;
        box-shadow:0 8px 25px rgba(0,0,0,0.08);
    }

    .header{
        background:linear-gradient(135deg,#2563eb,#7c3aed);
        padding:40px 30px;
        text-align:center;
        color:#ffffff;
    }

    .header h1{
        margin:0;
        font-size:32px;
    }

    .header p{
        margin-top:10px;
        font-size:16px;
        opacity:0.9;
    }

    .content{
        padding:35px;
    }

    .success-badge{
        display:inline-block;
        background:#dcfce7;
        color:#15803d;
        padding:8px 16px;
        border-radius:25px;
        font-weight:bold;
        margin-bottom:20px;
    }

    .message{
        background:#f8fafc;
        border-left:5px solid #2563eb;
        padding:18px;
        border-radius:8px;
        margin-bottom:25px;
        color:#475569;
    }

    table{
        width:100%;
        border-collapse:collapse;
        margin-top:15px;
    }

    th{
        background:#f1f5f9;
        text-align:left;
        padding:14px;
        width:180px;
        color:#334155;
        border-bottom:1px solid #e2e8f0;
    }

    td{
        padding:14px;
        color:#475569;
        border-bottom:1px solid #e2e8f0;
    }

    .note{
        margin-top:25px;
        padding:18px;
        background:#eff6ff;
        border-radius:8px;
        color:#1e40af;
    }

    .footer{
        text-align:center;
        background:#f8fafc;
        padding:20px;
        color:#64748b;
        font-size:13px;
    }

    .button{
        display:inline-block;
        margin-top:20px;
        padding:12px 24px;
        background:#2563eb;
        color:#ffffff;
        text-decoration:none;
        border-radius:8px;
        font-weight:bold;
    }
</style>
</head>
<body>

<div class="container">

    <div class="header">
        <h1>✅ Query Received</h1>
        <p>Thank you for contacting us</p>
    </div>

    <div class="content">

        <span class="success-badge">
            Request Successfully Submitted
        </span>

        <div class="message">
            Dear <strong>{{CustomerName}}</strong>,<br><br>
            Thank you for reaching out to us. We have successfully received your query.
            Our support team is reviewing your request and will get back to you shortly.
        </div>

        <table>
            <tr>
                <th>👤 Name</th>
                <td>{{CustomerName}}</td>
            </tr>
            <tr>
                <th>📧 Email</th>
                <td>{{CustomerEmail}}</td>
            </tr>
            <tr>
                <th>📝 Subject</th>
                <td>{{Subject}}</td>
            </tr>
            <tr>
                <th>💬 Message</th>
                <td>{{Message}}</td>
            </tr>
        </table>

        <div class="note">
            ⏱ Expected Response Time: Within 24–48 business hours.
        </div>

        <center>
            <a href="#" class="button">Visit Our Website</a>
        </center>

    </div>

    <div class="footer">
        © 2026 Your Company Name<br>
        This is an automated acknowledgment email. Please do not reply directly to this message.
    </div>

</div>

</body>
</html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 20px;
        }

        .email-container {
            max-width: 700px;
            margin: auto;
            background-color: #ffffff;
            border: 1px solid #dddddd;
            border-radius: 5px;
            overflow: hidden;
        }

        .header {
            background-color: #007BFF;
            color: #ffffff;
            text-align: center;
            padding: 15px;
            font-size: 24px;
            font-weight: bold;
        }

        .content {
            padding: 20px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }

        table, th, td {
            border: 1px solid #cccccc;
        }

        th {
            background-color: #f8f9fa;
            text-align: left;
            padding: 10px;
            width: 30%;
        }

        td {
            padding: 10px;
        }

        .footer {
            background-color: #f8f9fa;
            text-align: center;
            padding: 15px;
            color: #666666;
            font-size: 12px;
        }
    </style>
</head>
<body>

<div class="email-container">

    <div class="header">
        Query Received
    </div>

    <div class="content">

        <p>Dear <strong>{{CustomerName}}</strong>,</p>

        <p>Thank you for contacting us. We have successfully received your query.</p>

        <table>
            <tr>
                <th>Name</th>
                <td>{{CustomerName}}</td>
            </tr>
            <tr>
                <th>Email</th>
                <td>{{CustomerEmail}}</td>
            </tr>
            <tr>
                <th>Subject</th>
                <td>{{Subject}}</td>
            </tr>
            <tr>
                <th>Message</th>
                <td>{{Message}}</td>
            </tr>
            <tr>
                <th>Received On</th>
                <td>{{DateTime}}</td>
            </tr>
        </table>

        <p>
            Our support team is reviewing your request and will respond as soon as possible.
        </p>

        <p>
            Thank you for reaching out to us.
        </p>

        <p>
            Regards,<br>
            <strong>Customer Support Team</strong><br>
            {{CompanyName}}
        </p>

    </div>

    <div class="footer">
        © {{Year}} {{CompanyName}}. All Rights Reserved.
    </div>

</div>

</body>
</html>`

app.post("/signup", async (req, res) => {
    try {
        let { name, email, phone, password } = req.body;
        password = await bcrypt.hash(password, 12)
        const createdUser = await User.create({ name, email, phone, password });
        if (!createdUser)
            throw new Error("could not process your request at the moment!")

        res.status(201).json({ message: "createdUser" });
    } catch (error) {
        if (error.name == "ValidationError") {
            // field = Object.keys(error.erros) //=>["name", "email",...]
            // fields.map(field=>error.erros[field].message)// =>["Name must contain at least 3 letters", "Please provide..."]
            const message = Object.keys(error.errors).map(el => error.errors[el].message)
            console.log(message)
            res.status(400).json({ message: error.message });
        } else if (error.code == 11000) { // monogodb error
            const errObj = error.keyvalue;
            const field = Object.keys(errObj)[0]
            const value = errObj[field]

            res.status(400).json({ message: `The ${field} ${value} has already been taken!` })
        } else {
            res.status(500).json({ message: error.message });
        }

    }
});


app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user)
            throw new Error("invalid credentials!")

        const correctPass = await bcrypt.compare(password, user.password);
        if (!correctPass)
            throw new Error("invalid credentials!")

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "90d" });
        res.cookie("jwt", token, { maxAge: 90 * 24 * 60 * 60 * 1000, httpOnly: true, secure: true, sameSite: "None" });
        res.status(200).json({ message: "Logged In", token });

    } catch (error) {
        console.log(error);
        res.status(400).json({ message: error.message })
    }
    //hash and data values are required!!   =>use findOne


});

async function checkAuth(req, res,next) {
    //middleware
     try {
        const token = req.cookies.jwt;
        if (!token)
            return res.status(401).json({ message: "Please Login!" });

        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const userId = payload.userId;
        const user = await User.findById(userId);

        if (!user) {
            //clear the cookie
            throw new Error("You should not be here!")
        }

        req.user = user;
        next();
       
    } catch (error) {
        if (error.name == "JSONWebTokenError" || error.name == "JSONWebExpiredError") {
            res.cookie("jwt", "", { maxAge: 90 * 24 * 60 * 60 * 1000 });
            return res.status(401).json({ message: "You should not be here!" })
        }
        res.status(500).json({ message: "Something went wrong!" });
        console.log(error);

    }
    
}


app.get("/profileimage", checkAuth, async (req, res) => {
    // try {
    //     const token = req.cookies.jwt;
    //     if (!token)
    //         return res.status(401).json({ message: "Please Login!" });

    //     const payload = jwt.verify(token, process.env.JWT_SECRET);
    //     const userId = payload.userId;
    //     const user = await User.findById(userId);

    //     if (!user) {
    //         throw new Error("You should not be here!")
    //     }
    //     res.status(200).json({ message: user });
    // } catch (error) {
    //     if (error.name == "JSONWebTokenError" || error.name == "JSONWebExpiredError") {
    //         res.cookie("jwt", "", { maxAge: 90 * 24 * 60 * 60 * 1000 });
    //         return res.status(401).json({ message: "You should not be here!" })
    //     }
    //     res.status(500).json({ message: "Something went wrong!" });
    //     console.log(error);

    // }
    res.status(200).json({message: req.user});
});

app.get("/logout", (req, res) => {
    res.cookie("jwt", "");
    res.status(200).json({ message: "Logged Out!" })
});



// const uploader = multer({   // multer files upload handle krta hai
//     storage: multer.diskStorage({  // storage(file kha save hogi, diskstorage mtlb file disk (server folder) m save hogi)
//         filename: (req, file, cb) => { // create unique name
//             const randomNum = Math.floor(Math.random() * 100000);
//             const currentDateTime = Date.now();
//             const fileName = `${randomNum}-${currentDateTime}${path.extname(file.originalname)}`;
//             cb(null, fileName);
//         },
//         destination: (req, file, cb) => { // file uploads folder m svae hogi
//             //console.log(file.mimetype);
//             //if(file.mimetype.startsWith("image"))
//             cb(null, "./uploads");
//         }
//     }),

//     fileFilter: (req, file, cb) => { // kon si file upload hogi
//         const allowedMineType = ["image/png", "image/jpg", "image/jpeg"]; // allowed only images
//         if (!allowedMineType.includes(file.mimetype))
//             return cb(new multer.MulterError("only JPG, PNG and JPEG images are allowed"));
//         cb(null, true);
//     }

// });


const uploader = multer({
    storage: multer.memoryStorage()
});

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET,
});

function uploadToCloud(fileBuffer){
    return new Promise((res,rej)=>{
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder:"profile",
                resource_type: "image"
            },
            (error, result)=>{
                if(error)rej(error);
                else res(result);
            }
        );
        streamifier.createReadStream(fileBuffer).pipe(uploadStream);
    })
}

app.post("/profileimage", checkAuth,uploader.single("image"), async (req, res) => {
    try {
        if (!req.file)
          //  return res.status(400).json({ message: "Could not upload file!" });
            throw new Error();
            const allowedMineType = ["image/png", "image/jpg", "image/jpeg"];

            const filetype = await fileTypeFromBuffer(req.file.buffer)
      //  console.log(req.file);
      //  const uploadedFilePath = req.file.path; // server m file kha save hui h
      //  const type = await fileTypeFromFile(uploadedFilePath);// real mime check krta h
        //const allowedMineType = ["image/png", "image/jpg", "image/jpeg"];


        if(!allowedMineType.includes(filetype.mime)){
           // await fs.unlink(uploadedFilePath);
            res.status(400).json({message:"only JPG, PNG and JPEG images are allowed"});
           //return
        }

       // res.status(200).json({ message: "File Uploaded!" })
       const result = await uploadToCloud(req.file.buffer);
       // upload to cloudinary;

       req.user.profile= result.url;
       await req.user.save();
       res.status(200).json({message:req.user});
    } catch (error) {
        console.log(error)
        res.status(500).json({message:"Something went wrong!"});
    }
});

app.get("/products", async(req, res)=>{
   try {
     const{q, category}= req.query;

    const ogani= mongoose.connection.db;
    const products = await ogani.collection("products").find({title:{$regex: q || "", $options: "i"},category:{$regex:category || "", $options:"i"}}).toArray();
    const categories = await ogani.collection("products").distinct("category");

    res.status(200).json({products, categories});
   } catch (error) {
     console.log(error);
   
   }
});

app.get("/product/:id", async(req, res)=>{
    try {
        const { id } = req.params;
        const ogani= mongoose.connection.db;
        const product = await ogani.collection("products").findOne({_id: new mongoose.Types.ObjectId(id)});
        res.status(200).json({product});
    } catch (error) {
        console.log(error);
        
          res.status(500).json({message:"Something went wrong!"})
    }
});

app.post("/cart", checkAuth, async(req , res)=>{

    try {
        
        const {productId, quantity } = req.body;
        const userId =  req.user._id;

        const existingItem = await Cart.findOne({
            productId: new mongoose.Types.ObjectId(productId),
            userId
           
        });

        if(existingItem){
            console.log(existingItem);
            
            existingItem.quantity = existingItem.quantity + quantity;
          if(existingItem.quantity<=0){
            await existingItem.deleteOne();
          }else{
            await existingItem.save();
          }
            
        }else{
            if(quantity>=1){
                const newCartItem = await Cart.create({
                    productId: new mongoose.Types.ObjectId(productId),
                    userId,
                    quantity
                });
            }
        }
      
        // console.log(productId, userId , quantity);

      const usersCart = await Cart.aggregate([
  {
    $match: {userId}},
  {
    $lookup: {
      from: "products",
      localField: "productId",
      foreignField: "_id",
      as: "product"
    }
  },
  {
    $addFields: {
      product: {
        $arrayElemAt: ["$product", 0]
      }
    }
  },
  {
    $project: {
        productId:"$product._id",
      quantity: 1,
      price: "$product.price",
      title: "$product.title",
      image: {
        $arrayElemAt: ["$product.images", 0]
      }
    }
  }
]);

res.status(200).json({cart :usersCart});
        
    } catch (error) {
        console.log(error);
        
        res.status(500).json({message:"Something went wrong!!"})
    }
});

// app.patch("/cart/decrease/:id", checkAuth , async(req, res)=>{
//     try {
//         const cartItem = await Cart.findById(req.params.id);

//         if(!cartItem){
//             res.status(404).json({message:"Cart item not found!!"});
//         }

//         cartItem.quantity = cartItem.quantity - 1;
//         if(cartItem.quantity<=0){
//             await Cart.findByIdAndDelete(req.params.id);

//             return res.status(200).json({message:"Item removed from the cart!!"});
//         }

//         await cartItem.save();

//         res.status(200).json({message:cartItem})
//     } catch (error) {
//         console.log(error)
//         res.status(500).json({message:"Something went wrong!!"})
//     }
// })



app.get("/cart", checkAuth,async(req , res)=>{
    try {
           const userId =  req.user._id;
          const cartItems = await Cart.aggregate([
  {
    $match: {userId}},
  {
    $lookup: {
      from: "products",
      localField: "productId",
      foreignField: "_id",
      as: "product"
    }
  },
  {
    $addFields: {
      product: {
        $arrayElemAt: ["$product", 0]
      }
    }
  },
  {
    $project: {
         productId:"$product._id",
      quantity: 1,
      price: "$product.price",
      title: "$product.title",
      image: {
        $arrayElemAt: ["$product.images", 0]
      }
    }
  }
]);

res.status(200).json({ message:cartItems });

    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Something went wrong!"})
        
    }
});

app.post("/wishList", checkAuth, async(req , res)=>{

    try {
        
        const {productId, quantity } = req.body;
        const userId =  req.user._id;

        const existingItem = await WishList.findOne({
            productId: new mongoose.Types.ObjectId(productId),
            userId
           
        });

        if(existingItem){
            console.log(existingItem);
            
            existingItem.quantity = existingItem.quantity + quantity;
          if(existingItem.quantity<=0){
            await existingItem.deleteOne();
          }else{
            await existingItem.save();
          }
            
        }else{
            if(quantity>=1){
                const newCartItem = await WishList.create({
                    productId: new mongoose.Types.ObjectId(productId),
                    userId,
                    quantity
                });
            }
        }
      
        // console.log(productId, userId , quantity);

      const usersWishList = await WishList.aggregate([
  {
    $match: {userId}},
  {
    $lookup: {
      from: "products",
      localField: "productId",
      foreignField: "_id",
      as: "product"
    }
  },
  {
    $addFields: {
      product: {
        $arrayElemAt: ["$product", 0]
      }
    }
  },
  {
    $project: {
        productId:"$product._id",
      quantity: 1,
      price: "$product.price",
      title: "$product.title",
      image: {
        $arrayElemAt: ["$product.images", 0]
      }
    }
  }
]);

res.status(200).json({wishList :usersWishList});
        
    } catch (error) {
        console.log(error);
        
        res.status(500).json({message:"Something went wrong!!"})
    }
});

const rzpay = new Razorpay({
    key_id: process.env.RAZ_API_KEY,
    key_secret: process.env.RAZ_KEY_SECRET
});

// app.get("/order",async(req, res)=>{

//     try {
//         const order = await rzpay.orders.create({
//             currency:"INR",
//             amount: 50*100,
//             receipt:"receipt_"+Math.floor(Math.random()*1000)
//         });

//         res.status(200).json({message:order});
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({message:"Something went wrong!"});
//     }
// });

app.post("/verifypayment", checkAuth, async(req, res)=>{
    try {
        const  {razorpay_payment_id, razorpay_order_id, razorpay_signature}= req.body;
        
        const msg = razorpay_order_id + "|"+razorpay_payment_id;
        const expectedSign = crypto.createHmac("sha256", process.env.RAZ_KEY_SECRET)
                .update(msg)
                .digest("hex");

                console.log(expectedSign==razorpay_signature);
                if(expectedSign==razorpay_signature){
                    res.status(200).json({message:"Payment Sucessful!!"})
                }else{
                     res.status(400).json({message:"Payment Fail!!"});
                }
    } catch (error) {
        res.status(500).json({message:"Something went wrong!!"});
    }
})
app.post("/create-orders",checkAuth, async(req ,res)=>{
    try {
        const userId = req.user._id;
        const cart = await Cart.aggregate([
            {$match:{
                userId:userId
            }},

           { $lookup:{
                from:"products",
                localField:"productId",
                foreignField:"_id",
                as:"product"
            }
        },
        {
            $unwind: "$product"
        }
        ]);

        let totalAmount = 0;

        cart.forEach(item=>{
            totalAmount = totalAmount + item.product.price * item.quantity
        });
        console.log(totalAmount);

        const order = await rzpay.orders.create({
            amount: totalAmount*100,
            currency:"INR",
            receipt: "receipt_"+ Math.floor(Math.random()*1000)+"-"+ Math.floor(Math.random()*1000)
        });

        res.status(200).json({orderId:order.id, amount: order.amount, currency:order.currency});
        
    } catch (error) {
        
        console.log(error);
        res.status(500).json({message:"Something went wrong!!"})
        
        
    }
})
app.get("/wishList", checkAuth,async(req , res)=>{
    try {
           const userId =  req.user._id;
          const wishListItems = await WishList.aggregate([
  {
    $match: {userId}},
  {
    $lookup: {
      from: "products",
      localField: "productId",
      foreignField: "_id",
      as: "product"
    }
  },
  {
    $addFields: {
      product: {
        $arrayElemAt: ["$product", 0]
      }
    }
  },
  {
    $project: {
         productId:"$product._id",
      quantity: 1,
      price: "$product.price",
      title: "$product.title",
      image: {
        $arrayElemAt: ["$product.images", 0]
      }
    }
  }
]);

res.status(200).json({ message:wishListItems });

    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Something went wrong!"})
        
    }
});

app.post("/contact", async(req, res)=>{
   
    try {
         const{name , email, subject, message } = req.body;
        await transporter.sendMail({
            to:"neham5364@gmail.com",
            from:"akankshamaurya211@gmail.com",
            html: template,
            subject:"Query received from customer!"
            
        })
        
         await transporter.sendMail({
                to:"akankshamaurya211@gmail.com",
                from:"neham5364@gmail.com",
                html:template2,
                subject:"We Received your Query!"
            });

            res.status(200).json({message:"task done !"})
            
    } catch (error) {
        console.log(error)
        res.status(500).json({message:"Something Went wrong!"});
    }
})

app.use((error, req , res, next)=>{
    //Global Error handling Midleware

    if(error instanceof MulterError){
        return res.status(400).json({message:error.code});
    }
    res.status(500).json({message:"Something Went wrong!"})
});

//app.listen(process.env.PORT, () => console.log(`http://localhost:${process.env.PORT}/`));

export default app;


//db.employees.aggregate([{$group:{_id: "$deptId", totalEmployees:{$sum:1}}}])