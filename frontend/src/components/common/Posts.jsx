import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";
// import { POSTS } from "../../utils/db/dummy";		// dummy until we get posts from db
import {useQuery} from "@tanstack/react-query"
import { useEffect } from "react";

	// feed category (the prop)
const Posts = ({feedType, username, userId}) => {
	// const isLoading = false;

	const getPostEndPoint = () => {
		switch(feedType) {
			case "forYou": 
				return "/api/posts/all";
			case "following": 
				return "/api/posts/following";
			case "posts":
				return `/api/posts/userPosts/${username}`;
			case "likes":
				return `/api/posts/getlikedPost/${userId}`;

			default:
				return "/api/posts/all";
		}
	}

	const POST_ENDPOINT	= getPostEndPoint();

	const {data:posts, isLoading, refetch, isRefetching} = useQuery({
		queryKey: ["posts"],
		queryFn: async () => {
			try {
				const res = await fetch(POST_ENDPOINT)
				const data = await res.json()

				if (!res.ok) {
					throw new Error(data.error || "Something went wrong")
				}

				return data
			} catch (error) {
				throw new Error(error)
			}
		},
	});
	useEffect(() => { 
		refetch();
	}, [feedType, refetch, username])

	return (
		<>
			{(isLoading || isRefetching) && (
				<div className='flex flex-col justify-center'>
					<PostSkeleton />
					<PostSkeleton />
					<PostSkeleton />
				</div>
			)}
			{!isLoading && !isRefetching && posts?.length === 0 && <p className='text-center my-4'>No posts in this tab. Switch 👻</p>}
			{!isLoading && !isRefetching && posts && (
				<div>
					{posts ? posts.map((post) => (
						<Post key={post._id} post={post} />
					)) : (
						<p className='text-center my-4'>No posts found</p>
					)}
				</div>
			)}
		</>
	);
};
export default Posts;