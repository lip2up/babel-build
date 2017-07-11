module.exports = {
    babelrc: false,
    plugins: [
        [ 'transform-es2015-block-scoped-functions' ],
        [ 'transform-es2015-arrow-functions' ],
        [ 'transform-es2015-template-literals', { loose: true } ],
        [ 'transform-es2015-shorthand-properties' ],
        [ 'transform-es2015-computed-properties', { loose: true } ],
        [ 'transform-es2015-parameters' ],
        [ 'transform-es2015-destructuring' ],
        [ 'transform-es2015-spread', { loose: true } ],
        [ 'transform-object-rest-spread', { useBuiltIns: true } ],
        [ 'transform-function-bind' ],
        [ 'transform-es2015-block-scoping' ],
        [ 'transform-es2015-literals' ],
        [ 'transform-exponentiation-operator' ],
        [ 'transform-es2015-for-of', { loose: true } ],
        [ 'transform-class-properties', { spec: false } ],
        [ 'transform-es2015-classes', { loose: true } ],
        [ 'transform-runtime', { helpers: true, polyfill: false, regenerator: false, moduleName: 'j/babel-runtime' } ],
        [ 'transform-es2015-modules-commonjs', { loose: true, allowTopLevelThis: true } ],
    ],
    ast: false,
    parserOpts: {
        allowReturnOutsideFunction: true,
    },
    generatorOpts: {
        quotes: 'single',
    }
}