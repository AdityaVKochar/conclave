const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const fs = require("fs");
const path = require("path");

const config = getDefaultConfig(__dirname);
const workspaceRoot = path.resolve(__dirname, "../..");
const appsSdkPath = path.resolve(workspaceRoot, "packages/apps-sdk");
const workspaceNodeModulesPath = path.resolve(workspaceRoot, "node_modules");
const isomorphicWebcryptoShimPackagePath = path.resolve(
  __dirname,
  "src/shims/isomorphic-webcrypto"
);
const eventTargetShimCandidates = [
  path.resolve(__dirname, "node_modules/react-native-webrtc/node_modules/event-target-shim"),
  path.resolve(workspaceNodeModulesPath, "react-native-webrtc/node_modules/event-target-shim"),
  path.resolve(__dirname, "node_modules/event-target-shim"),
  path.resolve(workspaceNodeModulesPath, "event-target-shim"),
];
const eventTargetShimPath =
  eventTargetShimCandidates.find((candidate) =>
    fs.existsSync(path.join(candidate, "index.js"))
  ) ?? eventTargetShimCandidates[0];
const eventTargetShimIndexPath = path.join(eventTargetShimPath, "index.js");
const yjsPath = path.resolve(workspaceNodeModulesPath, "yjs");
const yProtocolsPath = path.resolve(workspaceNodeModulesPath, "y-protocols");
const lib0Path = path.resolve(workspaceNodeModulesPath, "lib0");

config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve("react-native-svg-transformer"),
};
config.resolver = {
  ...config.resolver,
  assetExts: config.resolver.assetExts.filter((ext) => ext !== "svg"),
  sourceExts: [...config.resolver.sourceExts, "svg"],
  extraNodeModules: {
    ...(config.resolver.extraNodeModules ?? {}),
    "event-target-shim": eventTargetShimPath,
    "event-target-shim/index": eventTargetShimIndexPath,
    "isomorphic-webcrypto": isomorphicWebcryptoShimPackagePath,
    yjs: yjsPath,
    "y-protocols": yProtocolsPath,
    lib0: lib0Path,
  },
  nodeModulesPaths: [
    path.resolve(__dirname, "node_modules"),
    workspaceNodeModulesPath,
  ],
  disableHierarchicalLookup: true,
};

config.watchFolders = [appsSdkPath, workspaceNodeModulesPath];

module.exports = withNativeWind(config, { input: './src/global.css' });
