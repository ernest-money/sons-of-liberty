const environments = {
  development: {
    apiBaseUrl: "/api",
    domain: "localhost",
  },
  staging: {
    apiBaseUrl: "/api",
    domain: "staging.ernest.money",
  },
  production: {
    apiBaseUrl: "/api",
    domain: "app.ernest.money",
  },
};

// Get the current environment
const env = process.env.NODE_ENV || "development";
const config = environments[env as keyof typeof environments];

export default config;
