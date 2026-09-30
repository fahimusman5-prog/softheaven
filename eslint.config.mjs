import {defineConfig,globalIgnores} from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
export default defineConfig([...nextVitals,...nextTs,{rules:{'@typescript-eslint/no-explicit-any':'off','react-hooks/set-state-in-effect':'off','react-hooks/immutability':'off','react-hooks/refs':'off','@next/next/no-img-element':'off'}},globalIgnores(['.next/**','.next-qa-build/**','node_modules/**','next-env.d.ts','app/page 2.tsx'])]);
