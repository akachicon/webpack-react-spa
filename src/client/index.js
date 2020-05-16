import React from 'react';
import { render } from 'react-dom';
import App from '@app/components/App';

render(<App />, document.getElementById('app'));

setTimeout(() => {
  const div = document.createElement('div');

  div.innerText = 'start timeout';
  document.body.appendChild(div);
}, 1500);
