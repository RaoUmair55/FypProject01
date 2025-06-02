import { useMutation } from "@tanstack/react-query";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { authenticatedFetch } from "../../../utils/authenticatedFetch"; // Import the helper

const ResetPassword = () => {
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    // Removed local 'loading' state, will use isResetPasswordPending from useMutation
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const navigate = useNavigate();

    const { mutate: resetPasswordMutation, isPending: isResetPasswordPending, isError: isResetPasswordError, error: resetPasswordError } = useMutation({
        mutationFn: async ({ otp, newPassword, confirmNewPassword }) => {
            try {
                // Use authenticatedFetch for the reset password API call
                // It automatically handles Content-Type: application/json and Authorization header
                const data = await authenticatedFetch("/api/auth/resetPassword", {
                    method: "POST",
                    body: JSON.stringify({ otp, newPassword, confirmNewPassword })
                });
                
                return data;
            } catch (err) {
                console.error("Error during reset password mutation:", err);
                throw err; // Re-throw for react-query to handle
            }
        },
        onSuccess: () => {
            toast.success("Password reset successful");
            setSuccess("Password reset successful! You can now log in."); // Set local success message
            setOtp("");
            setNewPassword("");
            setConfirmNewPassword("");
            navigate("/login");
        },
        onError: (err) => {
            toast.error(err.message);
            setError(err.message); // Set local error message
        }
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (newPassword !== confirmNewPassword) {
            setError("Passwords do not match.");
            return;
        }

        resetPasswordMutation({ otp, newPassword, confirmNewPassword });
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
                        disabled={isResetPasswordPending} // Use isResetPasswordPending
                    >
                        {isResetPasswordPending ? "Resetting..." : "Reset Password"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
