import { Link } from "react-router-dom";
import { useState } from "react";

import XSvg from "../../../components/svg/X";

import { MdOutlineMail } from "react-icons/md";
import { FaUser } from "react-icons/fa";
import { MdPassword } from "react-icons/md";
import { MdDriveFileRenameOutline } from "react-icons/md";

const SignUpPage = () => {
	const [formData, setFormData] = useState({
		email: "",
		username: "",
		fullName: "",
		password: "",
	});

	const handleSubmit = (e) => {
		e.preventDefault();
		console.log(formData);
	};

	const handleInputChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const isError = false;

	return (
    <div className="max-w-screen-xl mx-auto my-20 flex items-center justify-center gap-40 px-8 bg-black py-10 rounded-lg shadow-neutral-500">
      <div className="flex-1 hidden lg:flex items-center justify-center">
        <XSvg className="lg:w-50 fill-white" />
      </div>
      <div className="flex-1 flex flex-col justify-center items-center "> 
        <form className="w-2xs max-w-10xl mx-auto flex flex-col gap-4 " onSubmit={handleSubmit}>

					<XSvg className="w-24 lg:hidden fill-white mx-auto" />
					<h1 className="text-4xl font-extrabold text-white text-center">Join today.</h1>

					{/* Email */}
					<label className="input input-bordered rounded flex items-center gap-2">
						<MdOutlineMail />
						<input
							type="email"
							className="grow"
							placeholder="Email"
							name="email"
							onChange={handleInputChange}
							value={formData.email}
						/>
					</label>

					{/* Username and Full Name */}
					
						<label className="input input-bordered rounded flex items-center gap-2">
							<FaUser />
							<input
								type="text"
								className="grow"
								placeholder="Username"
								name="username"
								onChange={handleInputChange}
								value={formData.username}
							/>
						</label>
						<label className="input input-bordered rounded flex items-center gap-2">
							<MdDriveFileRenameOutline />
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
					<label className="input input-bordered rounded flex items-center gap-2">
						<MdPassword />
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
					<button className="btn rounded-full btn-primary text-white">Sign up</button>
					{isError && <p className="text-red-500 text-center">Something went wrong</p>}
				</form>

				{/* Already have account */}
				<div className="w-full max-w-sm md:max-w-md lg:w-2/3 flex flex-col gap-2 mt-4 items-center">
					<p className="text-white text-lg text-center">Already have an account?</p>
					<Link to="/login" className="w-full">
						<button className="btn rounded-full btn-primary text-white btn-outline w-full">Sign in</button>
					</Link>
				</div>
			</div>
		</div>
	);
};
export default SignUpPage;
