# aha-mcp

Model Context Protocol (MCP) server for accessing Aha! records through the MCP. This integration enables seamless interaction with Aha! features, requirements, and pages directly through the Model Context Protocol.

## Prerequisites

- Node.js v20 or higher
- npm (usually comes with Node.js)
- An Aha! account with API access

## Installation

### Using npx

```bash
npx -y aha-mcp@latest
```

### Manual Installation

```bash
# Clone the repository
git clone https://github.com/aha-develop/aha-mcp.git
cd aha-mcp

# Install dependencies
npm install

# Run the server
npm run mcp-start
```

## Authentication Setup

1. Log in to your Aha! account at `<yourcompany>.aha.io`
2. Visit [secure.aha.io/settings/api_keys](https://secure.aha.io/settings/api_keys)
3. Click "Create new API key"
4. Copy the token immediately (it won't be shown again)

For more details about authentication and API usage, see the [Aha! API documentation](https://www.aha.io/api).

## Environment Variables

This MCP server requires the following environment variables:

- `AHA_API_TOKEN`: Your Aha! API token
- `AHA_DOMAIN`: Your Aha! domain (e.g., yourcompany.aha.io)

## IDE Integration

For security reasons, we recommend using your preferred secure method for managing environment variables rather than storing API tokens directly in editor configurations. Each editor has different security models and capabilities for handling sensitive information.

Below are examples of how to configure various editors to use the aha-mcp server. You should adapt these examples to use your preferred secure method for providing the required environment variables.

### VSCode

Add this to your `.vscode/settings.json`, using your preferred method to securely provide the environment variables:

```json
{
  "mcpServers": {
    "aha-mcp": {
      "command": "npx",
      "args": ["-y", "aha-mcp"]
      // Environment variables should be provided through your preferred secure method
    }
  }
}
```

### Cursor

1. Go to Cursor Settings > MCP
2. Click + Add new Global MCP Server
3. Add a configuration similar to:

```json
{
  "mcpServers": {
    "aha-mcp": {
      "command": "npx",
      "args": ["-y", "aha-mcp"]
      // Environment variables should be provided through your preferred secure method
    }
  }
}
```

### Cline

Add a configuration to your `cline_mcp_settings.json` via Cline MCP Server settings:

```json
{
  "mcpServers": {
    "aha-mcp": {
      "command": "npx",
      "args": ["-y", "aha-mcp"]
      // Environment variables should be provided through your preferred secure method
    }
  }
}
```

### RooCode

Open the MCP settings by either:
- Clicking "Edit MCP Settings" in RooCode settings, or
- Using the "RooCode: Open MCP Config" command in VS Code's command palette

Then add:

```json
{
  "mcpServers": {
    "aha-mcp": {
      "command": "npx",
      "args": ["-y", "aha-mcp"]
      // Environment variables should be provided through your preferred secure method
    }
  }
}
```

### Claude Desktop

Add a configuration to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "aha-mcp": {
      "command": "npx",
      "args": ["-y", "aha-mcp"]
      // Environment variables should be provided through your preferred secure method
    }
  }
}
```

## Available MCP Tools

### 1. get_record

Retrieves an Aha! feature or requirement by reference number.

**Parameters:**
- `reference` (required): Reference number of the feature or requirement (e.g., "DEVELOP-123")

**Example:**
```json
{
  "reference": "DEVELOP-123"
}
```

**Response:**
```json
{
  "id": "123456",
  "name": "Feature name",
  "referenceNum": "DEVELOP-123",
  "path": "/features/DEVELOP-123",
  "description": {
    "markdownBody": "Feature description in markdown"
  },
  "workflowStatus": {
    "name": "In development"
  },
  "assignedToUser": {
    "name": "John Developer",
    "email": "developer@company.com"
  },
  "release": {
    "name": "Q1 Release",
    "referenceNum": "PRJ-R-1"
  },
  "project": {
    "name": "Project Name",
    "referencePrefix": "PRJ"
  },
  "comments": [],
  "commentsCount": 0,
  "requirements": [],
  "requirementsCount": 0
}
```

### 2. get_page

Gets an Aha! page by reference number.

**Parameters:**
- `reference` (required): Reference number of the page (e.g., "ABC-N-213")
- `includeParent` (optional): Include parent page information. Defaults to false.

**Example:**
```json
{
  "reference": "ABC-N-213",
  "includeParent": true
}
```

**Response:**
```json
{
  "name": "Page title",
  "description": {
    "markdownBody": "Page content in markdown"
  },
  "children": [
    {
      "name": "Child page",
      "referenceNum": "ABC-N-214"
    }
  ],
  "parent": {
    "name": "Parent page",
    "referenceNum": "ABC-N-200"
  }
}
```

### 3. search_documents

Searches for Aha! documents.

**Parameters:**
- `query` (required): Search query string
- `searchableType` (optional): Type of document to search for (e.g., "Page"). Defaults to "Page"

**Example:**
```json
{
  "query": "product roadmap",
  "searchableType": "Page"
}
```

**Response:**
```json
{
  "nodes": [
    {
      "name": "Product Roadmap 2025",
      "url": "/pages/ABC-N-123",
      "searchableId": "123456789",
      "searchableType": "Page"
    }
  ],
  "currentPage": 1,
  "totalCount": 1,
  "totalPages": 1,
  "isLastPage": true
}
```

### 4. search_features

Searches for Aha! features by name, assignee, tag, or update date.

**Parameters:**
- `q` (optional): Search term to match against feature name
- `product_id` (optional): Filter by product/project ID
- `assigned_to_user` (optional): Filter by assignee (user ID or email)
- `tag` (optional): Filter by tag
- `updated_since` (optional): Only features updated after this timestamp (ISO8601)

**Example:**
```json
{
  "q": "authentication",
  "assigned_to_user": "developer@company.com"
}
```

**Response:**
```json
{
  "features": [
    {
      "id": "12345",
      "reference_num": "DEVELOP-123",
      "name": "User Authentication",
      "created_at": "2024-01-15T10:30:00.000Z",
      "url": "https://company.aha.io/features/DEVELOP-123",
      "resource": "https://company.aha.io/api/v1/features/DEVELOP-123",
      "product_id": "67890"
    }
  ],
  "pagination": {
    "total_records": 1,
    "total_pages": 1,
    "current_page": 1
  }
}
```

### 5. create_feature

Creates a new feature in Aha!

**Parameters:**
- `release_id` (required): Numeric ID or key of the release to create the feature in
- `name` (required): Name of the feature
- `workflow_kind` (optional): Type of feature
- `workflow_status` (optional): Object with name or id of the workflow status
- `description` (optional): Description of the feature (may include HTML formatting)
- `assigned_to_user` (optional): Object with email or id of the assigned user
- `tags` (optional): Comma-separated tags to apply to the feature
- `initial_estimate_text` (optional): Initial estimated effort (e.g., "2d 1h" for time or "4p" for points)
- `start_date` (optional): Date work will start (YYYY-MM-DD format)
- `due_date` (optional): Date work is due (YYYY-MM-DD format)
- `initiative` (optional): Name or ID of initiative
- `epic` (optional): Name or ID of epic
- `team` (optional): Numeric ID or key of the team

**Example:**
```json
{
  "release_id": "PRJ1-R-1",
  "name": "New Mobile App Feature",
  "workflow_kind": "new",
  "workflow_status": {
    "name": "Under consideration"
  },
  "description": "<p>Implement push notifications for mobile app</p>",
  "assigned_to_user": {
    "email": "developer@company.com"
  },
  "tags": "mobile,notifications,push"
}
```

**Response:**
```json
{
  "id": "12345",
  "reference_num": "DEVELOP-789",
  "name": "New Mobile App Feature",
  "description": "<p>Implement push notifications for mobile app</p>",
  "workflow_status": {
    "id": "67890",
    "name": "Under consideration"
  },
  "assigned_to_user": {
    "id": "54321",
    "name": "John Developer",
    "email": "developer@company.com"
  },
  "release": {
    "id": "11111",
    "name": "Q2 2024 Release",
    "reference_num": "PRJ1-R-1"
  },
  "tags": "mobile,notifications,push"
}
```

## Example Queries

- "Get feature DEVELOP-123"
- "Fetch the product roadmap page ABC-N-213"
- "Search for pages about launch planning"
- "Get requirement ADT-123-1"
- "Find all pages mentioning Q2 goals"
- "Search for features assigned to me"
- "Find features with the tag 'backend'"
- "Create a new feature called 'User Authentication' in release PRJ1-R-1"
- "Create a feature for mobile push notifications in release MOBILE-R-2"

## Configuration Options

| Variable | Description | Default |
|----------|-------------|---------|
| `AHA_API_TOKEN` | Your Aha! API token | Required |
| `AHA_DOMAIN` | Your Aha! domain (e.g., yourcompany.aha.io) | Required |
| `LOG_LEVEL` | Logging level (debug, info, warn, error) | info |
| `PORT` | Port for SSE transport | 3000 |
| `TRANSPORT` | Transport type (stdio or sse) | stdio |

## Troubleshooting

<details>
<summary>Common Issues</summary>

1. Authentication errors:
   - Verify your API token is correct and properly set in your environment
   - Ensure the token has the necessary permissions in Aha!
   - Confirm you're using the correct Aha! domain

2. Server won't start:
   - Ensure all dependencies are installed
   - Check the Node.js version is v20 or higher
   - Verify the TypeScript compilation succeeds
   - Confirm environment variables are properly set and accessible

3. Connection issues:
   - Check your network connection
   - Verify your Aha! domain is accessible
   - Ensure your API token has not expired

4. API Request failures:
   - Check the reference numbers are correct
   - Verify the searchable type is valid
   - Ensure you have permissions to access the requested resources

5. Feature creation errors (create_feature tool):
   - **404 "Record not found"**: The `release_id` doesn't exist or you don't have access to it
     - Verify the release ID format (e.g., "PRJ1-R-1", "PROJ-R-123")
     - Check that the release exists in your Aha! workspace
     - Ensure your API token has permissions to create features in that release
   - **403 "Forbidden"**: Your API token lacks permissions to create features
   - **422 "Unprocessable Entity"**: Invalid field values (check workflow_status names, user emails, etc.)
   - To find valid release IDs: Use the Aha! UI or call `GET /api/v1/releases` endpoint

6. Environment variable issues:
   - Make sure environment variables are properly set and accessible to the MCP server
   - Check that your secure storage method is correctly configured
   - Verify that the environment variables are being passed to the MCP server process
</details>
