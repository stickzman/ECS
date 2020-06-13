import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';


export default [
    {
        input: 'src/index.ts',
        output: {
            file: './dist/ECS.js',
            format: 'es',
            sourceMap: true
        },
        plugins: [ commonjs(), resolve({ browser: true }), typescript() ],
    },
    {
        input: 'src/core/ECS.ts',
        output: {
            file: './dist/ECS.thin.js',
            format: 'es',
        },
        plugins: [ typescript() ],
    }
]
