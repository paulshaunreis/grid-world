import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        play: 'play.html',
        profile: 'profile.html',
        economics: 'economics.html',
        docs: 'docs.html',
        directory: 'directory.html',
        marketplace: 'marketplace.html',
        sound: 'sound.html',
        omni: 'omni.html',
        avatars: 'avatars.html',
        gridWorldStudio: 'grid-world-studio.html',
      },
    },
  },
});
