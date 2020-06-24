import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';

import style from '../styles/home.scss';

class ZencareApp extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="zencare-app">
        Zencare App
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
