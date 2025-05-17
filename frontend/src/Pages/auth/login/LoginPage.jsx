import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import XSvg from "../../../components/svg/X";
import { MdOutlineMail, MdPassword } from "react-icons/md";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

const LoginPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const { mutate: loginMutation, isPending: isLoginPending, isError: isLoginError, error: loginError } = useMutation({
    mutationFn: async ({ email, password }) => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      return data;
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
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed");
      return data;
    },
    onSuccess: () => {
      toast.success("Verification email sent");
      navigate("/verify", { state: { email: formData.email } });
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
      toast.error("Please enter your email first");
      return;
    }
    verifyEmailMutation.mutate({ email: formData.email });
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <>
      <div className="absolute w-[300px] h-[300px] bg-white opacity-30 rounded-full blur-[120px] top-10 left-60 z-0"></div>
      <div className="absolute w-[300px] h-[300px] bg-white opacity-30 rounded-full blur-[120px] top-[280px] right-60 z-0"></div>

      <div className="card lg:card-side bg-[#f8f9fd] shadow-sm mx-auto my-40 flex p-10 rounded-lg border-2 border-[#a8cbff] shadow-[#153a54]">
        <div className="flex-1 hidden border-r border-[#153a54] lg:flex items-center justify-center">
          <XSvg className="logo lg:w-4/3 fill-white" />
        </div>
        <div className="flex-1 flex flex-col justify-center items-center">
          <form className="dw-2xs max-w-10xl mx-auto flex flex-col gap-4" onSubmit={handleSubmit}>
            <XSvg className="w-24 lg:hidden fill-white mx-auto" />
            <h1 className="text-4xl font-extrabold text-[#153a54]">{"Let's"} go.</h1>

            <label className="input input-bordered rounded flex items-center gap-2 bg-[#153a54]">
              <MdOutlineMail className="text-[#f8f9fd]" />
              <input
                type="text"
                className="grow"
                placeholder="student@gmail.com"
                name="email"
                onChange={handleInputChange}
                value={formData.email}
              />
            </label>

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

            <button className="btn rounded-2xl bg-[#dff2fe] text-[#153a54]" disabled={isLoginPending}>
              {isLoginPending ? "Logging in..." : "Login"}
            </button>

            {isLoginError && <p className="text-red-500">{loginError.message}</p>}
          </form>

          <div className="flex flex-col gap-2 mt-4">
            <button
              className="text-[#153a54] text-lg text-left underline hover:text-blue-700"
              onClick={verifyEmail}
              disabled={verifyEmailMutation.isPending}
            >
              {verifyEmailMutation.isPending ? "Sending..." : "Verify Your Email"}
            </button>

            <p className="text-[#153a54] text-lg">{"Don't"} have an account?</p>

            <Link to="/signup" className="btn rounded-2xl bg-[#dff2fe] text-[#153a54] w-full text-center">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
