import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        games: 'games.html',
        game: 'game.html',
        diagnostics: 'diagnostics.html',
        play: 'play.html',
        profile: 'profile.html',
        shop: 'shop.html',
        classifieds: 'classifieds.html',
        meetups: 'meetups.html',
        economics: 'economics.html',
        docs: 'docs.html',
        directory: 'directory.html',
        marketplace: 'marketplace.html',
        sound: 'sound.html',
        omni: 'omni.html',
        avatars: 'avatars.html',
        gridWorldStudio: 'grid-world-studio.html',
        textures: 'textures.html',
        join: 'join.html',
        social: 'social.html',
        membership: 'membership.html',
        enter: 'enter.html',
        confirmed: 'confirmed.html',
        recover: 'recover.html',
        home: 'home.html',
      },
    },
  },
});
