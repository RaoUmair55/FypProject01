import { FaRegComment } from "react-icons/fa";
import { BiRepost } from "react-icons/bi";
import { FaRegHeart } from "react-icons/fa";
import { FaRegBookmark } from "react-icons/fa6";
import { FaTrash } from "react-icons/fa";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast"
import { anonymous } from "../../utils/anonymous"; // Assuming this is a string constant

import LoadingSpinner from "./LoadingSpinner"
import LoadingRing from "./LoadingRing"
import { formatPostDate } from "../../utils/date";
import api from "../../utils/api";

import useAuthUser from "../../hooks/useAuthUser";

const Post = ({ post }) => {
    const { data: authUser } = useAuthUser();
    const queryClient = useQueryClient();
    const [comment, setComment] = useState("");

    const postOwner = post.user;
    const isLiked = post.likes.includes(authUser?._id);
    const isMyPost = authUser?._id === post.user._id;
    const formattedDate = formatPostDate(post.createdAt);
    const Anonymous = post.isAnonymous;
    const { mutate: deletePost, isPending: isDeleting } = useMutation({
        mutationFn: async () => {
            try {
                const res = await api.delete(`/posts/${post._id}`);
                return res.data;
            } catch (error) {
                console.error("Error deleting post:", error);
                throw error;
            }
        },
        onSuccess: () => {
            toast.success("Post deleted");
            queryClient.invalidateQueries({ queryKey: ["posts"] });
        },
        onError: (error) => {
            toast.error(error.message);
        }
    });

    const { mutate: likePost, isPending: isLiking } = useMutation({
        mutationFn: async () => {
            try {
                const res = await api.post(`/posts/like/${post._id}`);
                return res.data;
            } catch (error) {
                console.error("Error liking post:", error);
                throw error;
            }
        },
        // ... onSuccess logic same as before but ensure updatedPost structure matches
        onSuccess: (updatedPost) => {
            // Optimistically update the cache without refetching all posts
            queryClient.setQueryData(["posts"], (oldData) => {
                if (oldData && oldData.pages) {
                    return {
                        ...oldData,
                        pages: oldData.pages.map(page => ({
                            ...page,
                            posts: page.posts.map(p =>
                                p._id === updatedPost._id ? updatedPost : p
                            )
                        }))
                    };
                }
                return oldData?.map((p) => (p._id === updatedPost._id ? updatedPost : p)) || [];
            });
            toast.success("Post liked successfully");
            queryClient.invalidateQueries({ queryKey: ["posts"] });
        },
        onError: (error) => {
            toast.error(error.message);
        }
    });

    const { mutate: commentPost, isPending: isCommenting } = useMutation({
        mutationFn: async (commentText) => {
            try {
                const res = await api.post(`/posts/comment/${post._id}`, { text: commentText });
                return res.data;
            } catch (error) {
                console.error("Error commenting on post:", error);
                throw error;
            }
        },
        onSuccess: () => {
            toast.success("Commented on the Buzz successfully");
            setComment("");
            queryClient.invalidateQueries({ queryKey: ["posts"] });
        },
        onError: (error) => {
            toast.error(error.message);
        }
    });

    const handleDeletePost = () => {
        deletePost();
    };

    const handlePostComment = (e) => {
        e.preventDefault();
        if (!comment.trim()) {
            toast.error("Comment cannot be empty");
            return;
        }
        commentPost(comment);
    };

    const handleLikePost = () => {
        if (isLiking) return;
        likePost();
    };

    return (
        <>
            <div className='flex gap-4 items-start p-5 mb-4 rounded-2xl glass-panel group/post hover:bg-white/[0.02] transition-colors'>
                <div className='avatar'>
                    {post.isAnonymous ? (
                        <div
                            className='w-10 h-10 rounded-full overflow-hidden cursor-pointer border border-artistic-primary/20'
                            onClick={() => {
                                toast.error("This post is anonymous. You can't view the profile.");
                            }}
                        >
                            <img src={postOwner.profileImg || "/avatar-placeholder.png"} alt="Anonymous Avatar" className="object-cover w-full h-full opacity-70" />
                        </div>
                    ) : (
                        <Link
                            to={`/profile/${postOwner._id}`}
                            className='w-10 h-10 rounded-full overflow-hidden border border-artistic-primary/20 hover:border-artistic-primary transition-colors'
                        >
                            <img src={postOwner.profileImg || "/avatar-placeholder.png"} alt="User Avatar" className="object-cover w-full h-full" />
                        </Link>
                    )}
                </div>

                <div className='flex flex-col flex-1 min-w-0'>
                    <div className='flex gap-2 items-center justify-between'>
                        <div className="flex gap-2 items-baseline truncate">
                            {Anonymous ? (
                                <span className='font-bold text-artistic-text cursor-default tracking-wide font-heading'>{anonymous}</span>
                            ) : (
                                <Link to={`/profile/${postOwner._id}`} className='font-bold text-artistic-text hover:text-artistic-primary transition-colors tracking-wide font-heading'>
                                    {postOwner.fullName}
                                </Link>
                            )}
                            <Link to={`/profile/${postOwner._id}`} className='text-artistic-muted text-sm hover:underline hidden sm:inline'>
                                @{postOwner.username}
                            </Link>
                            <span className="text-artistic-muted text-xs">·</span>
                            <span className='text-artistic-muted text-xs'>{formattedDate}</span>
                        </div>

                        {isMyPost && (
                            <span className='flex justify-end'>
                                {!isDeleting && <FaTrash className='cursor-pointer text-artistic-muted hover:text-error transition-colors w-4 h-4' onClick={handleDeletePost} />}

                                {isDeleting && (
                                    <LoadingRing size="sm" />
                                )}
                            </span>
                        )}
                    </div>

                    <div className='flex flex-col gap-3 overflow-hidden text-gray-300 mt-2'>
                        <span className="text-[15px] leading-relaxed whitespace-pre-line font-sans">{post.text}</span>
                        {post.img && (
                            <div className="rounded-2xl overflow-hidden mt-2 border border-gray-800/50">
                                <img
                                    src={post.img}
                                    className='w-full max-h-[500px] object-cover'
                                    alt='Post Content'
                                />
                            </div>
                        )}
                    </div>

                    <div className='flex justify-between mt-4 text-artistic-muted'>
                        <div className='flex gap-8 items-center w-full'>
                            <div
                                className='flex gap-2 items-center cursor-pointer group transition-all duration-200 hover:scale-105'
                                onClick={() => document.getElementById("comments_modal" + post._id).showModal()}
                            >
                                <div className="p-2 rounded-full group-hover:bg-sky-500/10 transition-colors">
                                    <FaRegComment className='w-5 h-5 group-hover:text-sky-400 text-artistic-muted transition-colors' />
                                </div>
                                <span className='text-sm group-hover:text-sky-400 transition-colors font-medium'>
                                    {post.comments.length}
                                </span>
                            </div>

                            {/* Comments Modal (styled dark) */}
                            <dialog id={`comments_modal${post._id}`} className='modal'>
                                <div className='modal-box rounded-3xl bg-[#181A20] border border-gray-700 shadow-2xl overflow-hidden'>
                                    <h3 className='font-bold text-lg mb-4 text-white font-heading'>Comments</h3>
                                    <div className='flex flex-col gap-4 max-h-80 overflow-y-auto px-1 custom-scrollbar'>
                                        {post.comments.length === 0 && (
                                            <p className='text-sm text-gray-500 text-center py-4'>
                                                No comments yet. Start the conversation! 🚀
                                            </p>
                                        )}
                                        {post.comments.map((comment) => (
                                            <div key={comment._id} className='flex gap-3 items-start bg-[#0F1115] p-3 rounded-xl'>
                                                <div className='avatar'>
                                                    <div className='w-8 h-8 rounded-full'>
                                                        <img
                                                            src={comment.user.profileImg || "/avatar-placeholder.png"}
                                                            alt="Commenter Avatar"
                                                        />
                                                    </div>
                                                </div>
                                                <div className='flex flex-col w-full'>
                                                    <div className='flex items-center gap-2 mb-1'>
                                                        <span className='font-bold text-sm text-white'>{comment.user.fullName}</span>
                                                        <span className='text-gray-500 text-xs'>
                                                            @{comment.user.username}
                                                        </span>
                                                    </div>
                                                    <div className='text-sm text-gray-300'>{comment.text}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <form
                                        className='flex gap-3 items-end mt-4 pt-4 border-t border-gray-700'
                                        onSubmit={handlePostComment}
                                    >
                                        <textarea
                                            className='textarea w-full p-3 rounded-xl text-md resize-none border bg-[#0F1115] border-gray-700 focus:outline-none focus:border-artistic-primary text-white h-20'
                                            placeholder='Add a comment...'
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                        />
                                        <button className='btn btn-primary rounded-full btn-sm text-white px-6 h-10' disabled={isCommenting}>
                                            {isCommenting ? (
                                                <LoadingRing size="md" />
                                            ) : (
                                                "Post"
                                            )}
                                        </button>
                                    </form>
                                </div>
                                <form method='dialog' className='modal-backdrop bg-black/60 backdrop-blur-sm'>
                                    <button className='outline-none'>close</button>
                                </form>
                            </dialog>

                            <div className='flex gap-2 items-center cursor-pointer group transition-all duration-200 hover:scale-105' onClick={handleLikePost}>
                                <div className="p-2 rounded-full group-hover:bg-pink-500/10 transition-colors">
                                    {isLiking && <LoadingRing size="sm" />}
                                    {!isLiked && !isLiking && (
                                        <FaRegHeart className='w-5 h-5 text-artistic-muted group-hover:text-pink-500 transition-colors' />
                                    )}
                                    {isLiked && !isLiking && <FaRegHeart className='w-5 h-5 text-pink-500 fill-current' />}
                                </div>

                                <span
                                    className={`text-sm font-medium transition-colors ${isLiked ? "text-pink-500" : "text-artistic-muted group-hover:text-pink-500"
                                        }`}
                                >
                                    {post.likes.length}
                                </span>
                            </div>

                            <div className='flex gap-2 items-center cursor-pointer group transition-all duration-200 hover:scale-105'>
                                <div className="p-2 rounded-full group-hover:bg-teal-500/10 transition-colors">
                                    <BiRepost className='w-6 h-6 text-artistic-muted group-hover:text-teal-500 transition-colors' />
                                </div>
                                <span className='text-sm text-artistic-muted group-hover:text-teal-500 transition-colors font-medium'>
                                    0
                                </span>
                            </div>

                            <div className='flex gap-2 items-center cursor-pointer group transition-all duration-200 hover:scale-105'>
                                <div className="p-2 rounded-full group-hover:bg-yellow-500/10 transition-colors">
                                    <FaRegBookmark className='w-4 h-4 text-artistic-muted group-hover:text-yellow-500 transition-colors' />
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
export default Post;