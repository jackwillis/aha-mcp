export const getPageQuery = `
  query GetPage($id: ID!, $includeParent: Boolean!) {
    page(id: $id) {
      name
      description {
        markdownBody
      }
      children {
        name
        referenceNum
      }
      parent @include(if: $includeParent) {
        name
        referenceNum
      }
    }
  }
`;

export const getFeatureQuery = `
  query GetFeature($id: ID!) {
    feature(id: $id) {
      id
      name
      referenceNum
      path
      description { markdownBody }
      workflowStatus { name }
      assignedToUser { name email }
      createdByUser { name }
      createdAt
      updatedAt
      startDate
      dueDate

      epic { name referenceNum }
      initiative { name referenceNum description { markdownBody } }
      release { name referenceNum }
      project { name referencePrefix }
      goals { name }
      tagList

      comments { body createdAt user { name } }
      commentsCount
      requirements { name description { markdownBody } workflowStatus { name } }
      requirementsCount
    }
  }
`;

export const getRequirementQuery = `
  query GetRequirement($id: ID!) {
    requirement(id: $id) {
      name
      description {
        markdownBody
      }
    }
  }
`;

export const searchDocumentsQuery = `
  query SearchDocuments($query: String!, $searchableType: [String!]!) {
    searchDocuments(filters: {query: $query, searchableType: $searchableType}) {
      nodes {
        name
        url
        searchableId
        searchableType
      }
      currentPage
      totalCount
      totalPages
      isLastPage
    }
  }
`;
