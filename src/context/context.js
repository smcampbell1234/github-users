import React, { useState, useEffect } from 'react';
import mockUser from './mockData.js/mockUser';
import mockRepos from './mockData.js/mockRepos';
import mockFollowers from './mockData.js/mockFollowers';
import axios from 'axios';

const rootUrl = 'https://api.github.com';

const GithubContext = React.createContext();
// have accesss to Provider, Consumer - GithubtContext.Provider
const GithubProvider = ({children}) => {
  const [githubUser,setGithubUser] = useState(mockUser);
  const [repos,setRepos] = useState(mockRepos);
  const [followers,setFollowers] = useState(mockFollowers);


  // request loading
  const [requests, setRequests] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const searchGithubUser = async (user) => {
    // clear any past errors and open spinner
    toggleError()
    setIsLoading(true)
    const response = await axios(`${rootUrl}/users/${user}`)
      .catch(err => console.log("************ 1",err))
    if(response) {
      setGithubUser(response.data)
      const {login, followers_url} = response.data;

      // get repos - https://api.github.com/users/john-smilga/repos?per_page=100
      // get followers - https://api.github.com/users/john-smilga/followers
      // Promise.allSettled waits for both calls to finish before entering then
      await Promise.allSettled([
          axios(`${rootUrl}/users/${login}/repos?per_page=100`),
          axios(`${followers_url}?per_page=100`)
        ])
        .then((results) => {
          // deconstruct - index 0 is repos, index 1 is followers
          const [repos,followers] = results;
          const status = 'fulfilled';
          if (repos.status === status) {
            setRepos(repos.value.data)
          }
          if (followers.status === status) {
            setFollowers(followers.value.data)
          }
          console.log(results)
        }).catch(err => console.log(err))
    } else {
      toggleError(true,'there is no user with that username')
    }
    // update Request Count state and close spinner
    checkRequests();
    setIsLoading(false)
  }
  // error
  const [error,setError] = useState({show:false,msg:""});
  // check rate
  const checkRequests = () => {
    axios(`${rootUrl}/rate_limit`)
      .then(({data})=>{
        let {
          rate:{ remaining }
        } = data;
        setRequests(remaining)
        if (remaining === 0){
          toggleError(true,'sorry, you have exceeded your hourly rate limit!')
        }
      })
      .catch((err) => console.log(err))
  };
  function toggleError(show=false,msg=""){
    setError({show,msg})
  }
  // error
  useEffect(checkRequests,[]);
  return (
    <GithubContext.Provider value={{
      githubUser,
      repos,
      followers,
      requests,
      error,
      searchGithubUser,
      isLoading,
    }}>{children}</GithubContext.Provider>
  );
};

export {GithubProvider, GithubContext}

/**
  Github API
 - root endpoint
 [github api root endpoint] (https://api.github.com)
 - get user
 [user](https://api.github.com/users/smilga)
 - user
 [repos](https://api.github.com/users/john-smilga/repos?per_page=100)
 - followers
 [followers](https://api.github.com/users/john-smilga/followers)
 - rate limit
 [rate limit](https://api.github.com/rate-limit) // 60 per hour for free accounts
 */