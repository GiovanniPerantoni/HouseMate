module.exports = {
	setupFiles: ["<rootDir>/.jest/setEnvVars.js"],
	setupFilesAfterEnv: ["<rootDir>/.jest/beforeTesting.js"],
	setupFilesAfterEnv: [
		"<rootDir>/.jest/setup.js"
	],
	verbose: true,
	collectCoverage: true,
	globals: {
		email: "admin@admin.com",
		pass: "admin"
	}
}