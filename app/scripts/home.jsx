import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import classnames from 'classnames';

import style from '../styles/home.scss';

class ZencareApp extends Component {
  constructor(props) {
    super(props);

    this.state = {
      fakeClicked: false,
    };
  }

  onFakeClick() {
    this.setState(() => ({
      fakeClicked: true,
    }));
  }

  render() {
    const {
      fakeClicked,
    } = this.state;

    const fakeClasses = classnames(
      'zencare-app__fake',
      {
        'zencare-app__fake--clicked': fakeClicked,
      }
    );

    return (
      <div className="zencare-app">
        <div className="zencare-app__placeholder">
          Zencare App
        </div>
        <div className={fakeClasses}>
          <div onClick={() => this.onFakeClick()} className="btn zencare-app__fake__button">
            Click Me!
          </div>
          <div className="zencare-app__fake__msg">
            No Peeking!
          </div>
        </div>
      </div>
    );
  }
}

window.onload = () => {
  ReactDOM.render(
			<BrowserRouter>
				<ZencareApp />
			</BrowserRouter>
    ,
    document.querySelector('.zencare-app-container')
  );
};
