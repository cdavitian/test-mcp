const { runWorkflow } = require('./dist/testmcp.js');
const http = require('http');

// Check for required environment variables
function checkEnvironmentVariables() {
  const requiredEnvVars = ['OPENAI_API_KEY', 'MCP_AUTHORIZATION_TOKEN'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('Missing required environment variables:', missingVars.join(', '));
    console.error('Please set the following environment variables:');
    missingVars.forEach(varName => {
      console.error(`  - ${varName}`);
    });
    console.error('Application will not start without these variables.');
    console.error('Please configure the environment variables in your Railway deployment settings.');
    // Don't exit immediately - let the process handle it gracefully
    return false;
  }
  return true;
}

// Example usage - you can modify this based on your needs
async function main() {
  try {
    // Check environment variables before proceeding
    if (!checkEnvironmentVariables()) {
      console.log('Waiting for environment variables to be configured...');
      // Keep the process alive but don't crash
      setInterval(() => {
        console.log('Still waiting for environment variables...');
      }, 30000); // Log every 30 seconds
      return;
    }
    
    console.log('Starting MCP workflow...');
    const result = await runWorkflow({
      input_as_text: "Hello, this is a test query"
    });
    console.log('Result:', result);
  } catch (error) {
    console.error('Error:', error);
    // Don't exit on error - let Railway handle it
    console.log('Application will continue running...');
  }
}

// Create a simple HTTP server for health checks
function createHealthServer() {
  const server = http.createServer((req, res) => {
    if (req.url === '/health' || req.url === '/') {
      const envVarsOk = checkEnvironmentVariables();
      res.writeHead(envVarsOk ? 200 : 503, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: envVarsOk ? 'healthy' : 'unhealthy',
        message: envVarsOk ? 'Service is running' : 'Missing required environment variables',
        timestamp: new Date().toISOString()
      }));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not found' }));
    }
  });

  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    console.log(`Health check server running on port ${port}`);
  });

  return server;
}

// Run the main function if this file is executed directly
if (require.main === module) {
  // Start the health server
  createHealthServer();
  
  // Run the main application
  main();
}

module.exports = { runWorkflow };
