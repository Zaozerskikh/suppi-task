import axios, {AxiosResponse} from 'axios';
import {SearchResponseConvertedDTO, SearchResponseDTO} from "./ApiModels";

export const getData = async (searchString: string, accessToken: string, nextPageToken?: string): Promise<SearchResponseConvertedDTO> => {
  return await axios
    .post<SearchResponseDTO>(
      'https://api.github.com/graphql',
      {
        query: `
          query {
            search(query: "${searchString}", type: REPOSITORY, first: 10${nextPageToken ? `, after: "${nextPageToken}"` : ''}) {
              repositoryCount
              pageInfo {
                endCursor
                hasNextPage
              }
              edges {
                node {
                  ... on Repository {
                    nameWithOwner
                    description
                    updatedAt
                    stargazerCount
                  }
                }
              }
            }
          }
        `,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
    .then((response: AxiosResponse<SearchResponseDTO>) => (
      {
        repositoryCount: response.data.data.search.repositoryCount,
        repositoryInfo: response.data.data.search.edges.map(e => e.node),
        pageInfo: response.data.data.search.pageInfo,
      } as SearchResponseConvertedDTO
    ))
}