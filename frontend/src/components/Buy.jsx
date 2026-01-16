import axios from "axios";
import React, { useState,useEffect } from "react";
import toast from "react-hot-toast";
import { Link,useNavigate, useParams } from "react-router-dom";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { BACKEND_URL } from "../utils/utils";


export default function Buy() {
  const { courseId } = useParams();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const[course,setCourse]= useState({}); 
  const [clientSecret, setClientSecret] = useState("");
  const [error, setError] = useState("");

  // ✅ token is stored as a string
  const token = localStorage.getItem("user");
  console.log("[Buy.jsx] Token from localStorage:", token);
  // Get user info from localStorage if available
  let userInfo = null;
  try {
    userInfo = JSON.parse(localStorage.getItem("userInfo"));
  } catch (e) {}

  const stripe = useStripe();
  const elements = useElements();
  const [cardError, setCardError] = useState("");


  useEffect(() => {
    const fetchBuyCourseData = async () => {
      try {
        // Debug: print token and header
        console.log("[Buy.jsx] JWT token from localStorage:", token);
        const authHeader = `Bearer ${token}`;
        console.log("[Buy.jsx] Authorization header:", authHeader);
        const response = await axios.post(`${BACKEND_URL}/course/buy/${courseId}`,
          {},
          {
            headers: {
              Authorization: authHeader,
            },
            withCredentials: true, // Include cookies if needed
          }
        );
        setCourse(response.data.course);
        setClientSecret(response.data.clientSecret);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        let msg = "Unknown error";
        if (error?.response?.status === 400) {
          msg = "You have already purchased this course";
          setError(msg);
          navigate("/purchases");
        } else if (error?.response?.data?.errors) {
          msg = error.response.data.errors;
          setError(msg);
        } else if (error?.message) {
          msg = error.message;
          setError(msg);
        }
        toast.error("Error loading course: " + msg);
        console.log("[Buy.jsx] Error fetching course:", error);
      }
    };
    fetchBuyCourseData();
  }, [courseId]);

  const handlePurchase = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) {
      return;
    }
    setLoading(true);
    const card = elements.getElement(CardElement);
    if (card == null) {
      setLoading(false);
      return;
    }
    const {error: pmError, paymentMethod} = await stripe.createPaymentMethod({
      type: 'card',
      card,
    });
    if (pmError) {
      setLoading(false);
      setCardError(pmError.message);
      return;
    }
    if(!clientSecret){
      setLoading(false);
      return;
    }
    const {paymentIntent, error:confirmError} = await stripe.confirmCardPayment(
      clientSecret,
      {
        payment_method: {
          card: card,
          billing_details: {
            name: userInfo?.firstName || "",
            email: userInfo?.email || "",
          },
        },
      },
    );
    if (confirmError) {
      setCardError(confirmError.message);
      toast.error(`Stripe error: ${confirmError.message}`);
      console.error("[Buy.jsx] Stripe confirmCardPayment error:", confirmError);
    } else if (paymentIntent.status === "succeeded") {
      console.log("Payment succeeded: ", paymentIntent);
      setCardError("");
      try {
        // Confirm purchase with backend
        await axios.post(
          `${BACKEND_URL}/course/confirm/${courseId}`,
          { paymentIntentId: paymentIntent.id },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          }
        );
        toast.success("Payment Successful");
        navigate("/purchases");
      } catch (error) {
        console.log(error);
        toast.error("Error in confirming purchase");
      }
    } else {
      // PaymentIntent not succeeded, show error
      setCardError("Payment was not successful. Please try again.");
      toast.error("Payment was not successful. Please try again.");
      console.error("[Buy.jsx] PaymentIntent status:", paymentIntent.status, paymentIntent);
    }
    setLoading(false);
  };

  return (
  <>
    {error ? (
      // 🔴 Error state
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-red-100 text-red-700 px-6 py-4 rounded-lg text-center">
          <p className="text-lg font-semibold mb-3">{error}</p>
          <Link
            to="/purchases"
            className="inline-block bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition"
          >
            Go to Purchases
          </Link>
        </div>
      </div>
    ) : !course || !course.title ? (
      // 🔴 No course data fallback
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-yellow-100 text-yellow-700 px-6 py-4 rounded-lg text-center">
          <p className="text-lg font-semibold mb-3">Course details not available. Please try again later.</p>
          <Link
            to="/courses"
            className="inline-block bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition"
          >
            Go to Courses
          </Link>
        </div>
      </div>
    ) : (
      // 🟢 Payment page
      <div className="container mx-auto my-32 px-6 md:px-12 lg:px-20">

        <div className="flex flex-col md:flex-row gap-10 items-start">

          {/* Order Details */}
          <div className="w-full md:w-1/2">
            <h1 className="text-xl font-semibold underline mb-4">
              Order Details
            </h1>

            <div className="space-y-2">
              <p className="text-gray-600 text-sm">
                Course Name:
                <span className="text-red-500 font-bold ml-2">
                  {course?.title}
                </span>
              </p>

              <p className="text-gray-600 text-sm">
                Total Price:
                <span className="text-red-500 font-bold ml-2">
                  ${course?.price}
                </span>
              </p>
            </div>
          </div>

          {/* Payment Section */}
          <div className="w-full md:w-1/2 flex justify-center">
            <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-sm">
              <h2 className="text-lg font-semibold mb-4 text-center">
                Complete Your Payment
              </h2>

              <form onSubmit={handlePurchase}>
                {/* Stripe Card Input */}
                <div className="border rounded p-3 mb-4">
                  <CardElement
                    options={{
                      style: {
                        base: {
                          fontSize: "16px",
                          color: "#424770",
                          "::placeholder": { color: "#aab7c4" },
                        },
                        invalid: { color: "#9e2146" },
                      },
                    }}
                  />
                </div>

                {/* Stripe Errors */}
                {cardError && (
                  <p className="text-red-500 text-sm mb-3">
                    {cardError}
                  </p>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!stripe || !clientSecret || loading}
                  className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  {loading ? "Processing..." : "Pay Now"}
                </button>
              </form>

              {/* Optional alternative payment */}
              <button
                type="button"
                className="mt-4 w-full bg-orange-500 text-white py-2 rounded-md hover:bg-orange-600 transition flex items-center justify-center"
              >
                <span className="mr-2">🅿️</span> Other Payment Methods
              </button>
            </div>
          </div>

        </div>
      </div>
    )}
  </>
);


}
