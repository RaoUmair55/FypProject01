import { useState } from "react";

import Posts from "../../components/common/Posts";
import CreatePost from "./CreatePost";

const HomePage = () => {
	const [feedType, setFeedType] = useState("forYou");
	const [categorytype, setCategorytype] = useState("Announcement");
	const handleChangeCategory = (e) => {
		setFeedType("category");
		setCategorytype(e.target.value);
	};


	return (
		<>
			<div className='flex-1 min-w-0 min-h-screen rounded-2xl px-0 sm:px-4 py-2'>
				{/* Header */}
				<div className='flex w-full glass-panel rounded-full mb-4 overflow-hidden'>
					<div
						className={
							`flex justify-center flex-1 p-3 transition duration-300 cursor-pointer relative font-heading font-semibold ${feedType === "forYou" ? "text-white bg-artistic-primary/10" : "text-gray-400 hover:bg-white/5"
							}`
						}
						onClick={() => setFeedType("forYou")}
					>
						For you
						{feedType === "forYou" && (
							<div className='absolute bottom-0 w-12 h-1 rounded-full bg-artistic-primary'></div>
						)}
					</div>
					<div
						className={
							`flex justify-center flex-1 p-3 transition duration-300 cursor-pointer relative font-heading font-semibold ${feedType === "following" ? "text-white bg-artistic-primary/10" : "text-gray-400 hover:bg-white/5"
							}`
						}
						onClick={() => setFeedType("following")}
					>
						Following
						{feedType === "following" && (
							<div className='absolute bottom-0 w-12 h-1 rounded-full bg-artistic-primary'></div>
						)}
					</div>
				</div>

				{/*  CREATE POST INPUT */}
				<CreatePost />

				{/* Categories */}
				<div className="flex justify-between glass-panel p-1 rounded-xl mb-4 overflow-x-auto custom-scrollbar">
					{["Department", "Announcement", "Events", "Other"].map((cat) => (
						<label
							key={cat}
							className={`flex-1 flex justify-center items-center py-2 px-4 rounded-lg cursor-pointer transition-all duration-300 text-sm font-medium ${categorytype === cat
								? "bg-artistic-primary text-white shadow-lg shadow-artistic-primary/25"
								: "text-gray-400 hover:bg-white/5 hover:text-white"
								}`}
						>
							<input
								type="radio"
								name="category"
								className="hidden"
								value={cat}
								onChange={handleChangeCategory}
								checked={categorytype === cat}
							/>
							{cat}
						</label>
					))}
				</div>

				{/* POSTS */}
				<Posts feedType={feedType} category={categorytype} />
			</div>
		</>
	);
};
export default HomePage;