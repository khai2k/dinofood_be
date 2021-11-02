module.exports = {
  apps: [
    {
      name: 'onib-production:3000',
      script: 'npm',
      args: 'run production',
      // watch: false,
      // instances: 'max',
      // exec_mode: 'cluster',
      env: {
        PORT: 3000,
        NODE_ENV: 'production'
      },

      merge_logs: true,
      log_date_format: 'YYYY-MM-DDTHH:mm:ss.SSS Z',
      log_file: './log/_app_info.log',
      out_file: './log/_app_output.log',
      error_file: './log/_app_error.log'
    },
    {
      name: 'onib-staging:3001',
      script: 'npm',
      args: 'run staging',
      // watch: false,
      // instances: 'max',
      // exec_mode: 'cluster',
      env: {
        PORT: 3001,
        NODE_ENV: 'staging'
      },

      merge_logs: true,
      log_date_format: 'YYYY-MM-DDTHH:mm:ss.SSS Z',
      log_file: './log/_app_info.log',
      out_file: './log/_app_output.log',
      error_file: './log/_app_error.log'
    }
  ]
}
