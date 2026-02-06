import { useQuery } from "@tanstack/react-query";
import api from "../../utils/api";
import Post from "../../components/common/Post";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const UniversityPosts = () => {
    const { data: posts, isLoading } = useQuery({
        queryKey: ["universityPosts"],
        queryFn: async () => {
            const res = await api.get("/admin/posts");
            return res.data;
        },
    });

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-auto p-4 md:p-8 bg-[#0F1115] min-h-screen text-gray-200 pb-20 md:pb-8">
            <h1 className="text-3xl font-bold mb-8 font-heading bg-gradient-to-r from-artistic-primary to-artistic-secondary bg-clip-text text-transparent">
                Top Posts - {posts?.[0]?.university || "University"}
            </h1>

            <div className="max-w-2xl mx-auto flex flex-col gap-4">
                {posts?.map((post) => (
                    <Post key={post._id} post={post} />
                ))}
                {posts?.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                        No posts found in your university.
                    </div>
                )}
            </div>
        </div>
    );
};

export default UniversityPosts;
