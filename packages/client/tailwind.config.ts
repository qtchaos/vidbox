import type { Config } from 'tailwindcss';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				vulcan: '#0F1923',
				bunker: '#0B131B',
				klunker: '#070E15',
				dove: '#6A6A6A',
				shark: '#1D2732'
			}
		}
	},
	plugins: []
} satisfies Config;
