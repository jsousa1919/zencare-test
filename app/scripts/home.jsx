import axios from 'axios';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import classnames from 'classnames';

import style from '../styles/home.scss';


const PB_URL = 'https://pixabay.com/api/';
const PB_KEY = '13118174-cea0197aef7a0de714a90d9e3';

const DEFAULT_STATE = {
  currentResults: [],
  currentRound: 1,
  currentMatchup: [],
  requestingResults: false,
  offset: 0,
  endBarrier: null,
  choiceIndices: [null, null],
  error: null,
  finished: false,
  reverse: false,
};

class ZencareApp extends Component {
  constructor(props) {
    super(props);

    this.state = {
      params: {
        query: 'kitten',
        totalRounds: 10,
        itemCount: 5,
      },
      ...DEFAULT_STATE,
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
        per_page: itemCount,
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

      if (!hits.length) {
        this.setState(() => ({
          error: 'No results found',
        }));
      }

      const currentResults = hits.map(item => {
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
        requestingResults: false,
        currentResults,
        currentRound: 1,
        offset: 0,
        endBarrier: currentResults.length - 1,
        reverse: false,
        choiceIndices: [0, currentResults.length - 1],
      }));
    });
  }

  chooseItem(choices, item) {
    this.setState((prevState) => {
      const {
        currentResults,
        currentRound,
        params,
        choiceIndices,
      } = prevState;

      const {
        totalRounds,
      } = params;

      let {
        offset,
        endBarrier,
        reverse,
      } = prevState;

      let [firstIdx, lastIdx] = choiceIndices;

      choices.forEach(x => {
        x.views += 1;
      });

      item.wins += 1;

      if (currentRound === totalRounds) {
        return {
          finished: true,
        };
      } else if (offset >= (endBarrier - 1)) {
        endBarrier -= 1;
        if (endBarrier <= 1) {
          return {
            finished: true,
          }
        }
        offset = 0;
        reverse = !reverse;
        firstIdx = 0;
        lastIdx = endBarrier;
      } else if (firstIdx >= lastIdx - 2) {
        offset += 1;
        if (reverse) {
          firstIdx = 0;
          lastIdx = endBarrier - offset;
        } else {
          firstIdx = offset;
          lastIdx = endBarrier;
        }
      } else {
        firstIdx += 1;
        lastIdx -= 1;
      }

      return {
        currentRound: currentRound + 1,
        offset,
        endBarrier,
        reverse,
        choiceIndices: [firstIdx, lastIdx],
      };
    });
  }

  renderChoices(choices) {
    const {
      currentRound,
    } = this.state;

    const {
      totalRounds,
    } = this.state.params;

    if (currentRound > totalRounds) {
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
      choiceIndices,
      finished,
      requestingResults,
    } = this.state;

    const {
      totalRounds,
      query,
    } = params;

    const [firstIdx, lastIdx] = choiceIndices;

    let choices;
    if (currentResults.length && firstIdx !== null && lastIdx !== null) {
      choices = [currentResults[firstIdx], currentResults[lastIdx]];
    }

    const titleQuery = query.toLowerCase().split(' ').map(w => w ? (w[0].toUpperCase() + w.slice(1)) : '').join(' ');

    return (
      <div className="zca__game">
        <div className="zca__game__header">
          <div className="zca__game__header__title">
            {titleQuery} FACEOFF
          </div>
          {choices && (
            <div className="zca__game__header__subtitle">
              Pick the best{(' ' + query) || '...'}
            </div>
          )}
        </div>
        {(choices && !(finished || requestingResults)) && this.renderChoices(choices)}
        <div className="zca__game__footer">
          {finished && (
            <span>Finished!</span>
          ) || requestingResults && (
            <span>Loading...</span>
          ) || choices && (
            <span>{(totalRounds - currentRound) + 1} matchups remaining</span>
          )}
        </div>
      </div>
    );
  }

  renderRankings() {
    const {
      currentResults,
      currentRound,
    } = this.state;

    let listItems = currentResults.reduce((acc, item) => {
      if (item.views) {
        return [...acc, item];
      }
      return acc;
    }, []);

    if (!listItems.length) {
      return null;
    }

    const calcWinRate = (item => (Number.parseFloat(item.wins) / Number.parseFloat(item.views)));

    listItems.sort((a, b) => calcWinRate(a) > calcWinRate(b) ? -1 : 1);

    const listBlocks = listItems.map((item, idx) => (
      <div className="zca__results__listing__row">
        <div>{idx + 1}</div>
        <div>
          <img src={item.previewURL} />
        </div>
        <div>{item.views} matchups</div>
        <div>{(calcWinRate(item) * 100).toFixed(2)}% win rate</div>
      </div>
    ));

    return ( 
      <>
        <div className="zca__results__header">
          Live Results
        </div>
        <div className="zca__results__listing">
          {listBlocks}
        </div>
      </>
    );
  }
        

  onChangeParam(field, value) {
    this.setState(prevState => ({
      params: {
        ...prevState.params,
        [field]: value,
        error: null,
      },
    }));
  }

  startNew() {
    this.setState((prevState) => {
      let {
        query,
        totalRounds,
        itemCount,
      } = prevState.params;

      totalRounds = Number.parseInt(totalRounds);
      itemCount = Number.parseInt(itemCount);

      if (isNaN(totalRounds) || totalRounds < 1) {
        return {
          error: 'Total Matchups must be at least 1',
        };
      } else if (isNaN(itemCount) || itemCount < 3 || itemCount > 20) {
        return {
          error: 'Max Entrants must be between 3 and 20',
        };
      } else if (query && totalRounds && itemCount) {
        this.requestResults();
        return {
          error: null,
          finished: false,
          requestingResults: true,
        };
      } else {
        return {
          error: 'Missing required fields',
        };
      }
    });
  }

  renderNew() {
    const {
      params,
      error,
    } = this.state;

    const {
      query,
      totalRounds,
      itemCount,
    } = params;

    const handleKeyPress = (key) => {
      if (key === 13) {
        this.startNew();
      }
    };

    return (
      <div className="zca__results__new">
        <div className="zca__results__new__header">
          Start a New Matchup
        </div>
        <div className="zca__results__new__params">
          <div>
            <div>Search Term</div>
            <input type="text" value={query} onChange={event => this.onChangeParam('query', event.target.value)} onKeyPress={e => handleKeyPress(e.charCode)} />
          </div>
          <div>
            <div>Max Entrants</div>
            <input type="text" value={itemCount} onChange={event => this.onChangeParam('itemCount', event.target.value)} onKeyPress={e => handleKeyPress(e.charCode)} />
          </div>
          <div>
            <div>Total Matchups</div>
            <input type="text" value={totalRounds} onChange={event => this.onChangeParam('totalRounds', event.target.value)} onKeyPress={e => handleKeyPress(e.charCode)} />
          </div>
          <div>
            <div className="zca__results__new__start" onClick={() => this.startNew()}>Start!</div>
          </div>
        </div>
        {error && (
          <div className="zca__results__new__error">{error}</div>
        )}
      </div>
    );
  }

  render() {
    return (
      <div className="zca">
        {this.renderGame()}
        <div className="zca__results">
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
