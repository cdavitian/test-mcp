import { hostedMcpTool, Agent, AgentInputItem, Runner, withTrace } from "@openai/agents";


// Tool definitions
const mcp = hostedMcpTool({
  serverLabel: "KyoSQLProd",
  allowedTools: [
    "list-table-tool",
    "read-data-tool",
    "search",
    "fetch"
  ],
  authorization: process.env.MCP_AUTHORIZATION_TOKEN || "REDACTED",
  requireApproval: "never",
  serverUrl: "https://kyo-mcp.kyocare.com"
})
const myAgent = new Agent({
  name: "My agent",
  instructions: "Allow the user to query the MCP data sources. Help them explore and analyze data from the available tools.",
  model: "gpt-5",
  tools: [
    mcp
  ],
  modelSettings: {
    reasoning: {
      effort: "low",
      summary: "auto"
    },
    store: true
  }
});

type WorkflowInput = { input_as_text: string };


// Main code entrypoint
export const runWorkflow = async (workflow: WorkflowInput) => {
  return await withTrace("MCP Prod Test", async () => {
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
  });
}
