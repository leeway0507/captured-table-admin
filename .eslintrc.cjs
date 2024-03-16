module.exports = {

    extends: ['prettier', 'airbnb', 'airbnb-typescript'],
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json', // Add this line
    },
    rules: {
        'class-methods-use-this': 'off',
        'lines-between-class-members': 'off',
        '@typescript-eslint/lines-between-class-members': 'off',
        'import/extensions': 'off',
        'no-await-in-loop': 'off',
    },
}
