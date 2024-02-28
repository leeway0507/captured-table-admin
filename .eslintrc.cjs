module.exports = {
    'env': {
        'browser': true,
        'es2021': true
    },
    'extends': [
        'eslint:recommended',
        "prettier","airbnb", "airbnb-typescript",

    ],
    'overrides': [
        {
            'env': {
                'node': true
            },
            'files': [
                '.eslintrc.{js,cjs}'
            ],
            'parserOptions': {
                'sourceType': 'script'
            }
        }
    ],
    'parser': '@typescript-eslint/parser',
    'parserOptions': {
        'ecmaVersion': 'latest',
        'sourceType': 'module',
        'project': './tsconfig.json' // Add this line
    },
    'plugins': [
        '@typescript-eslint'
    ],
    'rules': {
		"class-methods-use-this": "off",
        "lines-between-class-members": "off",
        "@typescript-eslint/lines-between-class-members": "off"
    }
}