import { sveltekit } from "@sveltejs/kit/vite";

/* GitHub Pages é arquivo estático: configurações públicas precisam ser
   gravadas no bundle durante o build. O prefixo mantém os segredos fora. */
export default {
  plugins: [sveltekit()],
  envPrefix: ["VITE_", "PUBLIC_"],
};
