export interface RepositoryInfo {
  nameWithOwner: string;
  description: string;
  updatedAt: string;
  stargazerCount: number;
}

export interface PageInfo {
  endCursor: string;
  hasNextPage: boolean;
}

export interface SearchResponseDTO {
  data: {
    search: {
      repositoryCount: number;
      pageInfo: PageInfo
      edges: {
        node: RepositoryInfo;
      }[];
    }
  }
}

export interface SearchResponseConvertedDTO {
  repositoryCount: number;
  repositoryInfo: RepositoryInfo[]
  pageInfo: PageInfo;
}