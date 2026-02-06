import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../utils/api";

const EditProfileModal = ({ authUser }) => {
	const [formData, setFormData] = useState({
		fullName: "",
		username: "",
		email: "",
		bio: "",
		link: "",
		newPassword: "",
		currentPassword: "",
	});

	const queryClient = useQueryClient();
	const { mutate: updateProfile, isPending: isUpdatingProfile } = useMutation({
		mutationFn: async () => {
			try {
				const res = await api.post("/user/updateProfile", formData);
				return res.data;
			} catch (error) {
				console.error("Error updating profile in EditProfileModal:", error);
				throw error;
			}
		},
		onSuccess: () => {
			toast.success("Profile updated");
			// Invalidate queries to refetch latest user data across the app
			Promise.all([
				queryClient.invalidateQueries({ queryKey: ["authUser"] }),
				queryClient.invalidateQueries({ queryKey: ["userProfile"] }),
			])
		},
		onError: (error) => {
			toast.error(error.message);
		},
	})

	const handleInputChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	useEffect(() => {
		// Populate form data with authUser details when the modal opens or authUser changes
		if (authUser) {
			setFormData({
				fullName: authUser.fullName,
				username: authUser.username,
				email: authUser.email,
				bio: authUser.bio,
				link: authUser.link,
				newPassword: "", // Passwords should not be pre-filled
				currentPassword: "", // Passwords should not be pre-filled
			})
		}
	}, [authUser])

	return (
		<>
			<button
				className='btn  bg-[#1d9bf0] text-white hover:bg-[#1a8cd8] rounded-full btn-sm'
				onClick={() => document.getElementById("edit_profile_modal").showModal()}
			>
				Edit profile
			</button>
			<dialog id='edit_profile_modal' className='modal'>
				<div className='modal-box bg-[#181A20] border border-gray-700 shadow-2xl rounded-3xl'>
					<h3 className='font-bold text-xl my-3 text-white font-heading'>Update Profile</h3>
					<form
						className='flex flex-col gap-4'
						onSubmit={(e) => {
							e.preventDefault();
							updateProfile();
						}}
					>
						<div className='flex flex-wrap gap-2'>
							<input
								type='text'
								placeholder='Full Name'
								className='flex-1 input bg-[#0F1115] border border-gray-700 rounded-xl p-3 text-white focus:border-artistic-primary focus:outline-none'
								value={formData.fullName}
								name='fullName'
								onChange={handleInputChange}
							/>
							<input
								type='text'
								placeholder='Username'
								className='flex-1 input bg-[#0F1115] border border-gray-700 rounded-xl p-3 text-white focus:border-artistic-primary focus:outline-none'
								value={formData.username}
								name='username'
								onChange={handleInputChange}
							/>
						</div>
						<div className='flex flex-wrap gap-2'>
							<input
								type='email'
								placeholder='Email'
								className='flex-1 input bg-[#0F1115] border border-gray-700 rounded-xl p-3 text-white focus:border-artistic-primary focus:outline-none'
								value={formData.email}
								name='email'
								onChange={handleInputChange}
							/>
							<textarea
								placeholder='Bio'
								className='flex-1 input bg-[#0F1115] border border-gray-700 rounded-xl p-3 text-white focus:border-artistic-primary focus:outline-none min-h-[50px] pt-3'
								value={formData.bio}
								name='bio'
								onChange={handleInputChange}
							/>
						</div>
						<div className='flex flex-wrap gap-2'>
							<input
								type='password'
								placeholder='Current Password'
								className='flex-1 input bg-[#0F1115] border border-gray-700 rounded-xl p-3 text-white focus:border-artistic-primary focus:outline-none'
								value={formData.currentPassword}
								name='currentPassword'
								onChange={handleInputChange}
							/>
							<input
								type='password'
								placeholder='New Password'
								className='flex-1 input bg-[#0F1115] border border-gray-700 rounded-xl p-3 text-white focus:border-artistic-primary focus:outline-none'
								value={formData.newPassword}
								name='newPassword'
								onChange={handleInputChange}
							/>
						</div>
						<input
							type='text'
							placeholder='Link'
							className='flex-1 input bg-[#0F1115] border border-gray-700 rounded-xl p-3 text-white focus:border-artistic-primary focus:outline-none'
							value={formData.link}
							name='link'
							onChange={handleInputChange}
						/>
						<button className='btn btn-primary rounded-xl btn-sm text-white h-10 mt-2 shadow-lg hover:shadow-artistic-primary/30'>
							{isUpdatingProfile ? "Updating..." : "Update Profile"}
						</button>
					</form>
				</div>
				<form method='dialog' className='modal-backdrop bg-black/60 backdrop-blur-sm'>
					<button className='outline-none'>close</button>
				</form>
			</dialog>
		</>
	);
};
export default EditProfileModal;