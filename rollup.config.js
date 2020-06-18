import multi from '@rollup/plugin-multi-entry';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';


export default [
    {   // Bundle core ECS
        input: 'src/core/ECS.ts',
        output: {
            file: './dist/ECS.js',
            format: 'es',
            sourcemap: true
        },
        plugins: [ commonjs(), resolve({ browser: true }), typescript() ],
    },
    {   // Bundle ECS library of systems/components
        input: ['src/lib/**/*.ts'],
        output: {
            file: './dist/lib.js',
            format: 'es',
            sourcemap: true
        },
        plugins: [ multi(), commonjs(), resolve({ browser: true }), typescript() ],
    },
    // {   // Generate type definitions for above files
    //     input: ['src/core/ECS.ts'],
    //     output: {
    //         dir: './dist/',
    //         format: 'es',
    //         sourcemap: true
    //     },
    //     plugins: [
    //         typescript({
    //             declaration: true,
    //             declarationDir: './dist/@types/',
    //             rootDir: './src/'
    //         })
    //     ],
    // }
]
