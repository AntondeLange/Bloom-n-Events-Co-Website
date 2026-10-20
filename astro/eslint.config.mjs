import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
// Lint the maintained TypeScript interactions and shared server contract.
const files = [
 'src/lib/enquiry.ts', 'src/server/**/*.ts',
 'src/components/react/{ContactForm,ChatConcierge,ImageLightbox}.tsx',
 'src/components/islands/{Navbar,Carousel}.tsx',
];
export default tseslint.config(
 { ignores: ['dist/**', '.astro/**', '.vercel/**', 'node_modules/**'] },
 { files, extends: [eslint.configs.recommended, ...tseslint.configs.recommended] },
);
