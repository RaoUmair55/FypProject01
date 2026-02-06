import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
// import { USERS_FOR_RIGHT_PANEL } from "../../utils/db/dummy"; // dummy data

import useFollow from "../../hooks/useFollow";

import RightPanelSkeleton from "../skeletons/RightPanelSkeleton";
import LoadingSpinner from "./LoadingSpinner";
import LoadingRing from "./LoadingRing";
import { anonymous } from "../../utils/anonymous";
import api from "../../utils/api";

const RightPanel = () => {
    const { data: suggestedUsers, isLoading, isError, error } = useQuery({
        queryKey: ["suggestedUsers"],
        queryFn: async () => {
            try {
                const res = await api.get("/user/suggested");
                return res.data;
            } catch (error) {
                console.error("Error fetching suggested users:", error);
                throw error;
            }
        },
    });

    const { follow, isPending } = useFollow();

    // Handle loading and error states for the entire panel
    if (isLoading) {
        return (
            <div className='hidden lg:block mx-2 my-2'>
                <div className='glass-panel p-4 rounded-3xl sticky top-4'>
                    <p className='font-bold text-white font-heading tracking-wide mb-4'>Who to follow</p>
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
            <div className='hidden lg:block mx-2 my-2'>
                <div className='glass-panel p-4 rounded-3xl sticky top-4'>
                    <p className='font-bold text-white font-heading tracking-wide mb-4'>Who to follow</p>
                    <p className='text-error'>Error loading suggestions: {error.message}</p>
                </div>
            </div>
        );
    }

    // Only show the panel if there are suggested users after loading
    if (suggestedUsers?.length === 0) return <div className="md:w-64 w-0"></div>

    return (
        <div className='hidden lg:block mx-2 my-2'>
            <div className='glass-panel p-4 rounded-3xl sticky top-4'>
                <p className='font-bold text-lg mb-4 text-white font-heading tracking-wide'>Who to follow</p>
                <div className='flex flex-col gap-4'>
                    {!isLoading &&
                        suggestedUsers?.map((user) => (
                            <Link
                                to={`/profile/${user._id}`}
                                className='flex items-center justify-between gap-4 group'
                                key={user._id}
                            >
                                <div className='flex gap-2 items-center'>
                                    <div className='avatar'>
                                        <div className='w-10 rounded-full border border-gray-600 group-hover:border-artistic-primary transition-colors'>
                                            <img src={user.profileImg || "/avatar-placeholder.png"} alt="User Avatar" />
                                        </div>
                                    </div>
                                    <div className='flex flex-col'>
                                        <span className='font-semibold text-artistic-text tracking-tight truncate w-24 group-hover:text-artistic-primary transition-colors'>
                                            {user.fullName}
                                        </span>
                                        <span className='text-xs text-artistic-muted'>@{user.university}</span>
                                    </div>
                                </div>
                                <div>
                                    <button
                                        className='btn btn-primary btn-sm rounded-full text-white px-4 min-h-[2rem] h-8'
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
