import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { FaPlus, FaTag, FaTrash, FaMoneyBillWave } from "react-icons/fa";
import api from "../../utils/api";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import useAuthUser from "../../hooks/useAuthUser";

const MarketplacePage = () => {
    const { data: authUser } = useAuthUser();
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        price: "",
        description: "",
        condition: "Good",
        img: null,
    });
    const [previewImg, setPreviewImg] = useState(null);

    const { data: products, isLoading } = useQuery({
        queryKey: ["products"],
        queryFn: async () => {
            const res = await api.get("/products/all");
            return res.data;
        },
    });

    const { mutate: createProduct, isPending: isCreating } = useMutation({
        mutationFn: async (productData) => {
            const res = await api.post("/products/create", productData);
            return res.data;
        },
        onSuccess: () => {
            toast.success("Item listed successfully!");
            queryClient.invalidateQueries({ queryKey: ["products"] });
            setIsModalOpen(false);
            setFormData({ name: "", price: "", description: "", condition: "Good", img: null });
            setPreviewImg(null);
        },
        onError: (error) => {
            toast.error(error.response?.data?.error || "Failed to list item");
        },
    });

    const { mutate: deleteProduct, isPending: isDeleting } = useMutation({
        mutationFn: async (id) => {
            await api.delete(`/products/${id}`);
        },
        onSuccess: () => {
            toast.success("Item removed");
            queryClient.invalidateQueries({ queryKey: ["products"] });
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
        createProduct(formData);
    };

    return (
        <div className="flex-1 overflow-auto p-4 min-h-screen pb-20 md:pb-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold font-heading bg-gradient-to-r from-artistic-primary to-artistic-secondary bg-clip-text text-transparent">
                        Campus Marketplace
                    </h1>
                    <p className="text-gray-400 text-sm">Buy and sell within {authUser?.university}</p>
                </div>
                <button
                    className="btn btn-primary rounded-full text-white gap-2 shadow-lg hover:shadow-primary/20"
                    onClick={() => setIsModalOpen(true)}
                >
                    <FaPlus /> <span className="hidden md:inline">Sell Item</span>
                </button>
            </div>

            {/* List */}
            {isLoading ? (
                <div className="flex justify-center h-64"><LoadingSpinner /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products?.map((product) => (
                        <div key={product._id} className="glass-panel rounded-2xl overflow-hidden hover:bg-white/[0.02] transition-all group relative">
                            {/* Image */}
                            <div className="h-48 bg-gray-800/50 w-full overflow-hidden relative">
                                {product.img ? (
                                    <img src={product.img} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-600">
                                        <FaTag size={40} />
                                    </div>
                                )}
                                <div className="absolute top-2 right-2 badge badge-neutral bg-black/60 border-none text-xs backdrop-blur-sm">
                                    {product.condition}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-lg truncate pr-2 text-gray-100">{product.name}</h3>
                                    <p className="text-artistic-primary font-bold whitespace-nowrap">${product.price}</p>
                                </div>
                                <p className="text-gray-400 text-sm line-clamp-2 mb-4 h-10">{product.description}</p>

                                <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-700/50">
                                    <div className="flex items-center gap-2">
                                        <div className="avatar w-6 h-6">
                                            <div className="rounded-full">
                                                <img src={product.user.profileImg || "/avatar-placeholder.png"} />
                                            </div>
                                        </div>
                                        <span className="text-xs text-gray-500 truncate max-w-[100px]">{product.user.fullName}</span>
                                    </div>

                                    {(authUser?._id === product.user._id || authUser?.role === 'admin' || authUser?.role === 'superadmin') ? (
                                        <button
                                            className="btn btn-ghost btn-xs text-error"
                                            onClick={() => {
                                                if (window.confirm("Delete this item?")) deleteProduct(product._id)
                                            }}
                                            disabled={isDeleting}
                                        >
                                            <FaTrash />
                                        </button>
                                    ) : (
                                        <button className="btn btn-xs btn-outline btn-primary">Contact</button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {products?.length === 0 && (
                        <div className="col-span-full text-center py-20 text-gray-500">
                            <FaTag className="mx-auto text-4xl mb-4 opacity-20" />
                            <p>No items found. Be the first to sell something!</p>
                        </div>
                    )}
                </div>
            )}

            {/* Sell Modal */}
            {isModalOpen && (
                <dialog className="modal modal-open modal-bottom sm:modal-middle bg-black/60 backdrop-blur-sm">
                    <div className="modal-box glass-panel border border-gray-700 p-0 max-w-lg w-full max-h-[90vh] flex flex-col">
                        <div className="p-6 overflow-y-auto">
                            <h3 className="font-bold text-xl mb-6">List an Item</h3>
                            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                                <input
                                    type="text"
                                    placeholder="Product Name"
                                    className="input input-bordered w-full bg-black/20 focus:outline-none focus:border-artistic-primary"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                                <div className="flex gap-4">
                                    <div className="relative flex-1">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">$</div>
                                        <input
                                            type="number"
                                            placeholder="Price"
                                            className="input input-bordered w-full pl-8 bg-black/20 focus:outline-none focus:border-artistic-primary"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <select
                                        className="select select-bordered flex-1 bg-black/20 focus:outline-none focus:border-artistic-primary"
                                        value={formData.condition}
                                        onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                                    >
                                        <option>New</option>
                                        <option>Like New</option>
                                        <option>Good</option>
                                        <option>Fair</option>
                                    </select>
                                </div>
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
                                            <FaTag className="mx-auto text-2xl mb-2 opacity-50" />
                                            <p className="text-sm">Click to upload photo</p>
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
                                        {isCreating ? <LoadingSpinner size="sm" /> : "List Item"}
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

export default MarketplacePage;
