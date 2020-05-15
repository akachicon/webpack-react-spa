import * as React from 'react';
import stl from './ClassDefault.scss';

class ClassDefault extends React.Component {
  render() {
    return <h1 class={stl.text}>Default Export Class __DEV__: {__DEV__}</h1>;
  }
}

export default ClassDefault;
