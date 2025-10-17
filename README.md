# Test MCP Application

This is a test application using OpenAI Agents with MCP (Model Context Protocol) tools.

## Environment Variables

The following environment variables are required:

- `OPENAI_API_KEY`: Your OpenAI API key (required)
- `MCP_AUTHORIZATION_TOKEN`: Authorization token for the MCP server (required)

## Setup

1. Set the `OPENAI_API_KEY` environment variable
2. Run `npm install` to install dependencies
3. Run `npm run build` to compile TypeScript
4. Run `npm start` to start the application

## Railway Deployment

### Required Environment Variables

You must set the following environment variables in your Railway project:

1. **OPENAI_API_KEY**: Your OpenAI API key
2. **MCP_AUTHORIZATION_TOKEN**: Authorization token for the MCP server

### Setting Environment Variables in Railway

1. Go to your Railway project dashboard
2. Click on your service
3. Go to the "Variables" tab
4. Add the following variables:
   - `OPENAI_API_KEY` = `your-openai-api-key-here`
   - `MCP_AUTHORIZATION_TOKEN` = `your-mcp-auth-token-here`

### Health Check

The application includes a health check endpoint at `/health` that will return:
- Status 200: If all environment variables are properly configured
- Status 503: If environment variables are missing

### Troubleshooting

If your application is crashing in Railway:
1. Check that both environment variables are set
2. Verify the values are correct (no extra spaces, proper format)
3. Check the Railway logs for specific error messages
4. The application will now wait gracefully for environment variables instead of crashing
