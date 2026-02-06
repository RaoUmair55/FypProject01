import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import api from "../../utils/api";

const AdminManagement = () => {
    const [formData, setFormData] = useState({
        username: "",
        fullName: "",
        email: "",
        password: "",
        university: "",
    });

    const { mutate: createAdmin, isPending } = useMutation({
        mutationFn: async (data) => {
            const res = await api.post("/admin/create-admin", data);
            return res.data;
        },
        onSuccess: () => {
            toast.success("Admin created successfully");
            setFormData({
                username: "",
                fullName: "",
                email: "",
                password: "",
                university: "",
            });
        },
        onError: (error) => {
            toast.error(error.response?.data?.error || "Failed to create admin");
        },
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        createAdmin(formData);
    };

    const { data: admins, refetch } = useQuery({
        queryKey: ["admins"],
        queryFn: async () => {
            const res = await api.get("/admin/admins");
            return res.data;
        },
    });

    const { mutate: deleteAdmin, isPending: isDeleting } = useMutation({
        mutationFn: async (id) => {
            await api.delete(`/admin/user/${id}`);
        },
        onSuccess: () => {
            toast.success("Admin deleted successfully");
            refetch();
        },
        onError: (error) => {
            toast.error(error.response?.data?.error || "Failed to delete admin");
        },
    });

    return (
        <div className="flex-1 overflow-auto p-4 md:p-8 bg-[#0F1115] min-h-screen text-gray-200 pb-20 md:pb-8">
            <h1 className="text-3xl font-bold mb-8 font-heading bg-gradient-to-r from-artistic-primary to-artistic-secondary bg-clip-text text-transparent">
                Admin Management
            </h1>

            <div className="glass-panel p-6 rounded-2xl max-w-4xl mx-auto mb-8">
                <h2 className="text-xl font-bold mb-6">Create New University Admin</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="input input-bordered input-artistic flex items-center gap-2">
                        <input
                            type="text"
                            className="grow"
                            placeholder="Username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </label>
                    <label className="input input-bordered input-artistic flex items-center gap-2">
                        <input
                            type="text"
                            className="grow"
                            placeholder="Full Name"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                        />
                    </label>
                    <label className="input input-bordered input-artistic flex items-center gap-2">
                        <input
                            type="email"
                            className="grow"
                            placeholder="Email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </label>
                    <label className="input input-bordered input-artistic flex items-center gap-2">
                        <input
                            type="password"
                            className="grow"
                            placeholder="Password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </label>
                    <label className="form-control w-full md:col-span-2">
                        <select
                            className="select select-bordered w-full input-artistic"
                            name="university"
                            value={formData.university}
                            onChange={handleChange}
                            required
                        >
                            <option value="" disabled>Select University</option>
                            <option value="Air University">Air University</option>
                            <option value="Bahria University">Bahria University</option>
                            <option value="NUMAL">NUMAL</option>
                            <option value="FAST">FAST</option>
                            <option value="COMSATS">COMSATS</option>
                            <option value="GIKI">GIKI</option>
                            <option value="NUST">NUST</option>
                            <option value="Other">Other</option>
                        </select>
                    </label>

                    <button
                        type="submit"
                        className="btn btn-primary rounded-full text-white mt-2 md:col-span-2 w-full"
                        disabled={isPending}
                    >
                        {isPending ? "Creating..." : "Create Admin"}
                    </button>
                </form>
            </div>

            <div className="glass-panel p-6 rounded-2xl max-w-4xl mx-auto">
                <h2 className="text-xl font-bold mb-6">Existing Admins</h2>
                <div className="overflow-x-auto">
                    <table className="table">
                        {/* head */}
                        <thead>
                            <tr className="text-gray-400 border-gray-700">
                                <th>Admin</th>
                                <th>University</th>
                                <th>Email</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {admins?.map((admin) => (
                                <tr key={admin._id} className="border-gray-800 hover:bg-white/[0.02]">
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <div className="avatar">
                                                <div className="mask mask-squircle w-10 h-10">
                                                    <img src={admin.profileImg || "/avatar-placeholder.png"} alt="Avatar" />
                                                </div>
                                            </div>
                                            <div>
                                                <div className="font-bold">{admin.fullName}</div>
                                                <div className="text-sm opacity-50">@{admin.username}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{admin.university}</td>
                                    <td>{admin.email}</td>
                                    <td>
                                        <button
                                            className="btn btn-ghost btn-xs text-error hover:bg-error/10"
                                            onClick={() => {
                                                if (window.confirm("Are you sure you want to delete this admin?")) {
                                                    deleteAdmin(admin._id);
                                                }
                                            }}
                                            disabled={isDeleting}
                                        >
                                            {isDeleting ? "Deleting..." : "Delete"}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {admins?.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="text-center text-gray-500 py-4">
                                        No admins found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminManagement;
