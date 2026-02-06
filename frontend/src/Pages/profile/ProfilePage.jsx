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
import api from "../../utils/api";
import useAuthUser from "../../hooks/useAuthUser";

const ProfilePage = () => {
    const { data: authUser } = useAuthUser();
    const { id } = useParams();
    const queryClient = useQueryClient();
    const [coverImg, setCoverImg] = useState(null);
    const [profileImg, setProfileImg] = useState(null);
    const [feedType, setFeedType] = useState("posts");

    const coverImgRef = useRef(null);
    const profileImgRef = useRef(null);

    const { follow, isFollowing } = useFollow();
    // ...
    const { data: user, isLoading, refetch, isRefetching } = useQuery({
        queryKey: ["userProfile", id],
        queryFn: async () => {
            try {
                const res = await api.get(`/user/profile/${id}`);
                return res.data;
            } catch (error) {
                console.error("Error fetching user profile:", error);
                throw error;
            }
        },
        enabled: !!id,
    });

    const { mutate: updateProfile, isPending: isUpdatingProfile } = useMutation({
        mutationFn: async () => {
            try {
                const res = await api.post("/user/updateProfile", {
                    coverImg,
                    profileImg
                });
                return res.data;
            } catch (error) {
                console.error("Error updating profile:", error);
                throw error;
            }
        },
        onSuccess: () => {
            toast.success("Profile updated");
            Promise.all([
                queryClient.invalidateQueries({ queryKey: ["authUser"] }),
                queryClient.invalidateQueries({ queryKey: ["userProfile"] }),
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
            <div className='flex-[4_4_0] min-h-screen '>
                {/* HEADER */}
                {(isLoading || isRefetching) && <ProfileHeaderSkeleton />}
                {!isLoading && !isRefetching && !user && <p className='text-center text-lg mt-4 text-artistic-muted'>User not found</p>}
                <div className='flex flex-col gap-4 '>
                    {!isLoading && !isRefetching && user && (
                        <>
                            <div className='flex gap-10 px-4 py-2 items-center text-white glass-panel sticky top-0 z-10 backdrop-blur-md'>
                                <Link to='/'>
                                    <FaArrowLeft className='w-4 h-4 text-white hover:text-artistic-primary transition-colors' />
                                </Link>
                                <div className='flex flex-col'>
                                    <p className='font-bold text-lg font-heading tracking-wide'>{user?.fullName}</p>
                                    <span className='text-sm text-artistic-muted'>{user?.posts?.length || 0} posts</span>
                                </div>
                            </div>

                            <div className="flex flex-col glass-panel overflow-hidden mx-4 rounded-3xl">
                                {/* COVER IMG */}
                                <div className='relative group/cover h-52'>
                                    <img
                                        src={coverImg || user?.coverImg || "/cover.png"}
                                        className='h-full w-full object-cover'
                                        alt='cover image'
                                    />
                                    {isMyProfile && (
                                        <div
                                            className='absolute top-2 right-2 rounded-full p-2 bg-black/50 cursor-pointer opacity-0 group-hover/cover:opacity-100 transition duration-200 hover:bg-black/70'
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
                                    <div className='absolute -bottom-16 left-4'>
                                        <div className='w-32 h-32 rounded-full relative group/avatar border-4 border-[#0F1115] overflow-hidden'>
                                            <img
                                                src={profileImg || user?.profileImg || "/avatar-placeholder.png"}
                                                alt="Profile"
                                                className="w-full h-full object-cover"
                                            />
                                            <div className='absolute inset-0 bg-black/40 flex items-center justify-center group-hover/avatar:opacity-100 opacity-0 cursor-pointer transition-opacity duration-200'>
                                                {isMyProfile && (
                                                    <MdEdit
                                                        className='w-6 h-6 text-white'
                                                        onClick={() => profileImgRef.current.click()}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className='flex justify-end px-4 mt-5 min-h-[60px]'>
                                    {isMyProfile && <EditProfileModal authUser={authUser} />}
                                    {!isMyProfile && (
                                        <button
                                            className='btn btn-outline rounded-full btn-sm text-artistic-primary hover:bg-artistic-primary hover:text-white border-artistic-primary'
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
                                            disabled={isUpdatingProfile}
                                        >
                                            {isUpdatingProfile ? "Updating" : "Update"}
                                        </button>
                                    )}
                                </div>

                                <div className='flex flex-col gap-4 mt-3 px-4 py-4'>
                                    <div className='flex flex-col'>
                                        <span className='font-bold text-xl text-white font-heading'>{user?.fullName}</span>
                                        <span className='text-sm text-artistic-muted'>@{user?.university}</span>
                                        <span className='text-sm my-2 text-gray-300 leading-relaxed'>{user?.bio}</span>
                                    </div>

                                    <div className='flex gap-4 flex-wrap text-artistic-muted text-sm'>
                                        {user?.link && (
                                            <div className='flex gap-1 items-center hover:text-white transition-colors'>
                                                <FaLink className='w-3 h-3' />
                                                <a
                                                    href={user.link}
                                                    target='_blank'
                                                    rel='noreferrer'
                                                    className='text-blue-400 hover:underline'
                                                >
                                                    {user.link}
                                                </a>
                                            </div>
                                        )}
                                        <div className='flex gap-2 items-center'>
                                            <IoCalendarOutline className='w-4 h-4' />
                                            <span>{memberSinceDate}</span>
                                        </div>
                                    </div>

                                    <div className='flex gap-4 mt-2'>
                                        <div className='flex gap-1 items-center text-gray-300'>
                                            <span className='font-bold text-white'>{user?.following?.length}</span>
                                            <span className='text-artistic-muted text-sm'>Following</span>
                                        </div>
                                        <div className='flex gap-1 items-center text-gray-300'>
                                            <span className='font-bold text-white'>{user?.followers?.length}</span>
                                            <span className='text-artistic-muted text-sm'>Followers</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className='flex w-full glass-panel mx-4 mt-4 mb-2 overflow-hidden rounded-2xl'>
                                <div
                                    className={`flex justify-center flex-1 p-3 transition duration-300 relative cursor-pointer font-medium ${feedType === "posts" ? "text-white bg-artistic-primary/10" : "text-artistic-muted hover:bg-white/5"}`}
                                    onClick={() => setFeedType("posts")}
                                >
                                    Posts
                                    {feedType === "posts" && (
                                        <div className='absolute bottom-0 w-16 h-1 rounded-full bg-artistic-primary' />
                                    )}
                                </div>
                                <div
                                    className={`flex justify-center flex-1 p-3 transition duration-300 relative cursor-pointer font-medium ${feedType === "likes" ? "text-white bg-artistic-primary/10" : "text-artistic-muted hover:bg-white/5"}`}
                                    onClick={() => setFeedType("likes")}
                                >
                                    Likes
                                    {feedType === "likes" && (
                                        <div className='absolute bottom-0 w-16 h-1 rounded-full bg-artistic-primary' />
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    <div className="mx-4">
                        <Posts feedType={feedType} username={user?.username} userId={user?._id} className="profilePost" />
                    </div>
                </div>
            </div>
        </>
    );
};
export default ProfilePage;