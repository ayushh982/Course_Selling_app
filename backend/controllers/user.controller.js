import {User} from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {z} from "zod";
import config from "../config.js";
import { Course } from "../models/course.models.js";
import { Purchase } from "../models/purchase.model.js";

export const signup = async (req, res) => {
    const {firstName,lastName,email,password}= req.body;

    const userSchema= z.object({
        firstName: z.string().min(3,{message:"firstName must be atleast 3 char long"}),
        lastName: z.string().min(3,{message:"lastName must be atleast 3 char long"}),
        email: z.string().email(),
        password: z.string().min(6,{message:"password must be atleast 6 char long"})
    });
    const validatedData= userSchema.safeParse(req.body);
    if(!validatedData.success){
        return res.status(400).json({errors:validatedData.error.issues.map(err=>err.message)});
    }

    const hashPassword= await bcrypt.hash(password,10);
    
    try{
            const exixtingUser= await User.findOne({email});
        if(exixtingUser){

        return res.status(400).json({errors:"User already exists"});
     }
        const newUser= new User({firstName,lastName,email,password:hashPassword});
        await newUser.save();
        res.status(201).json({message:"User created successfully", user:newUser});

    }catch(error){
        console.log("Error in user signup", error);
    }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1️⃣ Find user
    const user = await User.findOne({ email: email.toLowerCase() });

    // 2️⃣ Check if user exists
    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // 3️⃣ Compare password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // 4️⃣ Generate token
    const token = jwt.sign(
      { id: user._id },
      config.JWT_USER_PASSWORD,
      { expiresIn: "1d" }
    );

    // Set JWT cookie for cross-origin
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.status(200).json({
      message: "User logged in successfully",
    });

  } catch (error) {
    console.error("Error in user login", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

// export const login = async (req, res) => {
//     const {email, password} = req.body;

//     try{
//         const user= await User.findOne({email:email});
//         const isPasswordCorrect = await bcrypt.compare(password, user.password);
//         if(!user||!isPasswordCorrect){
//             return res.status(400).json({error:"Invalid Credentials"});
//         }

//         //jwt token
//         const token= jwt.sign(
//             {
//                 id:user._id,
//             },
//             config.JWT_USER_PASSWORD, 
//             {expiresIn:"1d"}
//         );
//         const cookieOptions={        
//             expires:new Date(Date.now()+ 24*60*60*1000), //1 day
//             httpOnly:true,
//             secure:process.env.NODE_ENV==="production",
//             sameSite:"Strict",
//         }
//         res.cookie("jwt", token,cookieOptions);

//         res.status(201).json({message:"User logged in successfully", user:user,token:token});
//     }catch(error){  
//         res.status(500).json({errors:"Error in login"});
//         console.log("Error in user login", error);
//     }
// }

export const logout= (req,res)=>{

    try{
        if(!req.cookies?.jwt){
            return res.status(401).json({error:"Kindly login First"});
        }
         res.clearCookie("jwt");
         res.status(200).json({message:"User logged out successfully"});
    }catch(error){
        res.status(500).json({error:"Error in logout"});
        console.log("Error in User logout", error);
    }
};
export const purchases= async(req,res)=>{
    const userId= req.userId;

    try{
        const purchased= await Purchase.find({userId})

        let purchasedCourseId= [];

        for(let i=0; i<purchased.length; i++){
            purchasedCourseId.push(purchased[i].courseId)
        }

            const courseData = await Course.find({
                _id:{$in:purchasedCourseId},
            });
        

        res.status(200).json({purchased, courseData});
    }catch(error){
        res.status(500).json({error:"Error in fetching purchases"});
        console.log("Error in fetching purchases", error);
    }
};