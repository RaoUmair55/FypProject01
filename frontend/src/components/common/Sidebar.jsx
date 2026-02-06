import XSvg from "../svg/X";
import { MdHomeFilled } from "react-icons/md";
import { IoNotifications } from "react-icons/io5";
import { FaUser, FaTag, FaCalendarAlt, FaBook } from "react-icons/fa";
import { NavLink, Link } from "react-router-dom";
import { BiLogOut } from "react-icons/bi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import 'animate.css';
import api from "../../utils/api";
import useAuthUser from "../../hooks/useAuthUser";
import { useSocket } from "../../context/SocketContext";
import { useEffect } from "react";

// ... imports remain the same

const Sidebar = () => {
	const queryClient = useQueryClient();

	// ... logout mutation remains the same

	const { data: authUser, isLoading: isAuthUserLoading } = useAuthUser();
	const { socket } = useSocket();

	useEffect(() => {
		if (socket) {
			socket.on("newNotification", () => {
				queryClient.invalidateQueries({ queryKey: ["notificationCount"] });
			});
		}
		return () => {
			if (socket) socket.off("newNotification");
		}
	}, [socket, queryClient]);

	const { data: notificationCountData, isLoading: isCountLoading } = useQuery({
		queryKey: ["notificationCount"],
		queryFn: async () => {
			try {
				const res = await api.get("/notifications/number");
				return res.data; // { number: X }
			} catch (error) {
				console.error("Error fetching notification count:", error);
				throw error;
			}
		},
		refetchInterval: 10000,
		// Only enable this query if an authUser exists
		enabled: !!authUser,
	});

	const notificationCount = notificationCountData?.number || 0;

	// Use the authUser data variable that was already defined
	const data = authUser;
	const isLoading = isAuthUserLoading; // Use the loading state for authUser

	if (isLoading) {
		return <div className="p-4 text-center text-gray-600">Loading sidebar...</div>;
	}


	return (
		<div className='md:flex-[4_4_0] w-18 max-w-72 md:w-full md:block sticky top-0 left-0 h-screen'>
			<div className='sticky top-4 left-0 h-[95vh] flex flex-col w-20 md:w-full rounded-3xl glass-panel animate__animated animate__fadeInLeft ml-4 my-2'>
				<Link to='/' className='flex justify-center items-center md:justify-start p-4'>
					<XSvg className='w-10 h-10 fill-white' />
				</Link>

				<ul className='flex flex-col gap-4 mt-4 px-2'>
					<li className='flex justify-center md:justify-start'>
						<NavLink
							to='/'
							className={({ isActive }) =>
								`flex gap-3 items-center rounded-xl p-3 cursor-pointer transition-all duration-300 hover:bg-white/5 ${isActive ? 'text-artistic-primary font-bold bg-white/10' : 'text-artistic-text'
								}`
							}
						>
							<MdHomeFilled className='w-7 h-7' />
							<span className='text-lg hidden md:block'>Home</span>
						</NavLink>
					</li>

					<li className='flex justify-center md:justify-start'>
						<NavLink
							to='/notifications'
							className={({ isActive }) =>
								`flex gap-3 items-center rounded-xl p-3 cursor-pointer transition-all duration-300 hover:bg-white/5 ${isActive ? 'text-artistic-primary font-bold bg-white/10' : 'text-artistic-text'
								}`
							}
						>
							<IoNotifications className='w-7 h-7' />
							<span className='text-lg hidden md:block'>Notifications</span>
							<div className="badge badge-sm badge-secondary hidden md:block">{notificationCount}</div>

						</NavLink>
					</li>

					<li className='flex justify-center md:justify-start'>
						<NavLink
							to={data?._id ? `/profile/${data?._id}` : "#"}
							className={({ isActive }) =>
								`flex gap-3 items-center rounded-xl p-3 cursor-pointer transition-all duration-300 hover:bg-white/5 ${isActive ? 'text-artistic-primary font-bold bg-white/10' : 'text-artistic-text'
								}`
							}
						>
							<FaUser className='w-6 h-6' />
							<span className='text-lg hidden md:block'>Profile</span>
						</NavLink>
					</li>
					<li className='flex justify-center md:justify-start'>
						<NavLink
							to='/marketplace'
							className={({ isActive }) =>
								`flex gap-3 items-center rounded-xl p-3 cursor-pointer transition-all duration-300 hover:bg-white/5 ${isActive ? 'text-artistic-primary font-bold bg-white/10' : 'text-artistic-text'
								}`
							}
						>
							<FaTag className='w-6 h-6' />
							<span className='text-lg hidden md:block'>Marketplace</span>
						</NavLink>
					</li>
					<li className='flex justify-center md:justify-start'>
						<NavLink
							to='/events'
							className={({ isActive }) =>
								`flex gap-3 items-center rounded-xl p-3 cursor-pointer transition-all duration-300 hover:bg-white/5 ${isActive ? 'text-artistic-primary font-bold bg-white/10' : 'text-artistic-text'
								}`
							}
						>
							<FaCalendarAlt className='w-6 h-6' />
							<span className='text-lg hidden md:block'>Events</span>
						</NavLink>
					</li>
					<li className='flex justify-center md:justify-start'>
						<NavLink
							to='/resources'
							className={({ isActive }) =>
								`flex gap-3 items-center rounded-xl p-3 cursor-pointer transition-all duration-300 hover:bg-white/5 ${isActive ? 'text-artistic-primary font-bold bg-white/10' : 'text-artistic-text'
								}`
							}
						>
							<FaBook className='w-6 h-6' />
							<span className='text-lg hidden md:block'>Resources</span>
						</NavLink>
					</li>
					{/* Admin Links */}
					{(authUser?.role === 'admin' || authUser?.role === 'superadmin') && (
						<li className='flex justify-center md:justify-start'>
							<NavLink
								to='/admin/dashboard'
								className={({ isActive }) =>
									`flex gap-3 items-center rounded-xl p-3 cursor-pointer transition-all duration-300 hover:bg-white/5 ${isActive ? 'text-artistic-primary font-bold bg-white/10' : 'text-artistic-text'
									}`
								}
							>
								<MdHomeFilled className='w-7 h-7' />
								<span className='text-lg hidden md:block'>Dashboard</span>
							</NavLink>
						</li>
					)}

					{(authUser?.role === 'admin' || authUser?.role === 'superadmin') && (
						<>
							<li className='flex justify-center md:justify-start'>
								<NavLink
									to='/admin/students'
									className={({ isActive }) =>
										`flex gap-3 items-center rounded-xl p-3 cursor-pointer transition-all duration-300 hover:bg-white/5 ${isActive ? 'text-artistic-primary font-bold bg-white/10' : 'text-artistic-text'
										}`
									}
								>
									<FaUser className='w-6 h-6' />
									<span className='text-lg hidden md:block'>Manage Students</span>
								</NavLink>
							</li>
							<li className='flex justify-center md:justify-start'>
								<NavLink
									to='/admin/posts'
									className={({ isActive }) =>
										`flex gap-3 items-center rounded-xl p-3 cursor-pointer transition-all duration-300 hover:bg-white/5 ${isActive ? 'text-artistic-primary font-bold bg-white/10' : 'text-artistic-text'
										}`
									}
								>
									<MdHomeFilled className='w-7 h-7' />
									<span className='text-lg hidden md:block'>Top Posts</span>
								</NavLink>
							</li>
						</>
					)}

					{authUser?.role === 'superadmin' && (
						<li className='flex justify-center md:justify-start'>
							<NavLink
								to='/admin/create-user'
								className={({ isActive }) =>
									`flex gap-3 items-center rounded-xl p-3 cursor-pointer transition-all duration-300 hover:bg-white/5 ${isActive ? 'text-artistic-primary font-bold bg-white/10' : 'text-artistic-text'
									}`
								}
							>
								<FaUser className='w-6 h-6' />
								<span className='text-lg hidden md:block'>Create Admin</span>
							</NavLink>
						</li>
					)}
				</ul>

				{data && (
					<Link
						to={data._id ? `/profile/${data._id}` : "#"}
						className='mt-auto mb-6 mx-2 flex gap-2 items-center transition-all duration-300 hover:bg-white/5 rounded-xl p-3'
					>
						<div className='avatar hidden md:inline-flex'>
							<div className='w-10 rounded-full border border-artistic-primary/50'>
								<img src={data.profileImg || "/avatar-placeholder.png"} alt='Profile' />
							</div>
						</div>
						<div className='flex justify-between flex-1 text-artistic-text'>
							<div className='hidden md:block'>
								<p className='font-bold text-sm w-24 truncate'>{data.fullName}</p>
								<p className='text-artistic-muted text-xs'>@{data.username}</p>
							</div>
							<BiLogOut
								className='w-6 h-6 cursor-pointer text-artistic-muted hover:text-error'
								onClick={(e) => {
									e.preventDefault();
									logoutMutation();
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
