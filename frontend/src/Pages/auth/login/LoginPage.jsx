import { useState } from "react";
import { Link } from "react-router-dom";

import XSvg from "../../../components/svg/X";

import { MdOutlineMail } from "react-icons/md";
import { MdPassword } from "react-icons/md";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast"

const LoginPage = () => {
	const [formData, setFormData] = useState({
		email: "",
		password: "",
	});
	const queryClient = useQueryClient()
	const {mutate:loginMutation, isPending, isError,  error} = useMutation({
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
				// console.log(data)

				return data
			} catch (error) {
				throw new Error(error)
			}
		},
		onSuccess: () => {
			// toast.success("Log-in successful")
			// refetch the auth user
			queryClient.invalidateQueries({queryKey: ['authUser']});
		}
	})

	const handleSubmit = (e) => {
		e.preventDefault();
		// console.log(formData);
		loginMutation(formData)
	};

	const handleInputChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	// const isError = false;

	return (
		<>
		<div className="absolute w-[300px] h-[300px] bg-white opacity-30 rounded-full blur-[120px] top-10 left-60 z-0"></div>
		<div className="absolute w-[300px] h-[300px] bg-white opacity-30 rounded-full blur-[120px] top-70 right-60 z-0"></div>

		<div className='card lg:card-side bg-[#f8f9fd] shadow-sm mx-auto my-40 flex p-10 rounded-lg border-2 border-[#a8cbff] shadow-[#153a54]'>

			<div className='flex-1 hidden border-r-1 border-[#153a54] lg:flex items-center justify-center'>
				<XSvg className='logo lg:w-4/3 fill-white' />
			</div>
			<div className=' flex-1 flex flex-col justify-center items-center '>
      <form className="dw-2xs max-w-10xl mx-auto flex flex-col gap-4" onSubmit={handleSubmit}>
					<XSvg className='w-24 lg:hidden fill-white mx-auto' />
					<h1 className='text-4xl font-extrabold text-[#153a54]'>{"Let's"} go.</h1>
					<label className='input input-bordered rounded flex items-center gap-2 bg-[#153a54]'>
						<MdOutlineMail className="text-[#f8f9fd]" />
						<input
							type='text'
							className='grow'
							placeholder='student@gmail.com'
							name='email'
							onChange={handleInputChange}
							value={formData.email}
						/>
					</label>

					<label className='input input-bordered rounded flex items-center gap-2 bg-[#153a54]'>
						<MdPassword className="text-[#f8f9fd]"/>
						<input
							type='password'
							className='grow'
							placeholder='Password'
							name='password'
							onChange={handleInputChange}
							value={formData.password}
						/>
					</label>
					<button className='btn rounded-2xl bg-[#dff2fe] text-[#153a54]'>
						{isPending? "Loading...": "Login"}
					</button>
					{isError && <p className='text-red-500'>
						{error.message}
						</p>}
				</form>
				<div className='flex flex-col gap-2 mt-4'>
					<p className='text-[#153a54] text-lg'>{"Don't"} have an account?</p>
					<Link to='/signup'>
						<button className='btn rounded-2xl bg-[#dff2fe] text-[#153a54] w-full'>Sign up</button>
					</Link>
				</div>
			</div>
		</div>
		</>
	);
};
export default LoginPage;