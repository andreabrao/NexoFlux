import type { NextConfig } from "next";

const isGitHubPagesBuild = process.env.GITHUB_ACTIONS === "true";

const nextConfig: NextConfig = {
  assetPrefix: isGitHubPagesBuild ? "/NexoFlux/" : undefined,
  basePath: isGitHubPagesBuild ? "/NexoFlux" : undefined,
  output: isGitHubPagesBuild ? "export" : undefined,
  poweredByHeader: false,
  reactStrictMode: true,
  trailingSlash: isGitHubPagesBuild,
  transpilePackages: ["@nexoflux/contracts"],
};

export default nextConfig;
