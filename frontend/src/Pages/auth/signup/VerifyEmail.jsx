import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import toast from "react-hot-toast";

const VerifyOTPPage = () => {
  const [otp, setOtp] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Email verified! You can now login.");
      navigate("/login");
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (!email) return <p className="text-red-500">Email missing. Go back to signup.</p>;

  return (
    <div className="flex justify-center items-center h-screen">
      <form onSubmit={handleSubmit} className="p-8 bg-white shadow-md rounded">
        <h2 className="text-xl text-black font-bold mb-4">Enter OTP sent to {email}</h2>
        <input
          className="input input-bordered mb-4 w-full"
          type="text"
          placeholder="6-digit OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />
        <button className="btn bg-[#153a54] text-white w-full">Verify</button>
      </form>
    </div>
  );
};

export default VerifyOTPPage;
