import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import XSvg from "../../../components/svg/X";
import { MdOutlineMail, MdPassword } from "react-icons/md";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import api from "../../../utils/api";


const LoginPage = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    // Define the backend URL using the environment variable
    // const BACKEND_URL ="https://fypproject01.onrender.com"; // Handled by api.js baseURL

    const { mutate: loginMutation, isPending: isLoginPending, isError: isLoginError, error: loginError } = useMutation({
        mutationFn: async ({ email, password }) => {
            try {
                const res = await api.post("/auth/login", { email, password });
                // Cookie is set automatically
                return res.data;
            } catch (err) {
                console.error("Error during login mutation:", err);
                throw err;
            }
        },
        onSuccess: () => {
            toast.success("Login successful");
            queryClient.invalidateQueries({ queryKey: ["authUser"] });
        },
        onError: (err) => {
            toast.error(err.message);
        }
    });

    const verifyEmailMutation = useMutation({
        mutationFn: async ({ email }) => {
            try {
                const res = await api.post("/auth/resend-otp", { email });
                return res.data;
            } catch (err) {
                console.error("Error during verify email mutation:", err);
                throw err;
            }
        },
        onSuccess: () => {
            toast.success("Verification email sent");
            navigate("/verify", { state: { email: formData.email } });
        },
        onError: (err) => {
            toast.error(err.message);
        }
    });

    const resetPasswordMutation = useMutation({
        mutationFn: async ({ email }) => {
            try {
                const res = await api.post("/auth/forgetPassword", { email });
                return res.data;
            } catch (err) {
                console.error("Error during reset password mutation:", err);
                throw err;
            }
        },
        onSuccess: () => {
            toast.success("Reset password email sent");
            navigate("/resetPassword", { state: { email: formData.email } });
            setFormData({ email: "", password: "" });
        },
        onError: (err) => {
            toast.error(err.message);
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        loginMutation(formData);
    };

    const verifyEmail = () => {
        if (!formData.email) {
            toast.error("Please enter your email");
            return;
        }
        verifyEmailMutation.mutate({ email: formData.email });
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="flex justify-center items-center min-h-screen relative overflow-hidden">
            {/* Ambient Background Elements */}
            <div className="absolute w-[500px] h-[500px] bg-artistic-primary/20 rounded-full blur-[120px] top-[-100px] left-[-100px] animate-pulse"></div>
            <div className="absolute w-[500px] h-[500px] bg-artistic-secondary/20 rounded-full blur-[120px] bottom-[-100px] right-[-100px] animate-pulse"></div>

            <div className="glass-panel lg:w-2/3 max-w-5xl mx-auto flex rounded-3xl overflow-hidden shadow-2xl border-gray-800/50 relative z-10 m-4">
                {/* Left Side - Visual */}
                <div className="flex-1 hidden lg:flex items-center justify-center bg-[#181A20] relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-artistic-primary/10 to-transparent"></div>
                    <XSvg className="w-2/3 fill-white relative z-10 drop-shadow-2xl animate-float" />
                </div>

                {/* Right Side - Form */}
                <div className="flex-1 flex flex-col justify-center items-center p-8 md:p-12 bg-[#0F1115]/80">
                    <form className="w-full max-w-md flex flex-col gap-6" onSubmit={handleSubmit}>
                        <div className="lg:hidden flex justify-center mb-4">
                            <XSvg className="w-20 fill-white" />
                        </div>

                        <div>
                            <h1 className="text-4xl font-extrabold text-white font-heading mb-2">Welcome Back.</h1>
                            <p className="text-artistic-muted">Enter your details to access your account.</p>
                        </div>

                        <div className="flex flex-col gap-4">
                            <label className="input-artistic flex items-center gap-3 p-3">
                                <MdOutlineMail className="text-artistic-muted w-5 h-5" />
                                <input
                                    type="text"
                                    className="grow bg-transparent border-none outline-none text-white placeholder-gray-500"
                                    placeholder="email@example.com"
                                    name="email"
                                    onChange={handleInputChange}
                                    value={formData.email}
                                />
                            </label>

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

                        <button className="btn btn-primary rounded-xl text-white w-full h-12 text-lg shadow-lg hover:shadow-artistic-primary/40 transition-all duration-300" disabled={isLoginPending}>
                            {isLoginPending ? <span className="loading loading-spinner"></span> : "Login"}
                        </button>

                        {isLoginError && <p className="text-error text-sm text-center bg-error/10 p-2 rounded">{loginError.message}</p>}
                    </form>

                    <div className="flex flex-col gap-4 mt-8 w-full max-w-md text-center">
                        <button
                            className="text-artistic-primary text-sm hover:underline hover:text-artistic-accent transition-colors"
                            onClick={verifyEmail}
                            disabled={verifyEmailMutation.isPending}
                        >
                            {verifyEmailMutation.isPending ? "Sending..." : "Verify Your Email"}
                        </button>

                        <div className="divider divider-neutral text-artistic-muted text-sm">Review</div>

                        <div
                            className="text-artistic-muted text-sm hover:text-white cursor-pointer transition-colors"
                            onClick={() => resetPasswordMutation.mutate({ email: formData.email })}>
                            {resetPasswordMutation.isPending ? "Sending..." : "Forgot Password?"}
                        </div>

                        <p className="text-artistic-muted mt-2">
                            Don't have an account?{" "}
                            <Link to="/signup" className="text-artistic-secondary font-bold hover:underline">
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;