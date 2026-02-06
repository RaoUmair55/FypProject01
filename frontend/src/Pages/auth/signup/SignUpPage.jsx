import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

import XSvg from "../../../components/svg/X";

import { MdOutlineMail } from "react-icons/md";
import { FaUser } from "react-icons/fa";
import { MdPassword } from "react-icons/md";
import { MdDriveFileRenameOutline } from "react-icons/md";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "../../../utils/api";
// Import authenticatedFetch, though it's not used directly for signup
// as signup is typically an unauthenticated endpoint.


const SignUpPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: "",
        username: "",
        fullName: "",
        password: "",
    });

    // const BACKEND_URL = "https://fypproject01.onrender.com";

    // useMutation to manipulate the data (create, update, delete)
    // useQuery to fetch the data
    const { mutate, isPending, isError, error } = useMutation({
        mutationFn: async ({ email, username, fullName, password }) => {
            try {
                const res = await api.post("/auth/signup", { email, username, fullName, password });

                console.log(res.data);

                return res.data;
            } catch (error) {
                console.error("Error during signup mutation:", error);
                toast.error(error.message);
                throw error; // Re-throw for react-query to handle
            }
        },
        onSuccess: (data) => {
            toast.success("Account created! Check email for OTP.");
            navigate("/verify", { state: { email: formData.email } }); // Navigate to OTP page
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault(); // to prevent the page from reloading
        mutate(formData);
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="flex justify-center items-center min-h-screen relative overflow-hidden">
            {/* Ambient Background Elements */}
            <div className="absolute w-[500px] h-[500px] bg-artistic-secondary/20 rounded-full blur-[120px] top-[-100px] right-[-100px] animate-pulse"></div>
            <div className="absolute w-[500px] h-[500px] bg-artistic-primary/20 rounded-full blur-[120px] bottom-[-100px] left-[-100px] animate-pulse"></div>

            <div className="glass-panel lg:w-2/3 max-w-5xl mx-auto flex rounded-3xl overflow-hidden shadow-2xl border-gray-800/50 relative z-10 m-4">
                {/* Left Side - Visual */}
                <div className="flex-1 hidden lg:flex items-center justify-center bg-[#181A20] relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-artistic-secondary/10 to-transparent"></div>
                    <XSvg className="w-2/3 fill-white relative z-10 drop-shadow-2xl animate-float" />
                </div>

                {/* Right Side - Form */}
                <div className="flex-1 flex flex-col justify-center items-center p-8 md:p-12 bg-[#0F1115]/80">
                    <form className="w-full max-w-md flex flex-col gap-6" onSubmit={handleSubmit}>
                        <div className="lg:hidden flex justify-center mb-4">
                            <XSvg className="w-20 fill-white" />
                        </div>

                        <div>
                            <h1 className="text-4xl font-extrabold text-white font-heading mb-2">Join CampusBuzzz.</h1>
                            <p className="text-artistic-muted">Create your account to connect.</p>
                        </div>

                        <div className="flex flex-col gap-4">
                            {/* Email */}
                            <label className="input-artistic flex items-center gap-3 p-3">
                                <MdOutlineMail className="text-artistic-muted w-5 h-5" />
                                <input
                                    type="email"
                                    className="grow bg-transparent border-none outline-none text-white placeholder-gray-500"
                                    placeholder="student@gmail.com"
                                    name="email"
                                    onChange={handleInputChange}
                                    value={formData.email}
                                />
                            </label>

                            {/* Username and Full Name */}
                            <div className="flex gap-4">
                                <label className="input-artistic flex items-center gap-3 p-3 flex-1">
                                    <FaUser className="text-artistic-muted w-5 h-5" />
                                    <input
                                        type="text"
                                        className="grow bg-transparent border-none outline-none text-white placeholder-gray-500 w-full"
                                        placeholder="Username"
                                        name="username"
                                        onChange={handleInputChange}
                                        value={formData.username}
                                    />
                                </label>
                                <label className="input-artistic flex items-center gap-3 p-3 flex-1">
                                    <MdDriveFileRenameOutline className="text-artistic-muted w-5 h-5" />
                                    <input
                                        type="text"
                                        className="grow bg-transparent border-none outline-none text-white placeholder-gray-500 w-full"
                                        placeholder="Full Name"
                                        name="fullName"
                                        onChange={handleInputChange}
                                        value={formData.fullName}
                                    />
                                </label>
                            </div>

                            {/* Password */}
                            <label className="input-artistic flex items-center gap-3 p-3">
                                <MdPassword className="text-artistic-muted w-5 h-5" />
                                <input
                                    type="password"
                                    className="grow bg-transparent border-none outline-none text-white placeholder-gray-500"
                                    placeholder="Password"
                                    name="password"
                                    onChange={handleInputChange}
                                    value={formData.password}
                                />
                            </label>
                        </div>

                        {/* Sign Up Button */}
                        <button className="btn btn-primary rounded-xl text-white w-full h-12 text-lg shadow-lg hover:shadow-artistic-secondary/40 transition-all duration-300" disabled={isPending}>
                            {isPending ? <span className="loading loading-spinner"></span> : "Sign Up"}
                        </button>
                        {isError && <p className="text-error text-sm text-center bg-error/10 p-2 rounded">{error.message}</p>}
                    </form>

                    {/* Already have account */}
                    <div className="flex flex-col gap-2 mt-8 w-full max-w-md text-center">
                        <p className="text-artistic-muted">
                            Already have an account?{" "}
                            <Link to="/login" className="text-artistic-primary font-bold hover:underline">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default SignUpPage;