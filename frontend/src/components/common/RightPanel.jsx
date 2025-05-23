import { Link } from "react-router-dom";
import {useQuery} from "@tanstack/react-query";
// import { USERS_FOR_RIGHT_PANEL } from "../../utils/db/dummy";		// dummy data

import useFollow from "../../hooks/useFollow";

import RightPanelSkeleton from "../skeletons/RightPanelSkeleton";
import LoadingSpinner from "./LoadingSpinner";
import LoadingRing from "./LoadingRing";
import { anonymous } from "../../utils/anonymous";

const RightPanel = () => {
	// const isLoading = false;
	const {data:suggestedUsers, isLoading} = useQuery({
		queryKey: ["suggestedUsers"],
		queryFn: async () => {
			try {
				const res = await fetch("/api/user/suggested");
				const data = res.json();
				if (!res.ok) {
					throw new Error(data.error || "Something went wrong");
				}
				// console.log(data);
				return data;
			} catch (error) {
				throw new Error(error.message)
			}
		}
	})

	const {follow, isPending} = useFollow()

	if (suggestedUsers?.length === 0) return <div className="md:w-64 w-0"></div>

	return (
		<div className='hidden lg:block my-4 mx-2'>
			<div className='bg-[#fff] border-2 border-gray-300 p-4 rounded-md sticky top-2'>
				<p className='font-bold text-[#0f1419]'>Who to follow</p>
				<div className='flex flex-col gap-4'>
					{/* item */}
					{isLoading && (
						<> 
							<RightPanelSkeleton />
							<RightPanelSkeleton />
							<RightPanelSkeleton />
							<RightPanelSkeleton />
						</>
					)}
					{!isLoading &&
						suggestedUsers?.map((user) => (
							<Link
								to={`/profile/${user._id}`}
								className='flex items-center text-[#0f1419] justify-between gap-4'
								key={user._id}
							>
								<div className='flex gap-2 items-center'>
									<div className='avatar'>
										<div className='w-8 rounded-full'>
											<img src={user.profileImg || "/avatar-placeholder.png"} />
										</div>
									</div>
									<div className='flex flex-col'>
										<span className='font-semibold tracking-tight truncate w-28'>
											{user.fullName}
										</span>
										<span className='text-sm text-slate-500'>@{user.university}</span>
									</div>
								</div>
								<div>
									<button
										className='btn bg-[#1d9bf0] text-white hover:bg-[#1a8cd8]  rounded-full btn-sm'
										onClick={(e) => {
											e.preventDefault();
											follow(user._id);
										}}
									>
										{isPending ? <LoadingRing size='sm' /> : "Follow"}
									</button>
								</div>
							</Link>
						))}
				</div>
			</div>
		</div>
	);
};
export default RightPanel;