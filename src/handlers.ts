import { ErrorCode, McpError } from "@modelcontextprotocol/sdk/types.js";
import { GraphQLClient } from "graphql-request";
import {
  FEATURE_REF_REGEX,
  REQUIREMENT_REF_REGEX,
  NOTE_REF_REGEX,
  Record,
  FeatureResponse,
  RequirementResponse,
  PageResponse,
  SearchResponse,
  CreateFeatureRequest,
  CreateFeatureResponse,
  SearchFeaturesRequest,
  SearchFeaturesResponse,
} from "./types.js";
import {
  getFeatureQuery,
  getRequirementQuery,
  getPageQuery,
  searchDocumentsQuery,
} from "./queries.js";

export class Handlers {
  constructor(private client: GraphQLClient) {}

  async handleGetRecord(request: any) {
    const { reference } = request.params.arguments as { reference: string };

    if (!reference) {
      throw new McpError(
        ErrorCode.InvalidParams,
        "Reference number is required"
      );
    }

    try {
      let result: Record | undefined;

      if (FEATURE_REF_REGEX.test(reference)) {
        const data = await this.client.request<FeatureResponse>(
          getFeatureQuery,
          {
            id: reference,
          }
        );
        result = data.feature;
      } else if (REQUIREMENT_REF_REGEX.test(reference)) {
        const data = await this.client.request<RequirementResponse>(
          getRequirementQuery,
          { id: reference }
        );
        result = data.requirement;
      } else {
        throw new McpError(
          ErrorCode.InvalidParams,
          "Invalid reference number format. Expected DEVELOP-123 or ADT-123-1"
        );
      }

      if (!result) {
        return {
          content: [
            {
              type: "text",
              text: `No record found for reference ${reference}`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      if (error instanceof McpError) {
        throw error;
      }

      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error("API Error:", errorMessage);
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to fetch record: ${errorMessage}`
      );
    }
  }

  async handleGetPage(request: any) {
    const { reference, includeParent = false } = request.params.arguments as {
      reference: string;
      includeParent?: boolean;
    };

    if (!reference) {
      throw new McpError(
        ErrorCode.InvalidParams,
        "Reference number is required"
      );
    }

    if (!NOTE_REF_REGEX.test(reference)) {
      throw new McpError(
        ErrorCode.InvalidParams,
        "Invalid reference number format. Expected ABC-N-213"
      );
    }

    try {
      const data = await this.client.request<PageResponse>(getPageQuery, {
        id: reference,
        includeParent,
      });

      if (!data.page) {
        return {
          content: [
            {
              type: "text",
              text: `No page found for reference ${reference}`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data.page, null, 2),
          },
        ],
      };
    } catch (error) {
      if (error instanceof McpError) {
        throw error;
      }

      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error("API Error:", errorMessage);
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to fetch page: ${errorMessage}`
      );
    }
  }

  async handleSearchDocuments(request: any) {
    const { query, searchableType = "Page" } = request.params.arguments as {
      query: string;
      searchableType?: string;
    };

    if (!query) {
      throw new McpError(ErrorCode.InvalidParams, "Search query is required");
    }

    try {
      const data = await this.client.request<SearchResponse>(
        searchDocumentsQuery,
        {
          query,
          searchableType: [searchableType],
        }
      );

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data.searchDocuments, null, 2),
          },
        ],
      };
    } catch (error) {
      if (error instanceof McpError) {
        throw error;
      }

      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error("API Error:", errorMessage);
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to search documents: ${errorMessage}`
      );
    }
  }

  async handleCreateFeature(request: any) {
    const {
      release_id,
      name,
      workflow_kind,
      workflow_status,
      description,
      created_by,
      assigned_to_user,
      tags,
      initial_estimate_text,
      detailed_estimate_text,
      remaining_estimate_text,
      initial_estimate,
      detailed_estimate,
      remaining_estimate,
      start_date,
      due_date,
      release_phase,
      initiative,
      epic,
      progress_source,
      progress,
      team,
      team_workflow_status,
      iteration,
    } = request.params.arguments as CreateFeatureRequest;

    if (!release_id) {
      throw new McpError(
        ErrorCode.InvalidParams,
        "Release ID is required"
      );
    }

    if (!name) {
      throw new McpError(
        ErrorCode.InvalidParams,
        "Feature name is required"
      );
    }

    try {
      // Build the feature object dynamically to only include provided fields
      const feature: any = { name };
      
      if (workflow_kind) feature.workflow_kind = workflow_kind;
      if (workflow_status) feature.workflow_status = workflow_status;
      if (description) feature.description = description;
      if (created_by) feature.created_by = created_by;
      if (assigned_to_user) feature.assigned_to_user = assigned_to_user;
      if (tags) feature.tags = tags;
      if (initial_estimate_text) feature.initial_estimate_text = initial_estimate_text;
      if (detailed_estimate_text) feature.detailed_estimate_text = detailed_estimate_text;
      if (remaining_estimate_text) feature.remaining_estimate_text = remaining_estimate_text;
      if (initial_estimate !== undefined) feature.initial_estimate = initial_estimate;
      if (detailed_estimate !== undefined) feature.detailed_estimate = detailed_estimate;
      if (remaining_estimate !== undefined) feature.remaining_estimate = remaining_estimate;
      if (start_date) feature.start_date = start_date;
      if (due_date) feature.due_date = due_date;
      if (release_phase) feature.release_phase = release_phase;
      if (initiative) feature.initiative = initiative;
      if (epic) feature.epic = epic;
      if (progress_source) feature.progress_source = progress_source;
      if (progress !== undefined) feature.progress = progress;
      if (team) feature.team = team;
      if (team_workflow_status) feature.team_workflow_status = team_workflow_status;
      if (iteration) feature.iteration = iteration;

      // Get the domain and token from the GraphQL client configuration
      const ahaApiToken = process.env.AHA_API_TOKEN;
      const ahaDomain = process.env.AHA_DOMAIN;

      if (!ahaApiToken || !ahaDomain) {
        throw new McpError(
          ErrorCode.InternalError,
          "Missing AHA_API_TOKEN or AHA_DOMAIN environment variables"
        );
      }

      // Make REST API call instead of GraphQL
      const response = await fetch(
        `https://${ahaDomain}.aha.io/api/v1/releases/${release_id}/features`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${ahaApiToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({ feature }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new McpError(
          ErrorCode.InternalError,
          `Aha! API error (${response.status}): ${errorText}`
        );
      }

      const data: CreateFeatureResponse = await response.json();

      if (!data.feature) {
        throw new McpError(
          ErrorCode.InternalError,
          "Failed to create feature - no feature returned"
        );
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data.feature, null, 2),
          },
        ],
      };
    } catch (error) {
      if (error instanceof McpError) {
        throw error;
      }

      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error("API Error:", errorMessage);
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to create feature: ${errorMessage}`
      );
    }
  }

  async handleSearchFeatures(request: any) {
    const { q, product_id, assigned_to_user, tag, updated_since } =
      request.params.arguments as SearchFeaturesRequest;

    try {
      const ahaApiToken = process.env.AHA_API_TOKEN;
      const ahaDomain = process.env.AHA_DOMAIN;

      if (!ahaApiToken || !ahaDomain) {
        throw new McpError(
          ErrorCode.InternalError,
          "Missing AHA_API_TOKEN or AHA_DOMAIN environment variables"
        );
      }

      // Build query string
      const params = new URLSearchParams();
      if (q) params.append("q", q);
      if (product_id) params.append("product_id", product_id);
      if (assigned_to_user) params.append("assigned_to_user", assigned_to_user);
      if (tag) params.append("tag", tag);
      if (updated_since) params.append("updated_since", updated_since);

      const response = await fetch(
        `https://${ahaDomain}.aha.io/api/v1/features?${params.toString()}`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${ahaApiToken}`,
            "Accept": 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new McpError(
          ErrorCode.InternalError,
          `Aha! API error (${response.status}): ${errorText}`
        );
      }

      const data: SearchFeaturesResponse = await response.json();

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    } catch (error) {
      if (error instanceof McpError) {
        throw error;
      }

      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error("API Error:", errorMessage);
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to search features: ${errorMessage}`
      );
    }
  }
}
