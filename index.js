const { runWorkflow } = require('./dist/testmcp.js');

// Example usage - you can modify this based on your needs
async function main() {
  try {
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
