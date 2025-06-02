import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
// import { USERS_FOR_RIGHT_PANEL } from "../../utils/db/dummy"; // dummy data

import useFollow from "../../hooks/useFollow";

import RightPanelSkeleton from "../skeletons/RightPanelSkeleton";
import LoadingSpinner from "./LoadingSpinner";
import LoadingRing from "./LoadingRing";
import { anonymous } from "../../utils/anonymous";
import { authenticatedFetch } from "../../utils/authenticatedFetch"; // Import the helper

const RightPanel = () => {
    const {data:suggestedUsers, isLoading, isError, error} = useQuery({ // Added isError and error for better handling
        queryKey: ["suggestedUsers"],
        queryFn: async () => {
            try {
                // Use authenticatedFetch for fetching suggested users
                const data = await authenticatedFetch("/api/user/suggested");
                return data;
            } catch (error) {
                console.error("Error fetching suggested users:", error);
                throw error; // Re-throw for react-query to handle
            }
        },
    });

    const {follow, isPending} = useFollow();

    // Handle loading and error states for the entire panel
    if (isLoading) {
        return (
            <div className='hidden lg:block mx-2'>
                <div className='bg-[#fff] border-2 border-gray-300 p-4 rounded-md sticky top-2'>
                    <p className='font-bold text-[#0f1419]'>People you may know</p>
                    <div className='flex flex-col gap-4'>
                        <RightPanelSkeleton />
                        <RightPanelSkeleton />
                        <RightPanelSkeleton />
                        <RightPanelSkeleton />
                    </div>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className='hidden lg:block mx-2'>
                <div className='bg-[#fff] border-2 border-gray-300 p-4 rounded-md sticky top-2'>
                    <p className='font-bold text-[#0f1419]'>People you may know</p>
                    <p className='text-red-500'>Error loading suggestions: {error.message}</p>
                </div>
            </div>
        );
    }

    // Only show the panel if there are suggested users after loading
    if (suggestedUsers?.length === 0) return <div className="md:w-64 w-0"></div>

    return (
        <div className='hidden lg:block mx-2'>
            <div className='bg-[#fff] border-2 border-gray-300 p-4 rounded-md sticky top-2'>
                <p className='font-bold text-[#0f1419]'>People you may know</p>
                <div className='flex flex-col gap-4'>
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
                                            <img src={user.profileImg || "/avatar-placeholder.png"} alt="User Avatar" />
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
                                        className='btn bg-[#1d9bf0] text-white hover:bg-[#1a8cd8] rounded-full btn-sm'
                                        onClick={(e) => {
                                            e.preventDefault(); // Prevent navigation when clicking follow button
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
