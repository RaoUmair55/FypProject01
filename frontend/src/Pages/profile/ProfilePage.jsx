import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";

import Posts from "../../components/common/Posts";
import ProfileHeaderSkeleton from "../../components/skeletons/ProfileHeaderSkeleton";
import EditProfileModal from "./EditProfileModel";

// No longer needed if using API for posts
// import { POSTS } from "../../utils/db/dummy"; 

import { FaArrowLeft } from "react-icons/fa6";
import { IoCalendarOutline } from "react-icons/io5";
import { FaLink } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatMemberSinceDate } from "../../utils/date";

import useFollow from "../../hooks/useFollow"
import LoadingRing from "../../components/common/LoadingRing";
import toast from "react-hot-toast";
// import { anonymous } from "../../utils/anonymous"; // This import seems unused or for a different context

// Import the authenticatedFetch helper
import { authenticatedFetch } from "../../utils/authenticatedFetch"; 

const ProfilePage = () => {
    const [coverImg, setCoverImg] = useState(null);
    const [profileImg, setProfileImg] = useState(null);
    const [feedType, setFeedType] = useState("posts");

    const coverImgRef = useRef(null);
    const profileImgRef = useRef(null);

    const {id} = useParams();
    
    const queryClient = useQueryClient();
    const {follow, isPending: isFollowing} = useFollow(); // Renamed isPending to isFollowing to avoid conflict
    const {data:authUser} = useQuery({queryKey: ["authUser"]});

    const {data:user, isLoading, refetch, isRefetching} = useQuery({
        queryKey: ["userProfile", id], // Add id to queryKey for better caching
        queryFn: async () => {
            try {
                // Use authenticatedFetch for fetching user profile
                const data = await authenticatedFetch(`/api/user/profile/${id}`);
                return data;
            } catch (error) {
                console.error("Error fetching user profile:", error);
                throw error; // Re-throw for react-query to handle
            }
        },
        enabled: !!id, // Only fetch if ID is available
    });

    const {mutate:updateProfile, isPending:isUpdatingProfile} = useMutation({
        mutationFn: async () => {
            try {
                // Use authenticatedFetch for updating profile
                const data = await authenticatedFetch(`/api/user/updateProfile`, {
                    method: "POST",
                    // authenticatedFetch already sets "Content-Type": "application/json" by default
                    body: JSON.stringify({
                        coverImg,
                        profileImg
                    }),
                });
                return data;
            } catch (error) {
                console.error("Error updating profile:", error);
                throw error; // Re-throw for react-query to handle
            }
        },
        onSuccess: () => {
            toast.success("Profile updated");
            Promise.all([
                queryClient.invalidateQueries({queryKey: ["authUser"]}),
                queryClient.invalidateQueries({queryKey: ["userProfile"]}), 
            ])
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    // Ensure user is loaded before accessing its properties for isMyProfile and amIFollowing
    const isMyProfile = authUser?._id === user?._id;
    const memberSinceDate = user?.createdAt ? formatMemberSinceDate(user.createdAt) : "";
    const amIFollowing = authUser?.following?.includes(user?._id); // Use optional chaining

    const handleImgChange = (e, state) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                state === "coverImg" && setCoverImg(reader.result);
                state === "profileImg" && setProfileImg(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    useEffect(() => {
        // Refetch user profile when the ID changes
        if (id) {
            refetch();
        }
    }, [id, refetch]);

    return (
        <>
            <div className='flex-[4_4_0] rounded-2xl min-h-screen '>
                {/* HEADER */}
                {(isLoading || isRefetching) && <ProfileHeaderSkeleton />}
                {!isLoading && !isRefetching && !user && <p className='text-center text-lg mt-4'>User not found</p>}
                <div className='flex flex-col gap-2 '>
                    {!isLoading && !isRefetching && user && (
                        <>
                            <div className='flex gap-10 px-4 py-2 items-center text-black border border-gray-300 rounded-lg bg-white'>
                                <Link to='/'>
                                    <FaArrowLeft className='w-4 h-4 text-[#153a54]' />
                                </Link>
                                <div className='flex flex-col'>
                                    <p className='font-bold text-lg'>{user?.fullName}</p>
                                </div>
                            </div>
                            <div className=" flex flex-col bg-white rounded-b-2xl border border-gray-300">
                                {/* COVER IMG */}
                                <div className='relative group/cover'>
                                    <img
                                        src={coverImg || user?.coverImg || "/cover.png"}
                                        className='h-52 w-full object-cover rounded-lg'
                                        alt='cover image'
                                    />
                                    {isMyProfile && (
                                        <div
                                            className='absolute top-2 right-2 rounded-full p-2 bg-gray-800 bg-opacity-75 cursor-pointer opacity-0 group-hover/cover:opacity-100 transition duration-200'
                                            onClick={() => coverImgRef.current.click()}
                                        >
                                            <MdEdit className='w-5 h-5 text-white' />
                                        </div>
                                    )}

                                    <input
                                        type='file'
                                        hidden
                                        accept="image/*"
                                        ref={coverImgRef}
                                        onChange={(e) => handleImgChange(e, "coverImg")}
                                    />
                                    <input
                                        type='file'
                                        hidden
                                        accept="image/*"
                                        ref={profileImgRef}
                                        onChange={(e) => handleImgChange(e, "profileImg")}
                                    />
                                    {/* USER AVATAR */}
                                    <div className='avatar absolute -bottom-16 left-4'>
                                        <div className='w-32 rounded-full relative group/avatar'>
                                            <img src={profileImg || user?.profileImg || "/avatar-placeholder.png"} alt="Profile" />
                                            <div className='absolute top-5 right-3 p-1 bg-primary rounded-full group-hover/avatar:opacity-100 opacity-0 cursor-pointer'>
                                                {isMyProfile && (
                                                    <MdEdit
                                                        className='w-4 h-4 text-white'
                                                        onClick={() => profileImgRef.current.click()}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className='flex justify-end px-4 mt-5'>
                                    {isMyProfile && <EditProfileModal authUser={authUser} />}
                                    {!isMyProfile && (
                                        <button
                                            className='btn btn-outline rounded-full btn-sm'
                                            onClick={() => follow(user?._id)}
                                        >
                                            {isFollowing && <LoadingRing />}
                                            {!isFollowing && amIFollowing && "Unfollow"}
                                            {!isFollowing && !amIFollowing && "Follow"} 
                                        </button>
                                    )}
                                    {(coverImg || profileImg) && (
                                        <button
                                            className='btn btn-primary rounded-full btn-sm text-white px-4 ml-2'
                                            onClick={() => updateProfile()}
                                            disabled={isUpdatingProfile} // Disable button while updating
                                        >
                                            {isUpdatingProfile ? "Updating" : "Update"}
                                        </button> 
                                    )}
                                </div>

                                <div className='flex flex-col gap-4 mt-3 px-4 text-black py-4'>
                                    <div className='flex flex-col'>
                                        <span className='font-bold text-lg'>{ user?.fullName}</span>
                                        <span className='text-sm text-slate-500'>@{user?.university}</span>
                                        <span className='text-sm my-1'>{user?.bio}</span>
                                    </div>

                                    <div className='flex gap-2 flex-wrap'>
                                        {user?.link && (
                                            <div className='flex gap-1 items-center '>
                                                <>
                                                    <FaLink className='w-3 h-3 text-slate-500' />
                                                    <a
                                                        href={user.link} // Use the actual user link
                                                        target='_blank'
                                                        rel='noreferrer'
                                                        className='text-sm text-blue-500 hover:underline'
                                                    >
                                                        {user.link}
                                                    </a>
                                                </>
                                            </div>
                                        )}
                                        <div className='flex gap-2 items-center'>
                                            <IoCalendarOutline className='w-4 h-4 text-slate-500' />
                                            <span className='text-sm text-slate-500'>
                                                {memberSinceDate}
                                            </span>
                                        </div>
                                    </div>
                                    <div className='flex gap-2'>
                                        <div className='flex gap-1 items-center'>
                                            <span className='font-bold text-sm'>{user?.following?.length}</span>
                                            <span className='text-slate-500 text-sm'>Following</span>
                                        </div>
                                        <div className='flex gap-1 items-center'>
                                            <span className='font-bold text-sm'>{user?.followers?.length}</span>
                                            <span className='text-slate-500 text-sm'>Followers</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className='flex w-full border border-gray-300 rounded-full bg-white mt-4'>
                                <div
                                    className='flex justify-center text-[#153a54] flex-1 p-3 transition duration-300 relative cursor-pointer'
                                    onClick={() => setFeedType("posts")}
                                >
                                    Posts
                                    {feedType === "posts" && (
                                        <div className='absolute bottom-0 w-10 h-1 rounded-full bg-primary' />
                                    )}
                                </div>
                                <div
                                    className='flex justify-center flex-1 p-3 text-slate-500 transition duration-300 relative cursor-pointer'
                                    onClick={() => setFeedType("likes")}
                                >
                                    Likes
                                    {feedType === "likes" && (
                                        <div className='absolute bottom-0 w-10 h-1 rounded-full bg-primary' />
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    <Posts feedType={feedType} username={user?.username} userId={user?._id} className="profilePost" />
                </div>
            </div>
        </>
    );
};
export default ProfilePage;