#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { GraphQLClient } from "graphql-request";
import { Handlers } from "./handlers.js";

const AHA_API_TOKEN = process.env.AHA_API_TOKEN;
const AHA_DOMAIN = process.env.AHA_DOMAIN;

if (!AHA_API_TOKEN) {
  throw new Error("AHA_API_TOKEN environment variable is required");
}

if (!AHA_DOMAIN) {
  throw new Error("AHA_DOMAIN environment variable is required");
}

const client = new GraphQLClient(
  `https://${AHA_DOMAIN}.aha.io/api/v2/graphql`,
  {
    headers: {
      Authorization: `Bearer ${AHA_API_TOKEN}`,
    },
  }
);

class AhaMcp {
  private server: Server;
  private handlers: Handlers;

  constructor() {
    this.server = new Server(
      {
        name: "aha-mcp",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.handlers = new Handlers(client);
    this.setupToolHandlers();

    this.server.onerror = (error) => console.error("[MCP Error]", error);
    process.on("SIGINT", async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: "get_record",
          description: "Get an Aha! feature or requirement by reference number",
          inputSchema: {
            type: "object",
            properties: {
              reference: {
                type: "string",
                description:
                  "Reference number (e.g., DEVELOP-123 or ADT-123-1)",
              },
            },
            required: ["reference"],
          },
        },
        {
          name: "get_page",
          description:
            "Get an Aha! page by reference number with optional relationships",
          inputSchema: {
            type: "object",
            properties: {
              reference: {
                type: "string",
                description: "Reference number (e.g., ABC-N-213)",
              },
              includeParent: {
                type: "boolean",
                description: "Include parent page in the response",
                default: false,
              },
            },
            required: ["reference"],
          },
        },
        {
          name: "search_documents",
          description: "Search for Aha! documents",
          inputSchema: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "Search query string",
              },
              searchableType: {
                type: "string",
                description: "Type of document to search for (e.g., Page)",
                default: "Page",
              },
            },
            required: ["query"],
          },
        },
        {
          name: "search_features",
          description:
            "Search for Aha! features by name, assignee, tag, or update date",
          inputSchema: {
            type: "object",
            properties: {
              q: {
                type: "string",
                description: "Search term to match against feature name",
              },
              product_id: {
                type: "string",
                description: "Filter by product/project ID",
              },
              assigned_to_user: {
                type: "string",
                description: "Filter by assignee (user ID or email)",
              },
              tag: {
                type: "string",
                description: "Filter by tag",
              },
              updated_since: {
                type: "string",
                description:
                  "Only features updated after this timestamp (ISO8601)",
              },
            },
          },
        },
        {
          name: "create_feature",
          description: "Create a new feature in Aha!",
          inputSchema: {
            type: "object",
            properties: {
              release_id: {
                type: "string",
                description: "Numeric ID or key of the release (required)",
              },
              name: {
                type: "string",
                description: "Name of the feature (required)",
              },
              workflow_kind: {
                type: "string",
                description: "Type of feature",
              },
              workflow_status: {
                type: "object",
                properties: {
                  name: {
                    type: "string",
                    description: "Name of the workflow status",
                  },
                  id: {
                    type: "string",
                    description: "ID of the workflow status",
                  },
                },
                description: "Status of the feature",
              },
              description: {
                type: "string",
                description: "Description of the feature (may include HTML formatting)",
              },
              created_by: {
                type: "string",
                description: "Email address of the user who created the feature",
              },
              assigned_to_user: {
                type: "object",
                properties: {
                  email: {
                    type: "string",
                    description: "Email address of the assigned user",
                  },
                  id: {
                    type: "string",
                    description: "ID of the assigned user",
                  },
                },
                description: "User assigned to the feature",
              },
              tags: {
                type: "string",
                description: "Tags to add to the feature (comma-separated)",
              },
              initial_estimate_text: {
                type: "string",
                description: "Initial estimated effort (e.g., '2d 1h' for time or '4p' for points)",
              },
              detailed_estimate_text: {
                type: "string",
                description: "Detailed estimated effort (e.g., '2d 1h' for time or '4p' for points)",
              },
              remaining_estimate_text: {
                type: "string",
                description: "Remaining estimated effort (e.g., '2d 1h' for time or '4p' for points)",
              },
              start_date: {
                type: "string",
                description: "Date that work will start (YYYY-MM-DD format)",
              },
              due_date: {
                type: "string",
                description: "Date that work is due to be completed (YYYY-MM-DD format)",
              },
              release_phase: {
                type: "string",
                description: "Name or ID of release phase",
              },
              initiative: {
                type: "string",
                description: "Name or ID of initiative",
              },
              epic: {
                type: "string",
                description: "Name or ID of epic",
              },
              team: {
                type: "string",
                description: "Numeric ID or key of the team",
              },
            },
            required: ["release_id", "name"],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (request.params.name === "get_record") {
        return this.handlers.handleGetRecord(request);
      } else if (request.params.name === "get_page") {
        return this.handlers.handleGetPage(request);
      } else if (request.params.name === "search_documents") {
        return this.handlers.handleSearchDocuments(request);
      } else if (request.params.name === "search_features") {
        return this.handlers.handleSearchFeatures(request);
      } else if (request.params.name === "create_feature") {
        return this.handlers.handleCreateFeature(request);
      }

      throw new McpError(
        ErrorCode.MethodNotFound,
        `Unknown tool: ${request.params.name}`
      );
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Aha! MCP server running on stdio");
  }
}

const server = new AhaMcp();
server.run().catch(console.error);
