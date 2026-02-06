import { useQuery } from "@tanstack/react-query";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";
import { FaUsers, FaFileAlt } from "react-icons/fa";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import api from "../../utils/api";

import useAuthUser from "../../hooks/useAuthUser";

const DashboardPage = () => {
    const { data: stats, isLoading } = useQuery({
        queryKey: ["adminStats"],
        queryFn: async () => {
            const res = await api.get("/admin/stats");
            return res.data;
        },
    });

    const { data: authUser } = useAuthUser();

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

    return (
        <div className="flex-1 overflow-auto p-4 md:p-8 min-h-screen text-gray-200 pb-20 md:pb-8">
            <h1 className="text-3xl font-bold mb-8 font-heading bg-gradient-to-r from-artistic-primary to-artistic-secondary bg-clip-text text-transparent">
                {authUser?.role === "superadmin" ? "Super Admin Dashboard" : "Admin Dashboard"}
            </h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                <div className="glass-panel p-6 rounded-2xl flex items-center gap-4 hover:bg-white/[0.02] transition-colors">
                    <div className="p-3 bg-blue-500/20 rounded-full text-blue-500 shrink-0">
                        <FaUsers size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-400 whitespace-nowrap">Total Students</p>
                        <p className="text-2xl font-bold mt-1">{stats?.totalUsers}</p>
                    </div>
                </div>
                <div className="glass-panel p-6 rounded-2xl flex items-center gap-4 hover:bg-white/[0.02] transition-colors">
                    <div className="p-3 bg-purple-500/20 rounded-full text-purple-500 shrink-0">
                        <FaFileAlt size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-400 whitespace-nowrap">Total Posts</p>
                        <p className="text-2xl font-bold mt-1">{stats?.totalPosts}</p>
                    </div>
                </div>
                {authUser?.role === "superadmin" && (
                    <div className="glass-panel p-6 rounded-2xl flex items-center gap-4 hover:bg-white/[0.02] transition-colors">
                        <div className="p-3 bg-green-500/20 rounded-full text-green-500 shrink-0">
                            <FaUsers size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-400 whitespace-nowrap">Total Admins</p>
                            <p className="text-2xl font-bold mt-1">{stats?.totalAdmins}</p>
                        </div>
                    </div>
                )}
            </div>

            {authUser?.role === "superadmin" && (
                <div className="glass-panel p-6 rounded-2xl flex items-center gap-4 hover:bg-white/[0.02] transition-colors">
                    <div className="p-3 bg-green-500/20 rounded-full text-green-500 shrink-0">
                        <FaUsers size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-400 whitespace-nowrap">Total Admins</p>
                        <p className="text-2xl font-bold mt-1">{stats?.totalAdmins}</p>
                    </div>
                </div>
            )}

            {/* University Info (Admin Only) */}
            {authUser?.role === "admin" && (
                <div className="glass-panel p-6 rounded-2xl flex items-center gap-4 col-span-1 lg:col-span-2 xl:col-span-2 hover:bg-white/[0.02] transition-colors">
                    <div>
                        <p className="text-sm text-gray-400">University</p>
                        <p className="text-xl font-bold mt-1 truncate">{stats?.university}</p>
                    </div>
                </div>
            )}

            {/* Charts Section */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
                {/* Posts by Category */}
                <div className="glass-panel p-6 rounded-2xl">
                    <h2 className="text-xl font-bold mb-6">Posts by Category</h2>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats?.postsByCategory}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                <XAxis dataKey="_id" stroke="#9CA3AF" tickLine={false} axisLine={false} dy={10} />
                                <YAxis stroke="#9CA3AF" tickLine={false} axisLine={false} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{ backgroundColor: "#16181C", border: "1px solid #2F3336", borderRadius: "8px" }}
                                    itemStyle={{ color: "#E5E7EB" }}
                                />
                                <Bar dataKey="count" fill="#8884d8" name="Posts" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Users by University (Super Admin Only) */}
                {authUser?.role === "superadmin" && (
                    <div className="glass-panel p-6 rounded-2xl">
                        <h2 className="text-xl font-bold mb-6">Users by University</h2>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats?.usersByUniversity}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="count"
                                        nameKey="_id"
                                    >
                                        {stats?.usersByUniversity?.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: "#16181C", border: "1px solid #2F3336", borderRadius: "8px" }}
                                        itemStyle={{ color: "#E5E7EB" }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
            </div>

            <h2 className="text-2xl font-bold mb-4 font-heading">Recent Activity</h2>
            <div className="glass-panel p-8 rounded-2xl text-center text-gray-500">
                <p>Recent activity feed coming soon...</p>
            </div>
        </div >
    );
};

export default DashboardPage;
