import { useMutation } from "@tanstack/react-query";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";


const ResetPassword = () => {
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const navigate = useNavigate();

    const { mutate: resetPasswordMutation, isPending: isResetPasswordPending, isError: isResetPasswordError, error: resetPasswordError } = useMutation({
        mutationFn: async ({ otp, newPassword, confirmNewPassword }) => {
            const res = await fetch("/api/auth/resetPassword", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ otp, newPassword, confirmNewPassword })
            });
            
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Reset Password failed");
            }

            // console.log("Sending:", { otp, newPassword, confirmNewPassword });

            return data
        },
        onSuccess: () => {
            toast.success("Reset password successful");
            navigate("/login")
            //   queryClient.invalidateQueries({ queryKey: ["authUser"] });
        },
        onError: (err) => {
            toast.error(err.message);
        }
    })

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (newPassword !== confirmNewPassword) {
            setError("Passwords do not match.");
            return;
        }

        resetPasswordMutation({ otp, newPassword, confirmNewPassword });

        // setLoading(true);
        // try {
        //     // Replace with your API endpoint
        //     const response = await fetch("/api/auth/resetPassword", {
        //         method: "POST",
        //         headers: {
        //             "Content-Type": "application/json",
        //         },
        //         body: JSON.stringify({
        //             otp,
        //             newPassword,
        //         }),
        //     });

        //     const data = await response.json();

        //     if (!response.ok) {
        //         setError(data.message || "Failed to reset password.");
        //     } else {
        //         setSuccess("Password reset successful! You can now log in.");
        //         setOtp("");
        //         setNewPassword("");
        //         setConfirmNewPassword("");
        //     }
        // } catch (err) {
        //     setError("Something went wrong. Please try again.");
        // } finally {
        //     setLoading(false);
        // }
    };

    return (
        <div className="flex flex-col m-auto items-center justify-center min-h-screen">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center text-[#153a54]">Reset Password</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="otp" className="block text-sm font-medium text-gray-700">OTP</label>
                        <input
                            type="text"
                            id="otp"
                            name="otp"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                            className="mt-1 block w-full px-3 py-2 border bg-[#153a54] border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 text-white"
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">New Password</label>
                        <input
                            type="password"
                            id="newPassword"
                            name="newPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            className="mt-1 block w-full px-3 py-2 border bg-[#153a54] border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 text-white"
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                        <input
                            type="password"
                            id="confirmNewPassword"
                            name="confirmNewPassword"
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            required
                            className="mt-1 block w-full px-3 py-2 border bg-[#153a54] border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 text-white"
                        />
                    </div>
                    {error && <div className="mb-4 text-red-600 text-center">{error}</div>}
                    {success && <div className="mb-4 text-green-600 text-center">{success}</div>}
                    <button
                        type="submit"
                        className="w-full btn rounded-2xl bg-[#dff2fe] text-[#153a54] py-2 px-4 transition duration-200"
                        disabled={loading}
                    >
                        {loading ? "Resetting..." : "Reset Password"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;