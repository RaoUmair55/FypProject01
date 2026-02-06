import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { useSocket } from "../../context/SocketContext";

import { IoSettingsOutline } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import { FaHeart } from "react-icons/fa6";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import api from "../../utils/api";

const NotificationPage = () => {
  const queryClient = useQueryClient();

  const { data: notifications, isLoading, isError, error } = useQuery({ // Added isError and error for better handling
    queryKey: ["notifications"],
    queryFn: async () => {
      try {
        const res = await api.get("/notifications");
        return res.data.notifications;
      } catch (error) {
        console.error("Error fetching notifications:", error);
        throw error;
      }
    },
  });

  const { mutate: deleteNotifications, isPending: isDeletingNotifications } = useMutation({ // Added isPending
    mutationFn: async () => {
      try {
        const res = await api.delete("/notifications");
        return res.data;
      } catch (error) {
        console.error("Error deleting notifications:", error);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("Notifications deleted");
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Mark as read mutation
  const { mutate: markAsRead, isPending: isMarkingAsRead } = useMutation({ // Added isPending
    mutationFn: async (id) => {
      try {
        const res = await api.put(`/notifications/${id}/read`);
        return res.data;
      } catch (error) {
        console.error(`Error marking notification ${id} as read:`, error);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("Marked as read");
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });


  return (
    <div className="glass-panel flex-[6_0_0] mr-auto rounded-3xl min-h-screen my-2 border-none">
      <div className="flex justify-between items-center p-6 border-b border-gray-800/50">
        <p className="font-bold text-2xl text-white font-heading tracking-wide">Notifications</p>
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="m-1 btn btn-ghost btn-circle btn-sm hover:bg-white/10">
            <IoSettingsOutline className="w-5 h-5 text-white" />
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content z-[1] menu p-2 shadow-xl bg-[#181A20] rounded-xl w-52 border border-gray-800"
          >
            <li>
              <a onClick={deleteNotifications} className="text-error hover:bg-error/10 hover:text-error rounded-lg">Delete all notifications</a>
            </li>
          </ul>
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center h-40 items-center">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {notifications?.length === 0 && (
        <div className="text-center p-10 text-artistic-muted">
          <p className="font-bold text-lg mb-2">No notifications yet 🤔</p>
          <p className="text-sm">Interactions will appear here.</p>
        </div>
      )}

      <div className="flex flex-col">
        {notifications?.map((notification) => (
          <div
            className={`flex justify-between items-center p-4 border-b border-gray-800/30 hover:bg-white/5 transition-colors ${notification.read ? "opacity-60" : "bg-artistic-primary/5 border-l-2 border-l-artistic-primary"
              }`}
            key={notification._id}
          >
            <div className="flex gap-4 items-center">
              <div className="p-2 rounded-full bg-white/5">
                {notification.type === "follow" && (
                  <FaUser className="w-5 h-5 text-artistic-primary" />
                )}
                {notification.type === "like" && (
                  <FaHeart className="w-5 h-5 text-pink-500" />
                )}
              </div>

              <div className="flex flex-col gap-1">
                <Link to={`/profile/${notification.from.username}`} className="flex gap-2 items-center text-white group">
                  <div className="avatar">
                    <div className="w-8 h-8 rounded-full border border-gray-700 group-hover:border-white transition-colors">
                      <img
                        src={notification.from.profileImg || "/avatar-placeholder.png"}
                        alt={notification.from.username}
                      />
                    </div>
                  </div>
                  <span className="font-bold font-heading group-hover:underline">{notification.from.username}</span>
                </Link>

                <span className="text-sm text-artistic-muted ml-10 -mt-1">
                  {notification.type === "follow" ? "followed you" : "liked your post"}
                </span>
              </div>
            </div>

            {/* Show "Mark as read" button only for like notifications that are unread */}
            {notification.type === "like" && !notification.read && (
              <button
                onClick={() => markAsRead(notification._id)}
                className="btn btn-xs btn-ghost text-artistic-primary hover:bg-artistic-primary/10"
              >
                Mark read
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationPage;
