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
			<div className='flex-[6_0_0] mr-auto min-h-screen rounded-2xl px-0 sm:px-5 py-2 '>
				{/* Header */}
				<div className='flex w-full border-2 border-gray-300 bg-[#fff]  rounded-2xl'>
					<div
						className={
							"flex justify-center flex-1 p-3 hover:bg-ghost transition duration-300 text-[#0f1419] cursor-pointer relative"
						}
						onClick={() => setFeedType("forYou")}
					>
						For you
						{feedType === "forYou" && (
							<div className='absolute bottom-0 w-10  h-1 rounded-full bg-primary'></div>
						)}
					</div>
					<div
						className='flex justify-center flex-1 p-3 hover:bg-ghost transition text-[#0f1419] duration-300 cursor-pointer relative'
						onClick={() => setFeedType("following")}
					>
						Following
						{feedType === "following" && (
							<div className='absolute bottom-0 w-10  h-1 rounded-full bg-primary'></div>
						)}
					</div>
				</div>

				{/*  CREATE POST INPUT */}
				<CreatePost />
				{/* name of each tab group should be unique */}
				<div className="tabs tabs-box sm:flex justify-evenly bg-[#ffffff] ">
					<input
						type="radio"
						name="category"
						className="tab [--tab-bg:#ecf1fc] checked:rounded-full checked:text-black"
						aria-label="Department"
						value="Department"
						onChange={handleChangeCategory}
					/>
					<input
						type="radio"
						name="category"
						className="tab [--tab-bg:#ecf1fc] checked:rounded-full checked:text-black"
						aria-label="Announcement"
						value="Announcement"
						onChange={handleChangeCategory}
					/>
					<input
						type="radio"
						name="category"
						className="tab [--tab-bg:#ecf1fc] checked:rounded-full checked:text-black"
						aria-label="Events"
						value="Events"
						onChange={handleChangeCategory}
					/>
					<input
						type="radio"
						name="category"
						className="tab [--tab-bg:#ecf1fc] checked:rounded-full checked:text-black"
						aria-label="Other"
						value="Other"
						onChange={handleChangeCategory}
					/>
				</div>


				{/* POSTS */}
				<Posts feedType={feedType} category={categorytype} />
			</div>
		</>
	);
};
export default HomePage;