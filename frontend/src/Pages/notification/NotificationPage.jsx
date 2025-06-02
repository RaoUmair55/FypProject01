import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";

import { IoSettingsOutline } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import { FaHeart } from "react-icons/fa6";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { authenticatedFetch } from "../../utils/authenticatedFetch"; // Import the helper

const NotificationPage = () => {
    const queryClient = useQueryClient();

    const { data: notifications, isLoading, isError, error } = useQuery({ // Added isError and error for better handling
        queryKey: ["notifications"],
        queryFn: async () => {
            try {
                // Use authenticatedFetch for fetching notifications
                const data = await authenticatedFetch("/api/notifications");
                return data.notifications; // Assuming the API returns { notifications: [...] }
            } catch (error) {
                console.error("Error fetching notifications:", error);
                throw error; // Re-throw for react-query to handle
            }
        },
    });

    const { mutate: deleteNotifications, isPending: isDeletingNotifications } = useMutation({ // Added isPending
        mutationFn: async () => {
            try {
                // Use authenticatedFetch for deleting all notifications
                const data = await authenticatedFetch("/api/notifications", { method: "DELETE" });
                return data;
            } catch (error) {
                console.error("Error deleting notifications:", error);
                throw error;
            }
        },
        onSuccess: () => {
            toast.success("Notifications deleted");
            queryClient.invalidateQueries({ queryKey: ["notifications"] }); // Use object for invalidateQueries
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    // Mark as read mutation
    const { mutate: markAsRead, isPending: isMarkingAsRead } = useMutation({ // Added isPending
        mutationFn: async (id) => {
            try {
                // Use authenticatedFetch for marking a notification as read
                const data = await authenticatedFetch(`/api/notifications/${id}/read`, {
                    method: "PUT",
                });
                return data;
            } catch (error) {
                console.error(`Error marking notification ${id} as read:`, error);
                throw error;
            }
        },
        onSuccess: () => {
            toast.success("Marked as read");
            queryClient.invalidateQueries({ queryKey: ["notifications"] }); // Use object for invalidateQueries
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });


  return (
    <div className="border-2 border-gray-300 flex-[6_0_0] mr-auto rounded-2xl bg-[#fff] px-5 py-2 min-h-screen">
      <div className="flex justify-between items-center p-4 ">
        <p className="font-bold text-3xl text-[#153a54]">Notifications</p>
        <div className="dropdown ">
          <div tabIndex={0} role="button" className="m-1">
            <IoSettingsOutline className="w-8 text-[#000000] " />
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
          >
            <li>
              <a onClick={deleteNotifications}>Delete all notifications</a>
            </li>
          </ul>
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center h-full items-center">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {notifications?.length === 0 && (
        <div className="text-center p-4 text-black font-bold">
          No notifications 🤔
        </div>
      )}

      {notifications?.map((notification) => (
        <div
          className={`border-b border-gray-300 flex justify-between items-center ${
            notification.read ? "opacity-50" : "opacity-100"
          }`}
          key={notification._id}
        >
          <div className="flex gap-2 p-4 items-center">
            {notification.type === "follow" && (
              <FaUser className="w-7 h-7 text-primary" />
            )}
            {notification.type === "like" && (
              <FaHeart className="w-7 h-7 text-red-500" />
            )}

            <Link to={`/profile/${notification.from.username}`} className="flex gap-1 text-black">
              <div className="avatar">
                <div className="w-8 rounded-full">
                  <img
                    src={notification.from.profileImg || "/avatar-placeholder.png"}
                    alt={notification.from.username}
                  />
                </div>
              </div>
              <span className="font-bold">@{notification.from.username}</span>{" "}
              {notification.type === "follow"
                ? "followed you"
                : "liked your post"}
            </Link>
          </div>

          {/* Show "Mark as read" button only for like notifications that are unread */}
          {notification.type === "like" && !notification.read && (
            <button
              onClick={() => markAsRead(notification._id)}
              className="btn btn-xs btn-outline text-black text-sm mr-4"
            >
              Mark as read
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default NotificationPage;
