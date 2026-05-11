module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "^nanoid$": "<rootDir>/__mocks__/nanoid.js",
  },
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { tsconfig: { jsx: "react", esModuleInterop: true } }],
  },
};
