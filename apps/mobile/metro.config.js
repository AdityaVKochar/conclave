const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const config = getDefaultConfig(__dirname);
const workspaceRoot = path.resolve(__dirname, "../..");
const appsSdkPath = path.resolve(workspaceRoot, "packages/apps-sdk");

config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve("react-native-svg-transformer"),
};
config.resolver = {
  ...config.resolver,
  assetExts: config.resolver.assetExts.filter((ext) => ext !== "svg"),
  sourceExts: [...config.resolver.sourceExts, "svg"],
  nodeModulesPaths: [
    path.resolve(__dirname, "node_modules"),
    path.resolve(workspaceRoot, "node_modules"),
  ],
  disableHierarchicalLookup: true,
};

config.watchFolders = [appsSdkPath];

module.exports = withNativeWind(config, { input: './src/global.css' });
