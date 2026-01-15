

import { Course } from "../models/course.models.js";
import { Purchase } from "../models/purchase.model.js";
import { v2 as cloudinary } from "cloudinary";

export const createCourse = async (req, res) => {
  
  const adminId= req.adminId;

  try {

    // Check if req.body exists
    if (!req.body) {
      return res.status(400).json({ errors: "Request body is missing" });
    }

    const { title, description, price } = req.body;

    if (!title || !description || !price) {
      return res.status(400).json({ errors: "All fields are required" });
    }

    if (!req.files || !req.files.image) {
      return res.status(400).json({ errors: "Image file is required" });
    }

    const image = req.files.image;
    const allowedFormat = ["image/jpeg", "image/png"];

    if (!allowedFormat.includes(image.mimetype)) {
      return res.status(400).json({ errors: "Only JPG and PNG formats allowed" });
    }


    // Upload to Cloudinary
    const cloud_response = await cloudinary.uploader.upload(image.tempFilePath);

    if (!cloud_response) {
      return res.status(400).json({ errors: "Error uploading file to Cloudinary" });
    }

    const courseData = {
      title,
      description,
      price,
      image: {
        public_id: cloud_response.public_id,
        url: cloud_response.secure_url, // use secure_url for HTTPS
      },
      createdBy: adminId,
    };

    const course = await Course.create(courseData);

    res.json({
      message: "Course created successfully",
      course,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ errors: "Error in creating course" });
  }
};

export const updateCourse= async(req,res)=>{
  const adminId= req.adminId;
    const {courseId}= req.params;
    const {title,description,price,image}=req.body;
    try{
      const courseSearch= await Course.findById(courseId);
      if(!courseSearch){
        return res.status(404).json({error:"Course not found"})
      }
        const course= await Course.findOneAndUpdate({
            _id:courseId,
            createdBy:adminId,
        },{
            title,
            description,
            price,
            image:{
                public_id:image?.public_id,
                url:image?.url,
            }
        });
        if(!course){
            return res.status(404).json({errors:"Cannot update course,Creates by another Professor"})
        }
        res.status(201).json({message:"Course updated successfully", course})

    }catch(error){
        res.status(500).json({error:"Error in course updating"})
        console.log("Error in course updating:",error);
    }
};

export const deleteCourse= async(req,res)=>{
  const adminId= req.adminId;
    const {courseId}= req.params;
    try{
        const course= await Course.findOneAndDelete({
            _id:courseId,
            createdBy:adminId,
          })
            if(!course){
                return res.status(404).json({error:"Cannot delete course,Creates by another Professor "})
            }
            res.status(200).json({message:"Course deleted successfully"})
    }catch(error){
        res.status(500).json({error:"Error in course deleting"})
        console.log("Error in course deleting:",error);
    }
}

export const getCourses=async(req,res)=>{
    try{
        const courses= await Course.find({})
        res.status(201).json({courses})
    }catch(error){
        res.status(500).json({error:"Error in fetching courses"})
        console.log("Error in fetching courses:",error);
    }
}

export const courseDetails= async(req,res)=>{
    const {courseId}= req.params;
    try{
        const course= await Course.findById(courseId)
        if(!course){
            return res.status(404).json({error:"Course not found"})
        }
        res.status(200).json({course})
    }catch(error){
        res.status(500).json({error:"Error in fetching course details"})
        console.log("Error in fetching course details:",error);
    }
}

import Stripe from "stripe";
import config from "../config.js";
const stripe=new Stripe(config.STRIPE_SECRET_KEY)
// console.log("Stripe Secret Key:", config.STRIPE_SECRET_KEY);

// Step 1: Only create payment intent, do not create purchase yet
export const buyCourses = async (req, res) => {
  const { userId } = req;
  const { courseId } = req.params;
  try {
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ errors: "Course not found" });
    }
    const exixtingPurchase = await Purchase.findOne({ userId, courseId });
    if (exixtingPurchase) {
      return res.status(400).json({ errors: "Course already purchased" });
    }
    // Only create payment intent
    const amount = course.price * 100;
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: "usd",
      payment_method_types: ["card"],
    });
    res.status(200).json({
      course,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(500).json({ errors: "Error in creating payment intent" });
    console.log("Error in creating payment intent:", error);
  }
};

// Step 2: Confirm purchase after payment
export const confirmPurchase = async (req, res) => {
  const { userId } = req;
  const { courseId } = req.params;
  const { paymentIntentId } = req.body;
  try {
    // Check payment status with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (!paymentIntent || paymentIntent.status !== "succeeded") {
      return res.status(400).json({ errors: "Payment not successful" });
    }
    // Check if already purchased
    const exixtingPurchase = await Purchase.findOne({ userId, courseId });
    if (exixtingPurchase) {
      return res.status(400).json({ errors: "Course already purchased" });
    }
    // Create purchase
    
    res.status(201).json({ message: "Course purchased successfully" });
  } catch (error) {
    res.status(500).json({ errors: "Error in confirming purchase" });
    console.log("Error in confirming purchase:", error);
  }
};