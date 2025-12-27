// Removed references to 'vite/client' and 'vite-plugin-pwa/client' to resolve "Cannot find type definition file" errors.
// Added process.env declaration as assumed by the configuration.

declare const process: {
  env: {
    [key: string]: string | undefined;
    API_KEY?: string;
  }
};
