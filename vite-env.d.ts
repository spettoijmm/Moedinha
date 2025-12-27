// Removed references to 'vite/client' and 'vite-plugin-pwa/client' to resolve "Cannot find type definition file" errors.
// Added process.env declaration as assumed by the configuration.

// Fix: Instead of redeclaring 'process' as a variable, which causes "Cannot redeclare block-scoped variable" errors 
// if it's already defined elsewhere, we augment the NodeJS namespace to add the necessary environment variables.
declare namespace NodeJS {
  interface ProcessEnv {
    [key: string]: string | undefined;
    API_KEY?: string;
  }
}
