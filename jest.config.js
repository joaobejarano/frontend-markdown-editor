module.exports = {
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    "/node_modules/(?!(axios|react-markdown)/)"
  ],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  testEnvironment: 'jsdom', // Importante para suportar código que depende de DOM, como React

  extensionsToTreatAsEsm: [".ts", ".tsx", ".jsx"],
};
