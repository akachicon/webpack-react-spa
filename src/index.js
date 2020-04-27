import customModule from './custom-module';
import anotherCustomModule from './another-custom-module';
import style from './main.scss';

console.log(`hello ${customModule.a}!`);

setTimeout(() => {
  const appMount = document.getElementsByClassName('app')[0];
  const span = document.createElement('span');

  span.innerText = 'started';
  appMount.appendChild(span);
}, 2000);

import(
  './dynamic-module0'
  ).then(exports => {
  console.log(exports);
});

import(
  /* webpackChunkName: "dynamic-module2" */
  './dynamic-module2'
).then(exports => {
  console.log(exports);
});

import(
  /* webpackChunkName: "dynamic-module" */
  './dynamic-module'
).then(exports => {
  console.log(exports);
});

class IndexClass {}

const c = new IndexClass();
const d = new Promise(res => res());

d.then(() => console.log('resolved!'));
