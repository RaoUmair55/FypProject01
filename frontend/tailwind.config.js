import daisyui from "daisyui";
// import daisyUIThemes from "daisyui/src/theming/themes";
/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			fontFamily: {
				sans: ['Inter', 'sans-serif'],
				heading: ['Outfit', 'sans-serif'],
			},
			colors: {
				// Artistic Dark Palette
				artistic: {
					base: "#0F1115",    // Deep Charcoal (Background)
					surface: "#181A20", // Slightly lighter for cards
					primary: "#7c3aed", // Electric Violet
					secondary: "#2dd4bf", // Teal/Aqua
					accent: "#f472b6",   // Pink accent for subtler touches
					text: "#e2e8f0",    // Light Gray text
					muted: "#94a3b8",   // Muted text
				}
			}
		},
	},
	plugins: [daisyui],

	daisyui: {
		themes: [
			{
				artistic: {
					"primary": "#7c3aed",
					"secondary": "#2dd4bf",
					"accent": "#f472b6",
					"neutral": "#181A20",
					"base-100": "#0F1115",
					"info": "#3abff8",
					"success": "#36d399",
					"warning": "#fbbd23",
					"error": "#f87272",
				},
			},
			"light",
			"dark"
		],
	}
}