import { useState } from "react";
import { Link } from "react-router-dom";

import XSvg from "../../../components/svg/X";

import { MdOutlineMail } from "react-icons/md";
import { MdPassword } from "react-icons/md";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast"

const LoginPage = () => {
	const [formData, setFormData] = useState({
		email: "",
		password: "",
	});

	const {mutate:loginMutation, isError, isPending, error} = useMutation({
		mutationFn: async ({email, password}) => {
			try {
				const res = await fetch("/api/auth/login",	{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({email, password}),
				});

				const data = await res.json();
				if (!res.ok) throw new Error(data.error);
				if (data.error) throw new Error(data.error);
				console.log(data)

				return data
			} catch (error) {
				throw new Error(error)
			}
		},
		onSuccess: () => {
			toast.success("Log-in successful")
		}
	})

	const handleSubmit = (e) => {
		e.preventDefault();
		console.log(formData);
		loginMutation(formData)
	};

	const handleInputChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	// const isError = false;

	return (
		<div className='max-w-screen-xl mx-auto my-40 flex gap-20 bg-black p-10 rounded-lg'>
			<div className='flex-1 hidden border-r-1 lg:flex items-center  justify-center'>
				<XSvg className='lg:w-2/3 fill-white' />
			</div>
			<div className='flex-1 flex flex-col justify-center items-center'>
      <form className="w-2xs max-w-10xl mx-auto flex flex-col gap-4" onSubmit={handleSubmit}>
					<XSvg className='w-24 lg:hidden fill-white mx-auto' />
					<h1 className='text-4xl font-extrabold text-white'>{"Let's"} go.</h1>
					<label className='input input-bordered rounded flex items-center gap-2'>
						<MdOutlineMail />
						<input
							type='text'
							className='grow'
							placeholder='Email'
							name='email'
							onChange={handleInputChange}
							value={formData.email}
						/>
					</label>

					<label className='input input-bordered rounded flex items-center gap-2'>
						<MdPassword />
						<input
							type='password'
							className='grow'
							placeholder='Password'
							name='password'
							onChange={handleInputChange}
							value={formData.password}
						/>
					</label>
					<button className='btn rounded-full btn-primary text-white'>
						{isPending? "Loading...": "Login"}
					</button>
					{isError && <p className='text-red-500'>
						{error.message}
						</p>}
				</form>
				<div className='flex flex-col gap-2 mt-4'>
					<p className='text-white text-lg'>{"Don't"} have an account?</p>
					<Link to='/signup'>
						<button className='btn rounded-full border-neutral-50 text-white btn-outline w-full'>Sign up</button>
					</Link>
				</div>
			</div>
		</div>
	);
};
export default LoginPage;