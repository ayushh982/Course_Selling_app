
import React, { useState, useEffect } from "react";
import logo from "../../public/app_logo.png";
import { Link } from "react-router-dom";
import { FaTelegram, FaInstagram, FaLinkedin } from "react-icons/fa";
import axios from "axios";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import toast from "react-hot-toast";
import { BACKEND_URL } from "../utils/utils";


function Home() {
  const [courses, setCourses] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("user");
    if (token) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  },[]);

  const handleLogout = async () => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/user/logout`,
        { withCredentials: true }
      );
      toast.success(response.data.message);
      setIsLoggedIn(false);
    } catch (error) {
      console.log("Error during logout:", error);
      toast.error(error.response?.data?.error || "Logout failed. Please try again.");
    }
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(
          `${BACKEND_URL}/course/courses`,
          { withCredentials: true }
        );
        setCourses(response.data.courses);
      } catch (error) {
        console.log("Error fetching courses:", error);
      }
    };
    fetchCourses();
  }, []);

  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: { slidesToShow: 3, slidesToScroll: 1, dots: true },
      },
      {
        breakpoint: 600,
        settings: { slidesToShow: 2, slidesToScroll: 1 },
      },
      {
        breakpoint: 480,
        settings: { slidesToShow: 1, slidesToScroll: 1 },
      },
    ],
  };

  return (
    <div className="bg-gradient-to-r from-black to-blue-950 min-h-screen w-full">
      <div className="text-white w-full max-w-[1400px] mx-auto px-4">

        {/* Header */}
        <header className="flex items-center justify-between py-6">
    <Link to="/" className="flex items-center gap-2">
     <img
      src={logo}
       alt="App Logo"
       className="w-12 h-12 rounded-full"
     />
      <h1 className="text-2xl text-orange-500 font-bold">
       UIT-CLASSES
      </h1>
    </Link>

          <div className="space-x-4">
            {isLoggedIn? (
              <Link
              to="/login"
              className="border px-4 py-2 rounded hover:bg-orange-600 transition"
            >
              Logout
            </Link>
            ):(
          <>
          <Link
                  to={"/login"}
                  className="bg-transparent text-white text-xs md:text-lg md:py-2 md:px-4 p-2 border border-white rounded"
                >
                  Login
            </Link>
            <Link
              to="/signup"
              className="border px-4 py-2 rounded hover:bg-orange-600 transition"
            >
              SignUp
            </Link></>)
            }
          </div>
        </header>

        {/* Hero Section */}
        <section className="text-center pt-16 pb-8">
          <h1 className="text-4xl font-semibold text-orange-500">
            UIT-CLASSES
          </h1>
          <p className="text-gray-400 mt-2">
            Sharpen your skills with courses crafted by UIT professors.
          </p>

          <div className="space-x-4 mt-6">
            <Link to ={'/courses'}className="bg-green-500 text-white py-3 px-6 rounded font-semibold hover:bg-white hover:text-black transition">
              Explore courses
            </Link>
            <Link to ={'https://www.youtube.com/@ApnaCollegeOfficial'} className="bg-white text-black py-3 px-6 rounded font-semibold hover:bg-green-500 hover:text-white transition">
              Courses videos
            </Link>
          </div>
        </section>

        {/* Courses Slider */}
        <section className="mt-10 pb-10">
          <Slider {...settings}>
            {courses.map((course) => {
              const imageUrl =
                typeof course.image === "string"
                  ? `${BACKEND_URL}/uploads/${course.image}`
                  : course.image?.url;

              return (
                <div key={course._id} className="px-3">
                  <div className="bg-[#0f1a2b] rounded-xl p-4 h-[260px] shadow flex flex-col">
                    <img
                      src={imageUrl}
                      className="w-full h-[120px] object-contain"
                      alt={course.title}
                    />

                    <h2 className="text-lg font-semibold mt-3 text-center">
                      {course.title}
                    </h2>

                    <div className="flex justify-center mt-8">
                      <Link to={`/buy/${course._id}`} className="bg-orange-500 text-white py-2 px-4 rounded-full hover:bg-blue-500 duration-300 text-center">
                        Enroll Now
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </Slider>
        </section>

        {/* Footer */}
        <hr className="border-gray-700" />

        <footer className="mt-8 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-3">

            {/* Left */}
            <div className="flex flex-col items-center md:items-start">
              <h2 className="text-orange-500 font-bold text-xl">UIT-CLASSES</h2>
              <p className="mt-3">Follow us</p>
              <div className="flex space-x-4 mt-2 text-xl">
                <FaTelegram className="hover:text-blue-400 duration-300" />
                <FaInstagram className="hover:text-pink-600 duration-300" />
                <FaLinkedin className="hover:text-blue-600 duration-300" />
              </div>
            </div>

            {/* Middle */}
            <div className="text-center mt-6 md:mt-0">
              <h3 className="text-lg font-semibold mb-4">connects</h3>
              <ul className="space-y-2 text-gray-400">
                <li>YouTube - UIT Classes</li>
                <li>Telegram - UIT Classes</li>
                <li>Github - UIT Classes</li>
              </ul>
            </div>

            {/* Right */}
            <div className="text-center md:text-right mt-6 md:mt-0">
              <h3 className="text-lg font-semibold mb-4">copyright © 2025</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Terms & Conditions</li>
                <li>Privacy Policy</li>
                <li>Refund & Cancellation</li>
              </ul>
            </div>

          </div>
        </footer>

      </div>
    </div>
  );
}

export default Home;
