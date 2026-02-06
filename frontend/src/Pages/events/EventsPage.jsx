import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { FaPlus, FaCalendarAlt, FaMapMarkerAlt, FaTrash } from "react-icons/fa";
import api from "../../utils/api";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import useAuthUser from "../../hooks/useAuthUser";

const EventsPage = () => {
    const { data: authUser } = useAuthUser();
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        location: "",
        date: "",
        category: "Other",
        img: null,
    });
    const [previewImg, setPreviewImg] = useState(null);

    const { data: events, isLoading } = useQuery({
        queryKey: ["events"],
        queryFn: async () => {
            const res = await api.get("/events/all");
            return res.data;
        },
    });

    const { mutate: createEvent, isPending: isCreating } = useMutation({
        mutationFn: async (eventData) => {
            const res = await api.post("/events/create", eventData);
            return res.data;
        },
        onSuccess: () => {
            toast.success("Event created successfully!");
            queryClient.invalidateQueries({ queryKey: ["events"] });
            setIsModalOpen(false);
            setFormData({ name: "", description: "", location: "", date: "", category: "Other", img: null });
            setPreviewImg(null);
        },
        onError: (error) => {
            toast.error(error.response?.data?.error || "Failed to create event");
        },
    });

    const { mutate: deleteEvent, isPending: isDeleting } = useMutation({
        mutationFn: async (id) => {
            await api.delete(`/events/${id}`);
        },
        onSuccess: () => {
            toast.success("Event deleted");
            queryClient.invalidateQueries({ queryKey: ["events"] });
        },
    });

    const handleImgChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setPreviewImg(reader.result);
                setFormData({ ...formData, img: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        createEvent(formData);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return {
            day: date.getDate(),
            month: date.toLocaleString('default', { month: 'short' }).toUpperCase(),
            full: date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
        };
    };

    return (
        <div className="flex-1 overflow-auto p-4 min-h-screen pb-20 md:pb-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold font-heading bg-gradient-to-r from-artistic-primary to-artistic-secondary bg-clip-text text-transparent">
                        Details & Happenings
                    </h1>
                    <p className="text-gray-400 text-sm">Discover what's happening at {authUser?.university}</p>
                </div>
                <button
                    className="btn btn-primary rounded-full text-white gap-2 shadow-lg hover:shadow-primary/20"
                    onClick={() => setIsModalOpen(true)}
                >
                    <FaPlus /> <span className="hidden md:inline">Create Event</span>
                </button>
            </div>

            {/* List */}
            {isLoading ? (
                <div className="flex justify-center h-64"><LoadingSpinner /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events?.map((event) => {
                        const dateObj = formatDate(event.date);
                        return (
                            <div key={event._id} className="glass-panel rounded-2xl overflow-hidden hover:bg-white/[0.02] transition-all group relative">
                                {/* Image */}
                                <div className="h-48 bg-gray-800/50 w-full overflow-hidden relative">
                                    {event.img ? (
                                        <img src={event.img} alt={event.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-600 bg-gradient-to-br from-gray-800 to-gray-900">
                                            <FaCalendarAlt size={40} className="opacity-20" />
                                        </div>
                                    )}
                                    <div className="absolute top-2 right-2 badge badge-secondary shadow-lg">
                                        {event.category}
                                    </div>

                                    {/* Date Badge */}
                                    <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-md text-black rounded-lg p-2 text-center min-w-[60px] shadow-lg">
                                        <div className="text-xs font-bold text-red-500">{dateObj.month}</div>
                                        <div className="text-xl font-black leading-none">{dateObj.day}</div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-4">
                                    <h3 className="font-bold text-xl mb-1 text-gray-100">{event.name}</h3>
                                    <div className="flex items-center gap-2 text-gray-400 text-sm mb-3">
                                        <FaMapMarkerAlt className="text-artistic-primary" />
                                        <span className="truncate">{event.location}</span>
                                    </div>

                                    <p className="text-gray-400 text-sm line-clamp-2 mb-4 h-10">{event.description}</p>

                                    <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-700/50">
                                        <div className="flex items-center gap-2">
                                            <div className="avatar w-6 h-6">
                                                <div className="rounded-full">
                                                    <img src={event.user.profileImg || "/avatar-placeholder.png"} />
                                                </div>
                                            </div>
                                            <span className="text-xs text-gray-500 truncate max-w-[100px]">By {event.user.fullName}</span>
                                        </div>

                                        {(authUser?._id === event.user._id || authUser?.role === 'admin' || authUser?.role === 'superadmin') && (
                                            <button
                                                className="btn btn-ghost btn-xs text-error"
                                                onClick={() => {
                                                    if (window.confirm("Cancel this event?")) deleteEvent(event._id)
                                                }}
                                                disabled={isDeleting}
                                            >
                                                <FaTrash />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {events?.length === 0 && (
                        <div className="col-span-full text-center py-20 text-gray-500">
                            <FaCalendarAlt className="mx-auto text-4xl mb-4 opacity-20" />
                            <p>No upcoming events. Plan something fun!</p>
                        </div>
                    )}
                </div>
            )}

            {/* Create Modal */}
            {isModalOpen && (
                <dialog className="modal modal-open modal-bottom sm:modal-middle bg-black/60 backdrop-blur-sm">
                    <div className="modal-box glass-panel border border-gray-700 p-0 max-w-lg w-full max-h-[90vh] flex flex-col">
                        <div className="p-6 overflow-y-auto">
                            <h3 className="font-bold text-xl mb-6">Create Event</h3>
                            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                                <input
                                    type="text"
                                    placeholder="Event Name"
                                    className="input input-bordered w-full bg-black/20 focus:outline-none focus:border-artistic-primary"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="date"
                                        className="input input-bordered w-full bg-black/20 focus:outline-none focus:border-artistic-primary"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        required
                                    />
                                    <select
                                        className="select select-bordered w-full bg-black/20 focus:outline-none focus:border-artistic-primary"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        <option>Other</option>
                                        <option>Academic</option>
                                        <option>Sports</option>
                                        <option>Cultural</option>
                                        <option>Workshop</option>
                                    </select>
                                </div>

                                <input
                                    type="text"
                                    placeholder="Location (e.g. Auditorium A)"
                                    className="input input-bordered w-full bg-black/20 focus:outline-none focus:border-artistic-primary"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    required
                                />

                                <textarea
                                    className="textarea textarea-bordered w-full bg-black/20 focus:outline-none focus:border-artistic-primary"
                                    placeholder="Description"
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    required
                                />

                                {/* Image Upload */}
                                <div className="border-2 border-dashed border-gray-700 rounded-xl p-4 text-center cursor-pointer hover:border-artistic-primary transition-colors relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        onChange={handleImgChange}
                                    />
                                    {previewImg ? (
                                        <div className="relative h-40">
                                            <img src={previewImg} alt="Preview" className="h-full mx-auto object-contain rounded-md" />
                                            <button
                                                type="button"
                                                className="absolute top-0 right-0 btn btn-circle btn-xs btn-error text-white"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setPreviewImg(null);
                                                    setFormData({ ...formData, img: null });
                                                }}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="py-8 text-gray-400">
                                            <FaCalendarAlt className="mx-auto text-2xl mb-2 opacity-50" />
                                            <p className="text-sm">Click to upload event banner</p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end gap-3 mt-4">
                                    <button
                                        type="button"
                                        className="btn btn-ghost"
                                        onClick={() => setIsModalOpen(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary text-white px-8"
                                        disabled={isCreating}
                                    >
                                        {isCreating ? <LoadingSpinner size="sm" /> : "Create Event"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                    <form method="dialog" className="modal-backdrop">
                        <button onClick={() => setIsModalOpen(false)}>close</button>
                    </form>
                </dialog>
            )}
        </div>
    );
};

export default EventsPage;
