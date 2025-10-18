# MCP Agent API Documentation

## Overview

This API provides access to an AI Agent powered by OpenAI's GPT-5 model with MCP (Model Context Protocol) integration. The agent can query data sources through the KyoSQLProd MCP server.

## Base URL

```
https://test-mcp-production.up.railway.app
```

## Endpoints

### 1. Health Check

**GET** `/health` or `/`

Check if the service is running and properly configured.

**Response:**
```json
{
  "status": "healthy",
  "message": "Service is running",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "endpoints": {
    "health": "/health",
    "query": "/api/query",
    "info": "/api/info"
  }
}
```

### 2. API Information

**GET** `/api/info`

Get information about the API and available endpoints.

**Response:**
```json
{
  "name": "MCP Agent API",
  "version": "1.0.0",
  "description": "AI Agent with MCP (Model Context Protocol) integration",
  "endpoints": {
    "health": "/health",
    "query": "/api/query",
    "info": "/api/info"
  },
  "usage": {
    "query": "POST /api/query with JSON body: {\"query\": \"your question here\"}"
  }
}
```

### 3. Query Agent

#### GET Request

**GET** `/api/query?q=your_question_here`

Query the agent using a simple GET request.

**Example:**
```bash
curl "https://test-mcp-production.up.railway.app/api/query?q=What%20data%20is%20available?"
```

#### POST Request

**POST** `/api/query`

Query the agent using a POST request with JSON body.

**Request Body:**
```json
{
  "query": "What data is available in the system?"
}
```

**Alternative formats:**
```json
{
  "input_as_text": "What data is available in the system?"
}
```

```json
{
  "text": "What data is available in the system?"
}
```

**Response:**
```json
{
  "success": true,
  "query": "What data is available in the system?",
  "response": "Based on the available MCP tools, I can help you explore data through the following capabilities:\n\n1. **list-table-tool** - List available tables in the database\n2. **read-data-tool** - Read data from specific tables\n3. **search** - Search through data\n4. **fetch** - Fetch specific data\n\nWould you like me to start by listing the available tables to see what data sources we can explore?",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "Missing query parameter",
  "expected": "{\"query\": \"your question here\"} or {\"input_as_text\": \"your question here\"}"
}
```

### 404 Not Found
```json
{
  "error": "Not found",
  "availableEndpoints": ["/health", "/api/query", "/api/info"]
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "Detailed error message",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Usage Examples

### Using curl

**GET Request:**
```bash
curl "https://test-mcp-production.up.railway.app/api/query?q=List%20all%20available%20tables"
```

**POST Request:**
```bash
curl -X POST "https://test-mcp-production.up.railway.app/api/query" \
  -H "Content-Type: application/json" \
  -d '{"query": "List all available tables"}'
```

### Using JavaScript (fetch)

```javascript
// GET request
const response = await fetch('https://test-mcp-production.up.railway.app/api/query?q=List%20all%20available%20tables');
const data = await response.json();
console.log(data.response);

// POST request
const response = await fetch('https://test-mcp-production.up.railway.app/api/query', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    query: 'List all available tables'
  })
});
const data = await response.json();
console.log(data.response);
```

### Using Python (requests)

```python
import requests

# GET request
response = requests.get('https://test-mcp-production.up.railway.app/api/query', 
                       params={'q': 'List all available tables'})
data = response.json()
print(data['response'])

# POST request
response = requests.post('https://test-mcp-production.up.railway.app/api/query', 
                        json={'query': 'List all available tables'})
data = response.json()
print(data['response'])
```

## Available MCP Tools

The agent has access to the following MCP tools:

- **list-table-tool**: List available tables in the database
- **read-data-tool**: Read data from specific tables
- **search**: Search through data
- **fetch**: Fetch specific data

## CORS Support

The API includes CORS headers to allow cross-origin requests from web applications.

## Rate Limiting

Currently, there are no rate limits implemented. Consider implementing rate limiting for production use.

## Authentication

Currently, no authentication is required. Consider adding API keys or other authentication mechanisms for production use.

## Monitoring

The service includes health check endpoints for monitoring. You can use the `/health` endpoint to verify the service status.
