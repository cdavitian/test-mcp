const { runWorkflow } = require('./dist/testmcp.js');

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
    process.exit(1);
  }
}

// Example usage - you can modify this based on your needs
async function main() {
  try {
    // Check environment variables before proceeding
    checkEnvironmentVariables();
    
    console.log('Starting MCP workflow...');
    const result = await runWorkflow({
      input_as_text: "Hello, this is a test query"
    });
    console.log('Result:', result);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run the main function if this file is executed directly
if (require.main === module) {
  main();
}

module.exports = { runWorkflow };
