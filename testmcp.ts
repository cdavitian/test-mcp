import { hostedMcpTool, Agent, AgentInputItem, Runner, withTrace } from "@openai/agents";


// Tool definitions - with error handling for authentication
let mcp: any;
try {
  if (!process.env.MCP_AUTHORIZATION_TOKEN) {
    throw new Error('MCP_AUTHORIZATION_TOKEN environment variable is not set');
  }
  
  mcp = hostedMcpTool({
    serverLabel: "KyoSQLProd",
    allowedTools: [
      "list-table-tool",
      "read-data-tool",
      "search",
      "fetch"
    ],
    authorization: process.env.MCP_AUTHORIZATION_TOKEN,
    requireApproval: "never",
    serverUrl: "https://kyo-mcp.kyocare.com"
  });
  console.log('MCP tool configured successfully');
} catch (error) {
  console.error('Failed to configure MCP tool:', error);
  mcp = null;
}
// Create agent with MCP tools, but handle authentication failures gracefully
let myAgent: Agent;

try {
  const tools = mcp ? [mcp] : [];
  const instructions = mcp 
    ? "Allow the user to query the MCP data sources. Help them explore and analyze data from the available tools."
    : "You are a helpful AI assistant. The MCP data sources are currently unavailable due to authentication issues. Please inform the user about this limitation and suggest they check the MCP_AUTHORIZATION_TOKEN environment variable.";
  
  myAgent = new Agent({
    name: "My agent",
    instructions: instructions,
    model: "gpt-5",
    tools: tools,
    modelSettings: {
      reasoning: {
        effort: "low",
        summary: "auto"
      },
      store: true
    }
  });
  
  if (mcp) {
    console.log('Agent created with MCP tools');
  } else {
    console.log('Agent created without MCP tools (authentication failed)');
  }
} catch (error) {
  console.error('Failed to create agent:', error);
  // Fallback agent without MCP tools
  myAgent = new Agent({
    name: "My agent",
    instructions: "You are a helpful AI assistant. The MCP data sources are currently unavailable due to authentication issues. Please inform the user about this limitation and suggest they check the MCP_AUTHORIZATION_TOKEN environment variable.",
    model: "gpt-5",
    tools: [],
    modelSettings: {
      reasoning: {
        effort: "low",
        summary: "auto"
      },
      store: true
    }
  });
}

type WorkflowInput = { input_as_text: string };


// Main code entrypoint
export const runWorkflow = async (workflow: WorkflowInput) => {
  return await withTrace("MCP Prod Test", async () => {
    // Debug: Log environment variables (without values for security)
    console.log('MCP Configuration Debug:');
    console.log('MCP_AUTHORIZATION_TOKEN:', process.env.MCP_AUTHORIZATION_TOKEN ? '[SET]' : '[NOT SET]');
    console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '[SET]' : '[NOT SET]');
    
    const conversationHistory: AgentInputItem[] = [
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: workflow.input_as_text
          }
        ]
      }
    ];
    const runner = new Runner({
      traceMetadata: {
        __trace_source__: "agent-builder",
        workflow_id: "wf_68efcaa7b9908190bfadd0ac72ef430001c44704e294f2a0"
      }
    });
    
    try {
      const myAgentResultTemp = await runner.run(
        myAgent,
        [
          ...conversationHistory
        ]
      );
      conversationHistory.push(...myAgentResultTemp.newItems.map((item) => item.rawItem));

      if (!myAgentResultTemp.finalOutput) {
          throw new Error("Agent result is undefined");
      }

      const myAgentResult = {
        output_text: myAgentResultTemp.finalOutput ?? ""
      };
      
      return myAgentResult;
    } catch (error) {
      console.error('MCP Agent Error:', error);
      
      // If it's an MCP authentication error, provide a helpful message
      if (error instanceof Error && error.message && error.message.includes('401')) {
        throw new Error(`MCP Server Authentication Failed: ${error.message}. Please check your MCP_AUTHORIZATION_TOKEN environment variable.`);
      }
      
      throw error;
    }
  });
}
