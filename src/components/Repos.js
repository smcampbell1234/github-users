import React from 'react';
import styled from 'styled-components';
import { GithubContext } from '../context/context';
import { ExampleChart, Pie3D, Column3D, Bar3D, Doughnut2D } from './Charts';

const Repos = () => {
  const {repos} = React.useContext(GithubContext)

  // iterate repose and create object with language totals
  const languages = repos.reduce((total,item)=>{
    const { language,stargazers_count } = item;
    if (!language) return total;
    if(!total[language]) {
      // field does not yet exist in object, add it with count 1
      total[language] = {
        label:language,
        value:1,
        stars:stargazers_count
      };
    } else {
      // field exists, add 1 to its value
      total[language] = {
        ...total[language],
        value: total[language].value + 1,
        stars: total[language].stars + stargazers_count,
      };
    }
    return total;
  },{});

  // most used language
  // 1. (values) make arr of values, 2. (sort) highest value to lowest, 3. (slice) take top five languages
  const mostUsed = Object.values(languages).sort((a,b)=>{
    return b.value - a.value;
  }).slice(0,5);

  // most stars per language
  // 1. (values) make arr of values, 2. (sort) highest stars to lowest,
  // 3. overwrite value to hae star score, not language count (the chart is working off 'value' field), 4. (slice) take top five languages
  const mostPopular = Object.values(languages).sort((a,b)=>{
    return b.stars - a.stars;
  }).map((item)=>{
    return {...item,value:item.stars}
  }).slice(0,5);

  // Bar Charts - most popular (starred) project repo and most forked project repo
  let {stars,forks} = repos.reduce((total,item) => {
    const {stargazers_count, name, forks} = item;
    total.stars[stargazers_count] = {
      label:name,
      value:stargazers_count,
    }
    total.forks[forks] = {
      label: name,
      value: forks,
    }
    return total
  },{
    stars: {},
    forks:{},
  })

  // values will have highest starred project at bottom, so take last five and reverse
  stars = Object.values(stars).slice(-5).reverse()
  forks = Object.values(forks).slice(-5).reverse()










  console.log(stars)
  const chartData = [
    {
      label: "HTML",
      value: "20.4"
    },
    {
      label: "CSS",
      value: "30.3"
    },
    {
      label: "Javascript",
      value: "50"
    },
  ];

  return (
      <section className="section">
        <Wrapper className='section-center'>
          <Pie3D data={mostUsed} />
          <Column3D data={stars} />
          <Doughnut2D data={mostPopular} />
          <Bar3D data={forks} />
          {/*<ExampleChart data={chartData}/>;*/}
        </Wrapper>
      </section>
    )
};

const Wrapper = styled.div`
  display: grid;
  justify-items: center;
  gap: 2rem;
  @media (min-width: 800px) {
    grid-template-columns: 1fr 1fr;
  }

  @media (min-width: 1200px) {
    grid-template-columns: 2fr 3fr;
  }

  div {
    width: 100% !important;
  }
  .fusioncharts-container {
    width: 100% !important;
  }
  svg {
    width: 100% !important;
    border-radius: var(--radius) !important;
  }
`;

export default Repos;
