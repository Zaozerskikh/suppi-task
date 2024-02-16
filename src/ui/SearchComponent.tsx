import React, {useState} from 'react';
import {getData} from "../api/ApiActions";
import './SearchComponent.css'
import {ACCESS_TOKEN} from "../env/EnviromentVariablesResolver";
import InfiniteScroll from 'react-infinite-scroller';
import {SearchResponseConvertedDTO} from "../api/ApiModels";
import RepoCard from "./repo_ card/RepoCard";
import {useFormik} from "formik";

const SearchComponent: React.FC = () => {
  const formik = useFormik({
    initialValues: {
      searchString: '',
    },
    onSubmit: values => {
      if (!isInitialLoading) {
        handleSearch(values.searchString);
      }
    },
  });
  const [isInitialLoading, setInitialLoading] = useState(false)

  const [searchError, setSearchError] = useState<string | undefined>(undefined);
  const [loadMoreError, setLoadMoreError] = useState<string | undefined>(undefined);
  const [searchResults, setSearchResults] = useState<SearchResponseConvertedDTO>({
    repositoryCount: 0,
    repositoryInfo: [],
    pageInfo: {
      endCursor: '-1',
      hasNextPage: false
    }
  });

  const handleSearch = async (searchString: string) => {
    setInitialLoading(true)
    setSearchError(undefined)
    setLoadMoreError(undefined)
    setSearchResults({
      repositoryCount: 0,
      repositoryInfo: [],
      pageInfo: {
        endCursor: '-1',
        hasNextPage: false
      }
    })

    try {
      const result = await getData(
        // replacements are the injections protection
        searchString.replaceAll(/[^\p{L}\p{N}\s]/gu, ''), ACCESS_TOKEN);
      setSearchResults(result);
    } catch (err) {
      setSearchError(`Search error: ${(err as Error)?.message}`);
    } finally {
      setInitialLoading(false)
    }
  };

  const handleLoadMore = async () => {
    if (!searchResults.pageInfo.hasNextPage) {
      return;
    }

    try {
      setSearchError(undefined)
      const result = await getData(
        formik?.values?.searchString?.replaceAll(/[^\p{L}\p{N}\s]/gu, ''),
        ACCESS_TOKEN,
        searchResults.pageInfo.endCursor
      );
      setSearchResults(prevState => ({
        ...prevState,
        repositoryInfo: [...prevState.repositoryInfo, ...result.repositoryInfo],
        pageInfo: result.pageInfo
      }));
      setLoadMoreError(undefined)
    } catch (err) {
      setLoadMoreError(`Load more error: ${(err as Error)?.message}`);
    }
  };

  return (
    <div className={'search-component-wrapper'}>
      <form onSubmit={formik.handleSubmit} className={'input-and-btn-wrapper'}>
        <input
          type="text"
          name="searchString"
          value={formik.values.searchString}
          onChange={formik.handleChange}
          placeholder="Enter a search query..."
          className={'search-input font-controls text-primary'}
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={isInitialLoading}
          className={'search-btn font-controls text-primary animation-02s-all'}
        >
          Search
        </button>
      </form>

      {(isInitialLoading || searchError) ? (
        <div className={`${searchError ? 'special-red' : 'text-primary'} font-main`}>{searchError ? searchError : 'Loading...'}</div>
      ) : (
        (searchResults?.pageInfo?.endCursor !== '-1' || searchResults?.repositoryCount > 0) && (
          <div className={'result-section-wrapper'}>
            <div className={'top-grad'}/>
            {searchResults?.pageInfo?.endCursor !== '-1' && (
              <div className={'font-h1 text-primary'}>
                {`Repositories found: ${searchResults.repositoryCount}`}
              </div>
            )}
            {searchResults?.repositoryCount > 0 && (
              <div className={'result-list-wrapper'}>
                <InfiniteScroll
                  pageStart={0}
                  loadMore={handleLoadMore}
                  hasMore={searchResults.pageInfo.hasNextPage}
                  loader={<div className='font-main text-primary' key={0} style={{ marginTop: 8 }}>Loading ...</div>}
                  useWindow={false}
                >
                  <div className={'result-list'}>
                    {searchResults.repositoryInfo.map((r, i) => (
                      <RepoCard
                        repoInfo={r}
                        key={`card-${i}`}
                        numInList={i + 1}
                      />
                    ))}
                  </div>
                </InfiniteScroll>
                <div className={'bottom-grad'}/>
              </div>
            )}
          </div>
        )
      )}
      {loadMoreError && <div className={'special-red text-primary'}>{loadMoreError}</div>}
    </div>
  );
};

export default SearchComponent;
