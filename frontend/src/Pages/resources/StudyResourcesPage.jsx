import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { FaPlus, FaFilePdf, FaFileImage, FaDownload, FaTrash, FaBook, FaSearch } from "react-icons/fa";
import api from "../../utils/api";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import useAuthUser from "../../hooks/useAuthUser";

const StudyResourcesPage = () => {
    const { data: authUser } = useAuthUser();
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("Notes"); // Notes, Past Paper, Assignment
    const [searchTerm, setSearchTerm] = useState("");

    // Form State
    const [formData, setFormData] = useState({
        title: "",
        subject: "",
        type: "Notes",
        semester: "",
        fileUrl: "",
    });
    const [previewFile, setPreviewFile] = useState(null);

    const { data: resources, isLoading } = useQuery({
        queryKey: ["resources"],
        queryFn: async () => {
            const res = await api.get("/resources/all");
            return res.data;
        },
    });

    const { mutate: createResource, isPending: isCreating } = useMutation({
        mutationFn: async (resourceData) => {
            const res = await api.post("/resources/create", resourceData);
            return res.data;
        },
        onSuccess: () => {
            toast.success("Resource uploaded successfully!");
            queryClient.invalidateQueries({ queryKey: ["resources"] });
            setIsModalOpen(false);
            setFormData({ title: "", subject: "", type: "Notes", semester: "", fileUrl: "" });
            setPreviewFile(null);
        },
        onError: (error) => {
            toast.error(error.response?.data?.error || "Failed to upload resource");
        },
    });

    const { mutate: deleteResource, isPending: isDeleting } = useMutation({
        mutationFn: async (id) => {
            await api.delete(`/resources/${id}`);
        },
        onSuccess: () => {
            toast.success("Resource deleted");
            queryClient.invalidateQueries({ queryKey: ["resources"] });
        },
    });

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setFormData({ ...formData, fileUrl: reader.result });
                setPreviewFile(file.name);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        createResource(formData);
    };

    const filteredResources = resources?.filter(res =>
        (activeTab === "All" || res.type === activeTab) &&
        (res.title.toLowerCase().includes(searchTerm.toLowerCase()) || res.subject.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="flex-1 overflow-auto p-4 min-h-screen pb-20 md:pb-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-heading bg-gradient-to-r from-artistic-primary to-artistic-secondary bg-clip-text text-transparent">
                        Study Bank
                    </h1>
                    <p className="text-gray-400 text-sm">Share and find resources at {authUser?.university}</p>
                </div>
                <button
                    className="btn btn-primary rounded-full text-white gap-2 shadow-lg hover:shadow-primary/20"
                    onClick={() => setIsModalOpen(true)}
                >
                    <FaPlus /> <span className="hidden md:inline">Upload Resource</span>
                </button>
            </div>

            {/* Tabs & Search */}
            <div className="flex flex-col md:flex-row gap-4 mb-6 sticky top-0 z-10 bg-[#0f0f11]/80 backdrop-blur-md py-2">
                <div role="tablist" className="tabs tabs-boxed bg-gray-800/50 p-1 rounded-xl">
                    {["Notes", "Past Paper", "Assignment"].map((tab) => (
                        <a
                            key={tab}
                            role="tab"
                            className={`tab transition-all duration-300 ${activeTab === tab ? "tab-active bg-artistic-primary text-white" : ""}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}s
                        </a>
                    ))}
                </div>
                <div className="relative flex-1 max-w-md">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search by title or subject..."
                        className="input input-bordered w-full pl-10 bg-gray-800/50 focus:outline-none focus:border-artistic-primary rounded-xl"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* List */}
            {isLoading ? (
                <div className="flex justify-center h-64"><LoadingSpinner /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredResources?.map((resource) => (
                        <div key={resource._id} className="glass-panel p-4 rounded-xl hover:bg-white/[0.03] transition-all group flex flex-col">
                            <div className="flex justify-between items-start mb-2">
                                <div className="p-3 bg-gray-800/50 rounded-lg text-artistic-primary">
                                    {resource.type === "Notes" ? <FaBook size={24} /> : <FaFilePdf size={24} />}
                                </div>
                                <div className="badge badge-outline text-xs">{resource.type}</div>
                            </div>

                            <h3 className="font-bold text-lg mb-1 truncate" title={resource.title}>{resource.title}</h3>
                            <p className="text-sm text-gray-400 mb-4">{resource.subject} • Sem {resource.semester || "?"}</p>

                            <div className="mt-auto flex justify-between items-center pt-3 border-t border-gray-700/50">
                                <div className="flex items-center gap-2">
                                    <div className="avatar w-6 h-6">
                                        <div className="rounded-full">
                                            <img src={resource.user.profileImg || "/avatar-placeholder.png"} />
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-500 truncate max-w-[80px]">{resource.user.fullName}</span>
                                </div>

                                <div className="flex gap-2">
                                    <a
                                        href={resource.fileUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="btn btn-xs btn-primary btn-outline"
                                    >
                                        <FaDownload />
                                    </a>
                                    {(authUser?._id === resource.user._id || authUser?.role === 'admin' || authUser?.role === 'superadmin') && (
                                        <button
                                            className="btn btn-ghost btn-xs text-error"
                                            onClick={() => {
                                                if (window.confirm("Delete this resource?")) deleteResource(resource._id)
                                            }}
                                            disabled={isDeleting}
                                        >
                                            <FaTrash />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {filteredResources?.length === 0 && (
                        <div className="col-span-full text-center py-20 text-gray-500">
                            <FaBook className="mx-auto text-4xl mb-4 opacity-20" />
                            <p>No {activeTab.toLowerCase()}s found. Upload one to help others!</p>
                        </div>
                    )}
                </div>
            )}

            {/* Upload Modal */}
            {isModalOpen && (
                <dialog className="modal modal-open modal-bottom sm:modal-middle bg-black/60 backdrop-blur-sm">
                    <div className="modal-box glass-panel border border-gray-700 p-0 max-w-lg w-full max-h-[90vh] flex flex-col">
                        <div className="p-6 overflow-y-auto">
                            <h3 className="font-bold text-xl mb-6">Upload Resource</h3>
                            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                                <input
                                    type="text"
                                    placeholder="Title (e.g. Data Structures Midterm)"
                                    className="input input-bordered w-full bg-black/20 focus:outline-none focus:border-artistic-primary"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                                <div className="flex gap-4">
                                    <input
                                        type="text"
                                        placeholder="Subject (e.g. CS101)"
                                        className="input input-bordered w-full bg-black/20 focus:outline-none focus:border-artistic-primary"
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                        required
                                    />
                                    <input
                                        type="number"
                                        placeholder="Semester"
                                        className="input input-bordered w-24 bg-black/20 focus:outline-none focus:border-artistic-primary"
                                        value={formData.semester}
                                        onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                                    />
                                </div>
                                <select
                                    className="select select-bordered w-full bg-black/20 focus:outline-none focus:border-artistic-primary"
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                >
                                    <option>Notes</option>
                                    <option>Past Paper</option>
                                    <option>Assignment</option>
                                    <option>Other</option>
                                </select>

                                {/* File Upload */}
                                <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center cursor-pointer hover:border-artistic-primary transition-colors relative">
                                    <input
                                        type="file"
                                        accept="application/pdf,image/*"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        onChange={handleFileChange}
                                        required={!formData.fileUrl}
                                    />
                                    {previewFile ? (
                                        <div className="flex flex-col items-center text-primary">
                                            <FaFilePdf className="text-4xl mb-2" />
                                            <span className="text-sm font-bold truncate max-w-xs">{previewFile}</span>
                                            <button
                                                type="button"
                                                className="mt-2 btn btn-xs btn-error btn-outline"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setPreviewFile(null);
                                                    setFormData({ ...formData, fileUrl: "" });
                                                }}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="text-gray-400">
                                            <FaDownload className="mx-auto text-3xl mb-3 opacity-50" />
                                            <p className="font-bold">Click to upload file</p>
                                            <p className="text-xs mt-1">PDF or Images only</p>
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
                                        {isCreating ? <LoadingSpinner size="sm" /> : "Upload"}
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

export default StudyResourcesPage;
