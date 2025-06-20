import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
	plugins: [react()],
	base: '/', // ✅ Must be '/' for Netlify root domain
	server: {},
	build: {
		sourcemap: false,
	},
});
