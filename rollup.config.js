import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';


export default [
    {
        input: 'src/index.ts',
        output: {
            file: './dist/ECS.js',
            format: 'es',
            sourcemap: true
        },
        plugins: [ commonjs(), resolve({ browser: true }), typescript() ],
    }
]
