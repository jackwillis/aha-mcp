export interface Description {
  htmlBody?: string;
  markdownBody?: string;
}

export interface User {
  name: string;
  email?: string;
}

export interface WorkflowStatus {
  name: string;
}

export interface Comment {
  body: string;
  createdAt: string;
  user: User;
}

export interface Requirement {
  name: string;
  description: Description;
  workflowStatus: WorkflowStatus;
}

export interface Record {
  name: string;
  description: Description;
}

export interface Feature {
  id: string;
  name: string;
  referenceNum: string;
  path: string;
  description: Description;
  workflowStatus: WorkflowStatus;
  assignedToUser?: User;
  createdByUser?: User;
  createdAt: string;
  updatedAt: string;
  startDate?: string;
  dueDate?: string;
  epic?: { name: string; referenceNum: string };
  initiative?: { name: string; referenceNum: string; description: Description };
  release: { name: string; referenceNum: string };
  project: { name: string; referencePrefix: string };
  goals: Array<{ name: string }>;
  tagList: string;
  comments: Comment[];
  commentsCount: number;
  requirements: Requirement[];
  requirementsCount: number;
}

export interface FeatureResponse {
  feature: Feature;
}

export interface RequirementResponse {
  requirement: Record;
}

// Search features (REST API)
export interface SearchFeaturesRequest {
  q?: string;
  product_id?: string;
  assigned_to_user?: string;
  tag?: string;
  updated_since?: string;
}

export interface SearchFeaturesResponse {
  features: Array<{
    id: string;
    reference_num: string;
    name: string;
    created_at: string;
    url: string;
    product_id: string;
  }>;
  pagination: {
    total_records: number;
    total_pages: number;
    current_page: number;
  };
}

export interface PageResponse {
  page: {
    name: string;
    description: Description;
    children: Array<{
      name: string;
      referenceNum: string;
    }>;
    parent?: {
      name: string;
      referenceNum: string;
    };
  };
}

// Regular expressions for validating reference numbers
export const FEATURE_REF_REGEX = /^([A-Z]+)-(\d+)$/;
export const REQUIREMENT_REF_REGEX = /^([A-Z]+)-(\d+)-(\d+)$/;
export const NOTE_REF_REGEX = /^([A-Z]+)-N-(\d+)$/;

export interface SearchNode {
  name: string | null;
  url: string;
  searchableId: string;
  searchableType: string;
}

export interface SearchResponse {
  searchDocuments: {
    nodes: SearchNode[];
    currentPage: number;
    totalCount: number;
    totalPages: number;
    isLastPage: boolean;
  };
}

export interface CreateFeatureRequest {
  release_id: string;  // Required: release ID or key
  name: string;        // Required: name of the feature
  workflow_kind?: string;
  workflow_status?: {
    name?: string;
    id?: string;
  };
  description?: string;
  created_by?: string;
  assigned_to_user?: {
    email?: string;
    id?: string;
  };
  tags?: string;  // Comma-separated tags
  initial_estimate_text?: string;
  detailed_estimate_text?: string;
  remaining_estimate_text?: string;
  initial_estimate?: number;
  detailed_estimate?: number;
  remaining_estimate?: number;
  start_date?: string;  // YYYY-MM-DD format
  due_date?: string;    // YYYY-MM-DD format
  release_phase?: string;
  initiative?: string;
  epic?: string;
  progress_source?: string;
  progress?: number;
  team?: string;
  team_workflow_status?: string;
  iteration?: string;
}

export interface CreateFeatureResponse {
  feature: {
    id: string;
    reference_num: string;
    name: string;
    description?: string;
    workflow_kind?: string;
    workflow_status?: {
      id: string;
      name: string;
    };
    assigned_to_user?: {
      id: string;
      name: string;
      email: string;
    };
    release?: {
      id: string;
      name: string;
      reference_num: string;
    };
    created_at?: string;
    updated_at?: string;
    tags?: string;
  };
}
