import { CiImageOn } from "react-icons/ci";
import { BsEmojiSmileFill } from "react-icons/bs";
import { useRef, useState } from "react";
import { IoCloseSharp } from "react-icons/io5";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useEffect } from "react";
import EmojiPicker from "emoji-picker-react";


import api from "../../utils/api";
import useAuthUser from "../../hooks/useAuthUser";

const CreatePost = () => {
    const { data: authUser } = useAuthUser();
    const queryClient = useQueryClient();

    const [text, setText] = useState("");
    const [img, setImg] = useState(null);
    const [category, setCategory] = useState("Department");
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [showPicker, setShowPicker] = useState(false);

    const imgRef = useRef(null);
    const textareaRef = useRef(null);
    const categoryRef = useRef(null);
    const emojiRef = useRef(null);
    const {
        mutate: createPost,
        isPending,
        isError,
        error,
    } = useMutation({
        mutationFn: async ({ text, img, category }) => {
            try {
                const formData = new FormData();
                formData.append("text", text);
                formData.append("category", category);
                if (img) {
                    formData.append("image", img); // Make sure backend expects 'image'
                }
                formData.append("isAnonymous", isAnonymous.toString());

                const res = await api.post("/posts/create", formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                });
                return res.data;
            } catch (error) {
                console.error("Error in createPost mutation:", error);
                throw error;
            }
        },
        onSuccess: (data) => {
            console.log("Post creation successful:", data);
            setText("");
            setImg(null);
            toast.success("Post created successfully!");
            if (imgRef.current) imgRef.current.value = null;

            queryClient.invalidateQueries({ queryKey: ["posts"] });
        }
    });

    const onEmojiClick = (emojiData) => {
        setText(prev => prev + emojiData.emoji);
        textareaRef.current.focus();
    };

    // Use authUser data for profile image if available, otherwise fallback
    const profileImg = authUser?.profileImg || "/avatar-placeholder.png";

    const handleSubmit = (e) => {
        e.preventDefault();
        createPost({ text, img, category });
    };

    const addAnimation = () => {
        const textarea = textareaRef.current;
        const categoryDiv = categoryRef.current;

        if (textarea) {
            textarea.style.transition = "height 0.2s ease";
            textarea.style.height = "auto";
            textarea.style.height = `${textarea.scrollHeight}px`;
        }

        if (categoryDiv && categoryDiv.classList.contains("hidden")) {
            categoryDiv.classList.remove("hidden");
            void categoryDiv.offsetWidth; // Force reflow
            categoryDiv.classList.add("animate__animated", "animate__fadeInDown");
            categoryDiv.addEventListener(
                "animationend",
                () => {
                    categoryDiv.classList.remove("animate__animated", "animate__fadeInDown");
                },
                { once: true }
            );
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                textareaRef.current &&
                categoryRef.current &&
                !textareaRef.current.contains(event.target) &&
                !categoryRef.current.contains(event.target)
            ) {
                const categoryDiv = categoryRef.current;
                categoryDiv.classList.remove("animate__fadeInDown");
                categoryDiv.classList.add("animate__animated", "animate__fadeOutUp");

                categoryDiv.addEventListener(
                    "animationend",
                    () => {
                        categoryDiv.classList.add("hidden");
                        categoryDiv.classList.remove("animate__animated", "animate__fadeOutUp");
                    },
                    { once: true }
                );
            }
            if (
                emojiRef.current &&
                !emojiRef.current.contains(event.target) &&
                !event.target.closest(".emoji-trigger")
            ) {
                setShowPicker(false);
            }
        };

        document.addEventListener("click", handleClickOutside);
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, []);

    const handleImgChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImg(file);
        }
    };

    return (
        <div className="flex p-4 items-start gap-4 rounded-2xl my-4 glass-panel">
            <div className="avatar">
                <div className="w-10 rounded-full border border-gray-600">
                    <img src={profileImg} alt="User Profile" />
                </div>
            </div>
            <form className="flex flex-col gap-3 w-full" onSubmit={handleSubmit}>
                <textarea
                    className="textarea w-full p-3 text-lg text-white resize-none focus:outline-none bg-transparent border-none placeholder-gray-500"
                    placeholder="What is happening?!"
                    value={text}
                    ref={textareaRef}
                    onClick={addAnimation}
                    onChange={(e) => setText(e.target.value)}
                />

                {/* Category Selection */}
                <div ref={categoryRef} role="alert" className="alert bg-transparent border-none p-0 flex flex-col gap-2 items-start hidden">
                    <div className="flex justify-start gap-2 text-artistic-primary items-center">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            className="stroke-current h-5 w-5 shrink-0"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            ></path>
                        </svg>
                        <span className="text-sm">Select Category</span>
                    </div>

                    <div className="flex flex-wrap gap-2 text-white">
                        {["Department", "Announcement", "Events", "Other"].map((cat) => (
                            <label
                                key={cat}
                                className={`cursor-pointer px-3 py-1 rounded-full text-xs font-medium border transition-colors ${category === cat
                                    ? "bg-artistic-primary border-artistic-primary text-white"
                                    : "border-gray-600 text-gray-400 hover:bg-white/5"
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name="category"
                                    className="hidden"
                                    onChange={() => setCategory(cat)}
                                    checked={category === cat}
                                />
                                {cat}
                            </label>
                        ))}
                    </div>

                    <label className="label cursor-pointer justify-start gap-2 mt-2">
                        <span className="label-text text-gray-400 text-sm">Post anonymously</span>
                        <input
                            type="checkbox"
                            checked={isAnonymous}
                            className="toggle toggle-primary toggle-sm"
                            onChange={() => setIsAnonymous(!isAnonymous)}
                        />
                    </label>
                </div>

                {img && (
                    <div className="relative w-full mx-auto mt-2">
                        <IoCloseSharp
                            className="absolute top-2 right-2 text-white bg-black/50 hover:bg-black/70 rounded-full w-6 h-6 p-1 cursor-pointer transition-colors backdrop-blur-sm"
                            onClick={() => {
                                setImg(null);
                                imgRef.current.value = null;
                            }}
                        />
                        <img
                            src={URL.createObjectURL(img)}
                            className="w-full max-h-[400px] object-cover rounded-xl border border-gray-700"
                            alt="Selected Image"
                        />
                    </div>
                )}

                <div className="flex justify-between border-t border-gray-700/50 pt-3 mt-2">
                    <div className="flex gap-4 items-center">
                        <CiImageOn
                            className="text-artistic-primary w-6 h-6 cursor-pointer hover:text-white transition-colors"
                            onClick={() => imgRef.current.click()}
                        />
                        <div className="relative">
                            <BsEmojiSmileFill
                                className="text-artistic-primary w-5 h-5 cursor-pointer hover:text-white transition-colors emoji-trigger"
                                onClick={() => setShowPicker(val => !val)}
                            />
                            {showPicker && (
                                <div ref={emojiRef} className="absolute top-full mt-2 z-50">
                                    <EmojiPicker theme="dark" onEmojiClick={onEmojiClick} />
                                </div>
                            )}
                        </div>
                    </div>
                    <div>
                        <input
                            type="file"
                            accept="image/*"
                            hidden
                            ref={imgRef}
                            onChange={handleImgChange}
                        />

                        <button
                            className="btn btn-primary rounded-full btn-sm text-white px-6"
                            disabled={isPending}
                        >
                            {isPending ? "Buzzing..." : "Buzzz"}
                        </button>
                    </div>
                </div>
                {isError && <div className="text-error text-sm mt-2">{error.message}</div>}
            </form>
        </div>
    );
};
export default CreatePost;