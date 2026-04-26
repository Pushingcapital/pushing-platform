/**
 * PM2 Ecosystem — PushingCapitalTools MCP Server
 * 
 * Deploy SSE mode on any fleet node:
 *   pm2 start ecosystem.config.cjs
 *   pm2 save
 * 
 * The server will auto-restart and be accessible at :8484/sse
 */
module.exports = {
  apps: [
    {
      name: "mcp-tools",
      script: "server.mjs",
      args: "--transport=sse",
      interpreter: "/opt/homebrew/bin/node",
      cwd: __dirname,
      env: {
        GOOGLE_CLOUD_PROJECT: "brain-481809",
        BIGQUERY_LOCATION: "US",
        POSTGRES_HOST: "127.0.0.1",
        POSTGRES_PORT: "5432",
        POSTGRES_DB: "pc_core",
        POSTGRES_USER: "pc_admin",
        POSTGRES_PASSWORD: "nXG0LyenBL6dbbLabMB5Hf6M",
        MCP_PORT: "8484",
        MCP_HOST: "0.0.0.0",
        PATH: "/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin",
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "256M",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      error_file: "logs/mcp-tools-error.log",
      out_file: "logs/mcp-tools-out.log",
      merge_logs: true,
    },
    {
      name: "security-mcp",
      script: "pushing-security-mcp.mjs",
      args: "--transport=sse",
      interpreter: "/opt/homebrew/bin/node",
      cwd: __dirname,
      env: {
        GOOGLE_CLOUD_PROJECT: "brain-481809",
        BIGQUERY_LOCATION: "US",
        SECURITY_MCP_PORT: "3020",
        MCP_HOST: "0.0.0.0",
        PATH: "/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin",
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "256M",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      error_file: "logs/security-mcp-error.log",
      out_file: "logs/security-mcp-out.log",
      merge_logs: true,
    },
  ],
};
