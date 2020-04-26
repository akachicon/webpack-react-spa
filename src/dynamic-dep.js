import asyncStyle from './async.css';

setTimeout(() => console.log('dynamic dep side effect'), 100);

export default 'dynamic-dep';
