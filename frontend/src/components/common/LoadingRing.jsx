const LoadingRing = ({ size = "md" }) => {
	const sizeClass = `loading-${size}`;

	return <span className={`loading loading-ring ${sizeClass}`} />;
};
export default LoadingRing;