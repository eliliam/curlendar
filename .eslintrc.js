module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	parserOptions: {
		project: `${__dirname}/tsconfig.json`,
	},
	plugins: ['@typescript-eslint'],
	extends: ['storm', 'prettier', 'eslint:recommended', 'plugin:@typescript-eslint/recommended'],
	rules: {
		'no-console': ['off'],
		'no-unused-vars': 'off',
		'@typescript-eslint/no-unused-vars': 'error',
		'no-shadow': 'off',
		'@typescript-eslint/no-shadow': 'warn',
		'no-async-promise-executor': 'off',
		'spaced-comment': [
			'error',
			'always',
			{
				markers: ['/'],
			},
		],
		'no-empty-function': 'off',
		'@typescript-eslint/no-empty-function': ['off'],
		'no-restricted-syntax': 'off',
	},
	env: {
		es6: true,
		node: true,
	},
};
