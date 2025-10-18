const { runWorkflow } = require('./dist/testmcp.js');
const http = require('http');
const url = require('url');

// Check for required environment variables
function checkEnvironmentVariables() {
  // Debug: Log all available environment variables (without values for security)
  console.log('Available environment variables:');
  Object.keys(process.env).forEach(key => {
    if (key.includes('OPENAI') || key.includes('MCP') || key.includes('AUTHORIZATION')) {
      console.log(`  ${key}: ${process.env[key] ? '[SET]' : '[NOT SET]'}`);
    }
  });
  
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
    console.error('Current NODE_ENV:', process.env.NODE_ENV);
    console.error('Current PORT:', process.env.PORT);
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
        // Re-check environment variables periodically
        if (checkEnvironmentVariables()) {
          console.log('Environment variables are now available!');
          // Restart the main function
          main();
        }
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

// Create HTTP server with API endpoints
function createServer() {
  const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    const method = req.method;

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight requests
    if (method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    try {
      // Health check endpoint
      if (path === '/health' || path === '/') {
        const envVarsOk = checkEnvironmentVariables();
        res.writeHead(envVarsOk ? 200 : 503, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: envVarsOk ? 'healthy' : 'unhealthy',
          message: envVarsOk ? 'Service is running' : 'Missing required environment variables',
          timestamp: new Date().toISOString(),
          endpoints: {
            health: '/health',
            query: '/api/query',
            info: '/api/info'
          }
        }));
        return;
      }

      // API info endpoint
      if (path === '/api/info') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          name: 'MCP Agent API',
          version: '1.0.0',
          description: 'AI Agent with MCP (Model Context Protocol) integration',
          endpoints: {
            health: '/health',
            query: '/api/query',
            info: '/api/info'
          },
          usage: {
            query: 'POST /api/query with JSON body: {"query": "your question here"}'
          }
        }));
        return;
      }

      // Main query endpoint
      if (path === '/api/query' && method === 'POST') {
        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });

        req.on('end', async () => {
          try {
            const requestData = JSON.parse(body);
            const query = requestData.query || requestData.input_as_text || requestData.text;

            if (!query) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({
                error: 'Missing query parameter',
                expected: '{"query": "your question here"} or {"input_as_text": "your question here"}'
              }));
              return;
            }

            console.log(`Processing query: ${query}`);
            const result = await runWorkflow({ input_as_text: query });
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              success: true,
              query: query,
              response: result.output_text,
              timestamp: new Date().toISOString()
            }));

          } catch (error) {
            console.error('Error processing query:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              error: 'Internal server error',
              message: error.message,
              timestamp: new Date().toISOString()
            }));
          }
        });
        return;
      }

      // Handle GET requests to /api/query with query parameter
      if (path === '/api/query' && method === 'GET') {
        const query = parsedUrl.query.q || parsedUrl.query.query;
        
        if (!query) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            error: 'Missing query parameter',
            usage: 'GET /api/query?q=your_question_here'
          }));
          return;
        }

        try {
          console.log(`Processing GET query: ${query}`);
          const result = await runWorkflow({ input_as_text: query });
          
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: true,
            query: query,
            response: result.output_text,
            timestamp: new Date().toISOString()
          }));

        } catch (error) {
          console.error('Error processing query:', error);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            error: 'Internal server error',
            message: error.message,
            timestamp: new Date().toISOString()
          }));
        }
        return;
      }

      // 404 for other routes
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        error: 'Not found',
        availableEndpoints: ['/health', '/api/query', '/api/info']
      }));

    } catch (error) {
      console.error('Server error:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: 'Internal server error',
        message: error.message
      }));
    }
  });

  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    console.log(`MCP Agent API server running on port ${port}`);
    console.log(`Available endpoints:`);
    console.log(`  - GET  /health - Health check`);
    console.log(`  - GET  /api/info - API information`);
    console.log(`  - GET  /api/query?q=your_question - Query via GET`);
    console.log(`  - POST /api/query - Query via POST with JSON body`);
  });

  return server;
}

// Run the main function if this file is executed directly
if (require.main === module) {
  // Start the API server
  createServer();
  
  // Run the main application (for testing)
  main();
}

module.exports = { runWorkflow };
