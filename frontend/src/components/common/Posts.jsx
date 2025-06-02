import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";
import { useEffect } from "react";
import { authenticatedFetch } from "../../utils/authenticatedFetch"; // Adjust the import path as needed

const Posts = ({ feedType, username, userId, category }) => {
  const { ref, inView } = useInView();
  
  // Define the backend URL for the API client
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

  const getPostEndPoint = () => {
    switch (feedType) {
      case "forYou":
        // When using authenticatedFetch, you pass the relative path,
        // as the helper prepends the BACKEND_URL.
        return "/api/posts/all"; 
      case "following":
        return "/api/posts/following";
      case "posts":
        return username ? `/api/posts/userPosts/${username}` : null;
      case "likes":
        return userId ? `/api/posts/getlikedPost/${userId}` : null;
      case "category":
        return category ? `/api/posts/category/${category}` : null;
      default:
        return "/api/posts/all";
    }
  };

  const POST_ENDPOINT = getPostEndPoint();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ["posts", feedType, username, userId, category],
    queryFn: async ({ pageParam = 1 }) => {
      if (!POST_ENDPOINT) {
        throw new Error("Invalid endpoint. Missing username or userId.");
      }

      // Construct the full URL with query parameters for pagination.
      // authenticatedFetch will prepend the base backend URL.
      const urlWithParams = `${POST_ENDPOINT}?page=${pageParam}&limit=15`;

      try {
        // Use authenticatedFetch instead of direct fetch
        // It handles the full URL construction and error checking (res.ok)
        const result = await authenticatedFetch(urlWithParams);

        // authenticatedFetch already handles !res.ok and error parsing,
        // so you can directly return the result.
        return {
          posts: Array.isArray(result.posts) ? result.posts : [],
          nextPage: pageParam + 1,
          total: result.total || 0,
        };

      } catch (error) {
        // authenticatedFetch throws an error if the response is not ok,
        // or if authentication fails (401/403).
        console.error("Error fetching posts:", error);
        throw error; // Re-throw the error for useInfiniteQuery to handle
      }
    },
    enabled: !!POST_ENDPOINT, // Only fetch if endpoint is valid
    getNextPageParam: (lastPage, allPages) => {
      const loadedPosts = allPages.flatMap((p) => p.posts).length;
      return loadedPosts < lastPage.total ? lastPage.nextPage : undefined;
    },
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  const posts = Array.isArray(data?.pages)
    ? data.pages.flatMap((page) =>
        Array.isArray(page?.posts) ? page.posts : []
      )
    : [];

  return (
    <div>
      {isLoading && (
        <>
          <PostSkeleton />
          <PostSkeleton />
        </>
      )}

      {!isLoading && posts.length === 0 && (
        <p className="text-center text-gray-500 mt-4">No posts found.</p>
      )}

      {posts.map((post) => (post ? <Post key={post._id} post={post} /> : null))}

      {isFetchingNextPage && <PostSkeleton />}

      {hasNextPage && (
        <div ref={ref} className="text-center py-5 text-gray-400">
          Loading more...
        </div>
      )}

      {isError && (
        <p className="text-red-500 text-center mt-4">{error.message}</p>
      )}
    </div>
  );
};

export default Posts;
