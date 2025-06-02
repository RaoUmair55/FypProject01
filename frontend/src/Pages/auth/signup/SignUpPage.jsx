import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

import XSvg from "../../../components/svg/X";

import { MdOutlineMail } from "react-icons/md";
import { FaUser } from "react-icons/fa";
import { MdPassword } from "react-icons/md";
import { MdDriveFileRenameOutline } from "react-icons/md";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
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

    // Define the backend URL using the environment variable
    const BACKEND_URL = "https://fypproject01.onrender.com";

    // useMutation to manipulate the data (create, update, delete)
    // useQuery to fetch the data
    const { mutate, isPending, isError, error } = useMutation({
        mutationFn: async ({ email, username, fullName, password }) => {
            try {
                // Use the full backend URL for the signup API call
                // This is correct as signup is typically an unauthenticated endpoint.
                const res = await fetch(`${BACKEND_URL}/api/auth/signup`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ email, username, fullName, password })
                });

                const data = await res.json();
                if (!res.ok) {
                    // Check for res.ok first, then data.error
                    throw new Error(data.error || "Signup failed");
                }
                
                console.log(data);
                
                return data;
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
        <>
            <div className="absolute w-[300px] h-[300px] bg-[#153a5497] rounded-full blur-[120px] top-10 left-60 z-0"></div>
            <div className="absolute w-[300px] h-[300px] bg-[#153a5497] rounded-full blur-[120px] top-70 right-60 z-0"></div>

            <div className="card lg:card-side bg-[#f8f9fd] shadow-sm mx-auto my-20 flex items-center justify-center gap-10 px-16 py-10 rounded-lg shadow-[#153a54]">
                <div className="flex-1 hidden lg:flex items-center justify-center ">
                    <XSvg className="lg:w-80 fill-white " />
                </div>
                <div className="flex-1 flex flex-col justify-center items-center">
                    <form className="w-2xs max-w-10xl mx-auto flex flex-col gap-4 " onSubmit={handleSubmit}>
                        <XSvg className="w-24 lg:hidden fill-white mx-auto" />
                        <h1 className="text-4xl font-extrabold text-[#153a54] text-center">Join today.</h1>
                        {/* Email */}
                        <label className="input input-bordered rounded flex items-center gap-2 bg-[#153a54]">
                            <MdOutlineMail className="text-[#f8f9fd]" />
                            <input
                                type="email"
                                className="grow"
                                placeholder="student@gmail.com"
                                name="email"
                                onChange={handleInputChange}
                                value={formData.email}
                            />
                        </label>

                        {/* Username and Full Name */}
                        <label className="input input-bordered rounded flex items-center gap-2 bg-[#153a54]">
                            <FaUser className="text-[#f8f9fd]" />
                            <input
                                type="text"
                                className="grow"
                                placeholder="Username"
                                name="username"
                                onChange={handleInputChange}
                                value={formData.username}
                            />
                        </label>
                        <label className="input input-bordered rounded flex items-center gap-2 bg-[#153a54]">
                            <MdDriveFileRenameOutline className="text-[#f8f9fd]" />
                            <input
                                type="text"
                                className="grow"
                                placeholder="Full Name"
                                name="fullName"
                                onChange={handleInputChange}
                                value={formData.fullName}
                            />
                        </label>

                        {/* Password */}
                        <label className="input input-bordered rounded flex items-center gap-2 bg-[#153a54]">
                            <MdPassword className="text-[#f8f9fd]" />
                            <input
                                type="password"
                                className="grow"
                                placeholder="Password"
                                name="password"
                                onChange={handleInputChange}
                                value={formData.password}
                            />
                        </label>

                        {/* Sign Up Button */}
                        <button className="btn rounded-full bg-[#dff2fe] text-[#153a54]" disabled={isPending}>
                            {isPending ? "Loading..." : "Sign Up"}
                        </button>
                        {isError && <p className="text-red-500 text-center">{error.message}</p>}
                    </form>

                    {/* Already have account */}
                    <div className="w-full max-w-sm md:max-w-md lg:w-2/3 flex flex-col gap-2 mt-4 items-center">
                        <p className="text-[#153a54] text-lg text-center">Already have an account?</p>
                        <Link to="/login" className="w-full">
                            <button className="btn bg-[#dff2fe] text-[#153a54] rounded-full w-full">Sign in</button>
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
};
export default SignUpPage;