import XSvg from "../svg/X";

import { MdHomeFilled } from "react-icons/md";
import { IoNotifications } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import { Link } from "react-router-dom";
import { BiLogOut } from "react-icons/bi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const Sidebar = () => {

	const queryClient = useQueryClient();
	
	// logging out the user
	const {mutate:logoutMutation, isPending, isError, error} = useMutation({
		mutationFn: async () => {
			try {
				const res = await fetch("api/auth/logout", {
					method: "POST",
				})
				const data = await res.json();

				if (!res.ok){
					throw new Error(data.error || "Something went wrong")
				}
			} catch (error) {
				throw new Error(error)
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["authUser"] });
			toast.success("Logout successful");
		},
		onError: () => {
			toast.error("Couldn't logout")
		}
	})

	// const data = {						// sample info
	// 	fullName: "John Doe",
	// 	username: "johndoe",
	// 	profileImg: "/avatars/boy1.png",
	// };
  const {data} = useQuery({queryKey: ["authUser"]});

	return (
		<div className='md:flex-[4_4_0] w-18 max-w-72 md:w-full md:block '>
			<div className='sticky top-0 left-0 height-self  flex flex-col border-2 border-gray-800 w-20 md:w-full rounded-2xl bg-[#153a542c] p-4 shadow-2xl shadow-white'>
				<Link to='/' className='flex justify-center items-center md:justify-start'>
					<XSvg className='px-2 w-32 rounded-full fill-white' />
				</Link>
				<ul className='flex flex-col gap-3 mt-4'>
					<li className='flex justify-center md:justify-start'>
						<Link
							to='/'
							className='flex gap-3 items-center bg-[#dff2fe] text-[#153a54] font-medium transition-all rounded-2xl duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer'
						>
							<MdHomeFilled className='w-8 h-8 text-[#0f1419]' />
							<span className=' text-lg hidden text-[#0f1419] md:block'>Home</span>
						</Link>
					</li>
					<li className='flex justify-center md:justify-start'>
						<Link
							to='/notifications'
							className='flex gap-3 items-center hover:bg-[#dff2fe] text-[#153a54] transition-all rounded-2xl duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer'
						>
							<IoNotifications className='w-6 h-6 text-[#0f1419] ' />
							<span className='text-lg  hidden md:block'>Notifications</span>
						</Link>
					</li>

					<li className='flex justify-center md:justify-start'>
						<Link
							to={`/profile/${data?.username}`}
							className='flex gap-3 items-center hover:bg-[#dff2fe] text-[#0f1419] transition-all rounded-2xl duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer'
						>
							<FaUser className='w-6 h-6 text-[#0f1419]' />
							<span className='text-lg hidden md:block '>Profile</span>
						</Link>
					</li>
				</ul>
				{data && (
					<Link
						to={`/profile/${data.username}`}
						className='mt-auto mb-10 flex gap-2 items-start transition-all duration-300 bg-[#dff2fe] rounded-2xl py-2 px-4 '
					>
						<div className='avatar hidden md:inline-flex'>
							<div className='w-8 rounded-full'>
								<img src={data?.profileImg || "/avatar-placeholder.png"} />
							</div>
						</div>
						<div className='flex justify-between flex-1 text-[#153a54]'>
							<div className='hidden md:block'>
								<p className='text-[#153a54] font-bold text-sm w-20 truncate '>{data?.fullName}</p>
								<p className='text-slate-500 text-sm'>@{data?.username}</p>
							</div>
							<BiLogOut className='w-5 h-5 cursor-pointer' 
								onClick={(e) => {
									e.preventDefault();
									logoutMutation()
								}}
							/>
						</div>
					</Link>
				)}
			</div>
		</div>
	);
};
export default Sidebar;