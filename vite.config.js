import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	server: {
		proxy: {
			'/api/v1/users': {
				target: 'http://localhost:4000',
				changeOrigin: true,
				secure: false,
			},
			'/api/v1/chat': {
				target: 'http://localhost:4000',
				changeOrigin: true,
				secure: false,
			},
		},
	},
	build: {
		sourcemap: false, // Disable source maps
	},
});
