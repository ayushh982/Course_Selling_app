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

  // ✅ token is stored directly
  const token = JSON.parse(localStorage.getItem("user"));
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
        const response = await axios.post(`${BACKEND_URL}/course/buy/${courseId}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true, // Include cookies if needed
          }
        );
        setCourse(response.data.course);
        setClientSecret(response.data.clientSecret);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        if (error?.response?.status === 400) {
          setError("you have already purchased this course");
          navigate("/purchases");
        } else {
          setError(error?.response?.data?.errors);
        }
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
    } else if (paymentIntent.status === "succeeded") {
      console.log("Payment succeeded: ", paymentIntent);
      setCardError("your payment id: ", paymentIntent.id);
      const paymentInfo = {
        email: userInfo?.email || "",
        userId: userInfo?._id,
        courseId,
        paymentId: paymentIntent.id,
        amount: paymentIntent.amount,
        status: paymentIntent.status,
      };

      console.log("Payment info: ", paymentInfo);
      await axios
        .post(`${BACKEND_URL}/order`, paymentInfo, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        })
        .then((response) => {
          console.log(response.data);
        })
        .catch((error) => {
          console.log(error);
          toast.error("Error in making payment");
        });
      toast.success("Payment Successful");
      navigate("/purchases");
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
