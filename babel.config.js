module.exports = {
  presets: [
    'module:@react-native/babel-preset',
    "module:metro-react-native-babel-preset", // For React Native
    "@babel/preset-env",  // To compile ES6+ syntax
    "@babel/preset-react" // To compile JSX syntax
],
  
};
