import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import api from "../../utils/api";
import { FaTrash } from "react-icons/fa";

const StudentManagement = () => {
    const { data: students, refetch } = useQuery({
        queryKey: ["students"],
        queryFn: async () => {
            const res = await api.get("/admin/students");
            return res.data;
        },
    });

    const { mutate: deleteStudent, isPending: isDeleting } = useMutation({
        mutationFn: async (id) => {
            await api.delete(`/admin/user/${id}`);
        },
        onSuccess: () => {
            toast.success("Student deleted successfully");
            refetch();
        },
        onError: (error) => {
            toast.error(error.response?.data?.error || "Failed to delete student");
        },
    });

    return (
        <div className="flex-1 overflow-auto p-4 md:p-8 bg-[#0F1115] min-h-screen text-gray-200 pb-20 md:pb-8">
            <h1 className="text-3xl font-bold mb-8 font-heading bg-gradient-to-r from-artistic-primary to-artistic-secondary bg-clip-text text-transparent">
                Manage Students
            </h1>

            <div className="glass-panel p-6 rounded-2xl max-w-5xl mx-auto">
                <h2 className="text-xl font-bold mb-6">University Students</h2>
                <div className="overflow-x-auto">
                    <table className="table">
                        {/* head */}
                        <thead>
                            <tr className="text-gray-400 border-gray-700">
                                <th>Student</th>
                                <th>Bio</th>
                                <th>University</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students?.map((student) => (
                                <tr key={student._id} className="border-gray-800 hover:bg-white/[0.02]">
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <div className="avatar">
                                                <div className="mask mask-squircle w-10 h-10">
                                                    <img src={student.profileImg || "/avatar-placeholder.png"} alt="Avatar" />
                                                </div>
                                            </div>
                                            <div>
                                                <div className="font-bold">{student.fullName}</div>
                                                <div className="text-sm opacity-50">@{student.username}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="max-w-xs truncate">{student.bio || "No bio"}</td>
                                    <td>{student.university}</td>
                                    <td>
                                        <button
                                            className="btn btn-ghost btn-sm text-error hover:bg-error/10"
                                            onClick={() => {
                                                if (window.confirm("Are you sure you want to delete this student?")) {
                                                    deleteStudent(student._id);
                                                }
                                            }}
                                            disabled={isDeleting}
                                        >
                                            <FaTrash />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {students?.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="text-center text-gray-500 py-8">
                                        No students found in your university.
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

export default StudentManagement;
