import { MdHomeFilled } from "react-icons/md";
import { IoNotifications } from "react-icons/io5";
import { FaUser, FaTag, FaCalendarAlt, FaBook } from "react-icons/fa";
import { NavLink, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BiLogOut } from "react-icons/bi";
import toast from "react-hot-toast";
import useAuthUser from "../../hooks/useAuthUser";
import api from "../../utils/api";

const MobileSidebar = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const { data } = useAuthUser();
    const { data: notificationCountData } = useQuery({
        queryKey: ["notificationCount"],
        queryFn: async () => {
            try {
                const res = await api.get("/notifications/number");
                return res.data;
            } catch (error) {
                console.error("Error fetching notification count:", error);
                throw error;
            }
        },
        refetchInterval: 10000,
        enabled: !!data,
    });
    const notificationCount = notificationCountData?.number || 0;

    // Logout mutation
    const { mutate: logoutMutation } = useMutation({
        mutationFn: async () => {
            try {
                const res = await api.post("/auth/logout");
                return res.data;
            } catch (err) {
                console.error("Error during logout mutation:", err);
                throw err;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["authUser"] });
            toast.success("Logout successful");
        },
        onError: (error) => {
            toast.error(error.message || "Couldn't logout");
        },
    });

    return (
        <nav className="fixed bottom-2 left-1/2 -translate-x-1/2 z-50 w-[95vw] max-w-md bg-white rounded-2xl shadow-lg flex justify-around items-center py-2 px-2 border-2 border-gray-200 md:hidden">
            <NavLink
                to="/"
                className={({ isActive }) =>
                    `flex flex-col items-center px-3 py-1 rounded-xl ${isActive ? "bg-[#dff2fe] text-[#153a54]" : "text-[#153a54]"
                    }`
                }
            >
                <MdHomeFilled className="w-7 h-7" />
                <span className="text-xs">Home</span>
            </NavLink>
            <NavLink
                to="/notifications"
                className={({ isActive }) =>
                    `flex flex-col items-center px-3 py-1 rounded-xl relative ${isActive ? "bg-[#dff2fe] text-[#153a54]" : "text-[#153a54]"
                    }`
                }
            >
                <IoNotifications className="w-6 h-6" />
                <span className="text-xs">Notifications</span>
                {notificationCount > 0 && (
                    <span className="absolute top-0 right-2 bg-red-500 text-white text-xs rounded-full px-1">
                        {notificationCount}
                    </span>
                )}
            </NavLink>
            <NavLink
                to={data?._id ? `/profile/${data._id}` : "#"}
                className={({ isActive }) =>
                    `flex flex-col items-center px-3 py-1 rounded-xl ${isActive ? "bg-[#dff2fe] text-[#153a54]" : "text-[#153a54]"
                    }`
                }
            >
                <FaUser className="w-6 h-6" />
                <span className="text-xs">Profile</span>
            </NavLink>
            <NavLink
                to="/marketplace"
                className={({ isActive }) =>
                    `flex flex-col items-center px-3 py-1 rounded-xl ${isActive ? "bg-[#dff2fe] text-[#153a54]" : "text-[#153a54]"
                    }`
                }
            >
                <FaTag className="w-6 h-6" />
                <span className="text-xs">Market</span>
            </NavLink>
            <NavLink
                to="/events"
                className={({ isActive }) =>
                    `flex flex-col items-center px-3 py-1 rounded-xl ${isActive ? "bg-[#dff2fe] text-[#153a54]" : "text-[#153a54]"
                    }`
                }
            >
                <FaCalendarAlt className="w-6 h-6" />
                <span className="text-xs">Events</span>
            </NavLink>
            <NavLink
                to="/resources"
                className={({ isActive }) =>
                    `flex flex-col items-center px-3 py-1 rounded-xl ${isActive ? "bg-[#dff2fe] text-[#153a54]" : "text-[#153a54]"
                    }`
                }
            >
                <FaBook className="w-6 h-6" />
                <span className="text-xs">Notes</span>
            </NavLink>
            <button
                onClick={() => logoutMutation()}
                className="flex flex-col items-center px-3 py-1 rounded-xl text-[#153a54] focus:outline-none"
                title="Logout"
            >
                <BiLogOut className="w-6 h-6" />
                <span className="text-xs">Logout</span>
            </button>
        </nav>
    );
};

export default MobileSidebar;