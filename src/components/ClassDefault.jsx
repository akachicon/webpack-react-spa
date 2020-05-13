import * as React from 'react';
import stl from './ClassDefault.scss';

class ClassDefault extends React.Component {
  render() {
    return <h1 class={stl.text}>Default Export Class</h1>;
  }
}

export default ClassDefault;
