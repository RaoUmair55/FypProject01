import XSvg from "../svg/X";
import { MdHomeFilled } from "react-icons/md";
import { IoNotifications } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import { NavLink, Link } from "react-router-dom";
import { BiLogOut } from "react-icons/bi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import 'animate.css';
import { authenticatedFetch } from "../../utils/authenticatedFetch"; // Import the helper

const Sidebar = () => {
    const queryClient = useQueryClient();

    // Logout mutation
    const {
        mutate: logoutMutation,
        isPending: isLoggingOut, // Renamed to avoid conflict with general isLoading
        isError: isLogoutError,
        error: logoutError,
    } = useMutation({
        mutationFn: async () => {
            try {
                // Use authenticatedFetch for logout
                // authenticatedFetch handles the response.ok check and error parsing
                const res = await authenticatedFetch("/api/auth/logout", {
                    method: "POST",
                });
                return res; // Assuming res is just a success indicator
            } catch (err) {
                console.error("Error during logout mutation:", err);
                throw err; // Re-throw for react-query to handle
            }
        },
        onSuccess: () => {
            // Clear the token from localStorage on successful logout
            localStorage.removeItem("jwt_token");
            queryClient.invalidateQueries({ queryKey: ["authUser"] });
            toast.success("Logout successful");
            // No explicit navigate here, App.jsx handles redirect based on authUser
        },
        onError: (error) => {
            toast.error(error.message || "Couldn't logout");
        },
    });

    const { data: authUser, isLoading: isAuthUserLoading } = useQuery({ queryKey: ["authUser"] });

    const { data: notificationCountData, isLoading: isCountLoading } = useQuery({
        queryKey: ["notificationCount"],
        queryFn: async () => {
            try {
                // Use authenticatedFetch for notifications count
                const data = await authenticatedFetch("/api/notifications/number");
                return data; // { number: X }
            } catch (error) {
                console.error("Error fetching notification count:", error);
                throw error; // Re-throw for react-query to handle
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
		<div className='md:flex-[4_4_0] w-18 max-w-72 md:w-full md:block sticky top-0 left-0 '>
			<div className='sticky top-0 left-0 height-self flex flex-col border-2 border-gray-300 w-20 md:w-full rounded-2xl bg-white shadow-2xl shadow-gray-300 animate__animated animate__fadeInLeft'>
				<Link to='/' className='flex justify-center items-center md:justify-start bg-[#ecf1fc] rounded-t-2xl'>
					<XSvg className='px-2 w-32 rounded-full fill-white' />
				</Link>

				<ul className='flex flex-col gap-3 mt-4 p-4'>
					<li className='flex justify-center md:justify-start'>
						<NavLink
							to='/'
							className={({ isActive }) =>
								`flex gap-3 items-center rounded-2xl py-2 pl-2 pr-4 max-w-fit cursor-pointer ${
									isActive ? 'bg-[#dff2fe] text-[#153a54]' : 'hover:bg-[#dff2fe] text-[#153a54]'
								}`
							}
						>
							<MdHomeFilled className='w-8 h-8 text-[#0f1419]' />
							<span className='text-lg hidden md:block'>Home</span>
						</NavLink>
					</li>

					<li className='flex justify-center md:justify-start'>
						<NavLink
							to='/notifications'
							className={({ isActive }) =>
								`flex gap-3 items-center rounded-2xl py-2 pl-2 pr-4 max-w-fit cursor-pointer ${
									isActive ? 'bg-[#dff2fe] text-[#153a54]' : 'hover:bg-[#dff2fe] text-[#153a54]'
								}`
							}
						>
							<IoNotifications className='w-6 h-6 text-[#0f1419]' />
							<span className='text-lg hidden md:block'>Notifications </span>
							<div className="badge badge-sm hidden md:block">{notificationCount}</div>

						</NavLink>
					</li>

					<li className='flex justify-center md:justify-start'>
						<NavLink
							to={data?._id ? `/profile/${data._id}` : "#"}
							className={({ isActive }) =>
								`flex gap-3 items-center rounded-2xl py-2 pl-2 pr-4 max-w-fit cursor-pointer ${
									isActive ? 'bg-[#dff2fe] text-[#153a54]' : 'hover:bg-[#dff2fe] text-[#153a54]'
								}`
							}
						>
							<FaUser className='w-6 h-6 text-[#0f1419]' />
							<span className='text-lg hidden md:block'>Profile</span>
						</NavLink>
					</li>
				</ul>

				{data && (
					<Link
						to={data.username ? `/profile/${data.username}` : "#"}
						className='mt-auto mb-10 mx-4 flex gap-2 items-start transition-all duration-300 bg-[#dff2fe] rounded-2xl py-2 px-4'
					>
						<div className='avatar hidden md:inline-flex'>
							<div className='w-8 rounded-full'>
								<img src={data.profileImg || "/avatar-placeholder.png"} alt='Profile' />
							</div>
						</div>
						<div className='flex justify-between flex-1 text-[#153a54]'>
							<div className='hidden md:block'>
								<p className='text-[#153a54] font-bold text-sm w-20 truncate'>{data.fullName}</p>
								<p className='text-slate-500 text-sm'>@{data.username}</p>
							</div>
							<BiLogOut
								className='w-5 h-5 cursor-pointer'
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
