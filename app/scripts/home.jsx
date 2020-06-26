import axios from 'axios';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import classnames from 'classnames';

import style from '../styles/home.scss';


const PB_URL = 'https://pixabay.com/api/';
const PB_KEY = '13118174-cea0197aef7a0de714a90d9e3';

class ZencareApp extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentResults: [],
      currentRound: 0,
      currentMatchup: [],
      offset: 0,
      seenMatches: {},
      params: {
        query: '',
        totalRounds: 0,
        itemCount: 0,
      },
      error: null,
    };

    this.requestResults = this.requestResults.bind(this);
  }

  requestResults() {
    const {
      query,
      totalRounds,
      itemCount,
    } = this.state.params;

    axios.get(PB_URL, {
      params: {
        q: query,
        key: PB_KEY,
        image_type: 'photo',
        pretty: 'true'
      },
    }).then(res => {
      if (!(res && res.data && res.data.hits)) {
        this.setState(() => ({
          error: 'No data available from PixaBay',
        }));
      }

      const {
        hits,
      } = res.data;

      const currentResults = hits.slice(Number.parseInt(itemCount)).map(item => {
        const {
          id,
          previewURL,
          largeImageURL,
        } = item;

        return {
          id,
          previewURL,
          largeImageURL,
          views: 0,
          wins: 0,
        };
      });

      this.setState(() => ({
        currentResults,
        currentRound: 1,
        offset: 1
      }));
    });
  }

  chooseItem(choices, item) {
    this.setState(prevState => {
      const {
        currentResults,
        currentRound,
        seenMatches,
        offset,
        params,
      } = prevState;

      if (currentRound >= params.totalRounds) {
        return null;
      }

      choices.forEach(x => {
        x.views += 1;
      });

      item.wins += 1;

      seenMatches[`${choices[0].id}-${choices[1]}.id`] = true;

      return {
        currentRound: currentRound + 1,
        offset: offset + 1,
        seenMatches
      };
    })
  }

  renderChoices(choices) {
    const {
      currentRound,
    } = this.state;

    const {
      totalRounds,
    } = this.state.params;

    if (Number.parseInt(currentRound) >= Number.parseInt(totalRounds)) {
      return null;
    }

    const choiceBlocks = choices.map(item => (
      <div className="zca__game__arena__opt">
        <img src={item.largeImageURL} onClick={() => this.chooseItem(choices, item)} />
        {item.chosen && (
          <div className="zca__game__arena__opt__check">ch</div>
        )}
      </div>
    ));

    return (
      <div className="zca__game__arena">
        {choiceBlocks}
      </div>
    );
  }

  renderGame() {
    const {
      params,
      currentResults,
      currentRound,
      offset,
    } = this.state;

    const {
      totalRounds,
      query,
    } = params;

    const resLength = currentResults.length;

    const choiceIdxOne = currentRound % resLength;
    const choiceIdxTwo = (currentRound + offset) % resLength;

    let choices = [];
    if (currentResults.length) {
      choices = [currentResults[choiceIdxOne], currentResults[choiceIdxTwo]];
    }

    return (
      <div className="zca__game">
        <div className="zca__game__header">
          <div className="zca__game__header__title">
            {query || 'COUCH'} FACEOFF
          </div>
          {choices && (
            <div className="zca__game__header__subtitle">
              Pick the best {query}
            </div>
          )}
        </div>
        {choices && this.renderChoices(choices)}
        <div className="zca__game__footer">
          {Number.parseInt(totalRounds) - Number.parseInt(currentRound)} matchups remaining
        </div>
      </div>
    );
  }

  renderRankings() {
    const {
      currentResults,
      currentRound,
    } = this.state;

    const listItems = currentResults.reduce((acc, item) => {
      if (item.views) {
        return [...acc, item];
      }
      return acc;
    }, []);

    const listBlocks = listItems.map((item, idx) => (
      <div className="zca__results__listing__row">
        <div>{idx}</div>
        <div>
          <img src={item.previewURL} />
        </div>
        <div>{item.views} matchups</div>
        <div>{(Number.parseFloat(item.wins) / Number.parseFloat(item.views)) * 100}% win rate</div>
      </div>
    ));

    return (
      <div className="zca__results__listing">
        {listBlocks}
      </div>
    );
  }
        

  onChangeParam(field, value) {
    this.setState(prevState => ({
      params: {
        ...prevState.params,
        [field]: value,
      },
    }));
  }

  startNew() {
    this.requestResults();
  }

  renderNew() {
    const {
      params,
    } = this.state;

    const {
      query,
      totalRounds,
      itemCount,
    } = params;

    return (
      <div className="zca__results__new">
        <div className="zca__results__new__header">
          Start a New Matchup
        </div>
        <div className="zca__results__new__params">
          <div>
            <div>Search Term</div>
            <input type="text" value={query} onChange={event => this.onChangeParam('query', event.target.value)} />
          </div>
          <div>
            <div>Max Entrants</div>
            <input type="text" value={itemCount} onChange={event => this.onChangeParam('itemCount', event.target.value)} />
          </div>
          <div>
            <div>Total Matchups</div>
            <input type="text" value={totalRounds} onChange={event => this.onChangeParam('totalRounds', event.target.value)} />
          </div>
          <div>
            <div className="zca__results__new__start" onClick={() => this.startNew()}>Start!</div>
          </div>
        </div>
      </div>
    );
  }

  render() {
    return (
      <div className="zca">
        {this.renderGame()}
        <div className="zca__results">
          <div className="zca__results__header">
            Live Results
          </div>
          {this.renderRankings()}
          {this.renderNew()}
        </div> 
      </div>
    );
  }
}

window.onload = () => {
  ReactDOM.render(
      <ZencareApp />
    ,
    document.querySelector('.zencare-app-container')
  );
};
