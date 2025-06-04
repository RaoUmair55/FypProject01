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
import { authenticatedFetch } from "../../utils/authenticatedFetch"; // Import the helper

const Post = ({ post }) => {
    const [comment, setComment] = useState("");
    const queryClient = useQueryClient();
    // It's better to use useQuery for authUser here as well,
    // or pass it as a prop if it's guaranteed to be available from App.jsx
    const { data: authUser } = useQuery({ queryKey: ["authUser"] }); 

    // Ensure authUser is available before accessing its properties
    if (!authUser) {
        // Handle case where authUser is not loaded yet, perhaps return null or a loading state
        // This might happen if this component renders before App.jsx's authUser query completes.
        return <LoadingSpinner />; // Or some placeholder
    }

    const Anonymous = post.isAnonymous;

    const postOwner = post.user;
    const isLiked = post.likes.includes(authUser._id)

    const isMyPost = authUser._id === post.user._id;

    const formattedDate = formatPostDate(post.createdAt);

    const { mutate: deletePost, isPending: isDeleting } = useMutation({
        mutationFn: async () => {
            try {
                // Use authenticatedFetch for DELETE request
                const data = await authenticatedFetch(`/api/posts/${post._id}`, {
                    method: "DELETE",
                });
                return data;
            } catch (error) {
                console.error("Error deleting post:", error);
                throw error;
            }
        },
        onSuccess: () => {
            toast.success("Post deleted");
            // Invalidate the query to refetch the posts list
            queryClient.invalidateQueries({ queryKey: ["posts"] });
        },
        onError: (error) => {
            toast.error(error.message);
        }
    });

    const { mutate: likePost, isPending: isLiking } = useMutation({
        mutationFn: async () => {
            try {
                // Use authenticatedFetch for POST request (liking)
                const data = await authenticatedFetch(`/api/posts/like/${post._id}`, {
                    method: "POST",
                });
                return data; // assuming it's the updated post
            } catch (error) {
                console.error("Error liking post:", error);
                throw error;
            }
        },
        onSuccess: (updatedPost) => {
            // Optimistically update the cache without refetching all posts
            queryClient.setQueryData(["posts"], (oldData) => {
                // Check if oldData exists and has pages (for infinite query structure)
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
                // Fallback for non-infinite query or initial state
                return oldData?.map((p) => (p._id === updatedPost._id ? updatedPost : p)) || [];
            });
            toast.success("Post liked successfully"); // Moved toast after optimistic update
            // Invalidate to ensure consistency, but optimistic update makes it feel instant
            queryClient.invalidateQueries({ queryKey: ["posts"] });
        },
        onError: (error) => {
            toast.error(error.message);
        }
    });

   const { mutate: commentPost, isPending: isCommenting } = useMutation({
    mutationFn: async (commentText) => {
        try {
            const token = localStorage.getItem("jwt_token"); // Or however you're storing the token

            const response = await fetch(`https://fypproject01.onrender.com/api/posts/comment/${post._id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({ text: commentText }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.error || "Failed to post comment");
            }

            return data;
        } catch (error) {
            console.error("Error commenting on post:", error);
            throw error;
        }
    },
        onSuccess: () => {
            toast.success("Commented on the Buzz successfully");
            setComment(""); // reset the state
            queryClient.invalidateQueries({ queryKey: ["posts"] }); // Refetch posts to show new comment
        },
        onError: (error) => {
            toast.error(error.message);
        }
    });

    const handleDeletePost = () => { 
        deletePost(); 
    };

    const handlePostComment = (e) => {
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
            <div className='post-card flex gap-2 items-start p-4 border-2 border-[#dce1e7] my-4 rounded-2xl bg-white'>
                <div className='avatar'>
                    {post.isAnonymous ? (
                        <div
                            className='w-8 rounded-full overflow-hidden cursor-pointer'
                            onClick={() => {
                                toast.error("This post is anonymous. You can't view the profile.");
                            }}
                        >
                            <img src={postOwner.profileImg || "/avatar-placeholder.png"} alt="Anonymous Avatar" />
                        </div>
                    ) : (
                        <Link
                            to={`/profile/${postOwner._id}`}
                            className='w-8 rounded-full overflow-hidden'
                        >
                            <img src={postOwner.profileImg || "/avatar-placeholder.png"} alt="User Avatar" />
                        </Link>
                    )}
                </div>

                <div className='flex flex-col flex-1 '>
                    <div className='flex gap-2 items-center text-[#153a54]'>
                        {Anonymous ? (
                            <span className='font-bold cursor-default'>{anonymous}</span>
                        ) : (
                            <Link to={`/profile/${postOwner._id}`} className='font-bold'>
                                {postOwner.fullName}
                            </Link>
                        )}

                        <span className='text-gray-700 flex gap-1 text-sm '>
                            <Link >@{postOwner.university}</Link>
                            <span>·</span>
                            <span>{formattedDate}</span>
                        </span>
                        {isMyPost && (
                            <span className='flex justify-end flex-1'>
                                {!isDeleting && <FaTrash className='cursor-pointer hover:text-red-500' onClick={handleDeletePost} />}

                                {isDeleting && (
                                    <LoadingRing size="sm" />
                                )}
                            </span>
                        )}
                    </div>
                    <div className='flex flex-col gap-3 overflow-hidden text-[#153a54]'>
                        <span>{post.text}</span>
                        {post.img && (
                            <img
                                src={post.img}
                                className='h-80 object-contain '
                                alt='Post Content'
                            />
                        )}
                    </div>
                    <div className='flex justify-between mt-3'>
                        <div className='flex gap-10 items-center w-2/3 justify-start'>
                            <div
                                className='flex gap-1 items-center cursor-pointer group'
                                onClick={() => document.getElementById("comments_modal" + post._id).showModal()}
                            >
                                <FaRegComment className='w-4 h-4 text-slate-500 group-hover:text-sky-400' />
                                <span className='text-sm text-slate-500 group-hover:text-sky-400'>
                                    {post.comments.length}
                                </span>
                            </div>
                            {/* We're using Modal Component from DaisyUI */}
                            <dialog id={`comments_modal${post._id}`} className='modal border-none outline-none'>
                                <div className='modal-box rounded border border-gray-600'>
                                    <h3 className='font-bold text-lg mb-4'>COMMENTS</h3>
                                    <div className='flex flex-col gap-3 max-h-60 overflow-auto'>
                                        {post.comments.length === 0 && (
                                            <p className='text-sm text-slate-500'>
                                                No comments yet 🤔 Be the first one 😉
                                            </p>
                                        )}
                                        {post.comments.map((comment) => (
                                            <div key={comment._id} className='flex gap-2 items-start'>
                                                <div className='avatar'>
                                                    <div className='w-8 rounded-full'>
                                                        <img
                                                            src={comment.user.profileImg || "/avatar-placeholder.png"}
                                                            alt="Commenter Avatar"
                                                        />
                                                    </div>
                                                </div>
                                                <div className='flex flex-col'>
                                                    <div className='flex items-center gap-1'>
                                                        <span className='font-bold'>{comment.user.fullName}</span>
                                                        <span className='text-gray-700 text-sm'>
                                                            @{comment.user.username}
                                                        </span>
                                                    </div>
                                                    <div className='text-sm'>{comment.text}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <form
                                        className='flex gap-2 items-center mt-4 border-t border-gray-600 pt-2'
                                        onSubmit={handlePostComment}
                                    >
                                        <textarea
                                            className='textarea w-full p-1 rounded text-md resize-none border focus:outline-none border-gray-800'
                                            placeholder='Add a comment...'
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                        />
                                        <button className='btn btn-primary rounded-full btn-sm text-white px-4' disabled={isCommenting}>
                                            {isCommenting ? (
                                                <LoadingRing size="md" />
                                            ) : (
                                                "Post"
                                            )}
                                        </button>
                                    </form>
                                </div>
                                <form method='dialog' className='modal-backdrop'>
                                    <button className='outline-none'>close</button>
                                </form>
                            </dialog>
                            <div className='flex gap-1 items-center group cursor-pointer' onClick={handleLikePost}>
                                {isLiking && <LoadingRing size="sm" />}
                                {!isLiked && !isLiking && (
                                    <FaRegHeart className='w-4 h-4 cursor-pointer text-slate-500 group-hover:text-pink-500' />
                                )}
                                {isLiked && !isLiking && <FaRegHeart className='w-4 h-4 cursor-pointer text-pink-500 ' />}

                                <span
                                    className={`text-sm group-hover:text-pink-500 ${isLiked ? "text-pink-500" : "text-slate-500"
                                        }`}
                                >
                                    {post.likes.length}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
export default Post;