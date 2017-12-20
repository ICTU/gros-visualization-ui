# Common visualization UI fragments

This library contains a number of user interface fragments to be used in 
visualization based on [Data-Driven Documents](https://d3js.org/).

## Installation

Install the fragments using `npm install --save @gros/visualization-ui`, then 
use them in your visualization sources with
```js
import {navigation, spinner} from '@gros/visualization-ui';
```

This requires that your visualization is built via 
[Webpack](https://webpack.js.org/) or some other dependency bundler that 
supports rewriting ES2015 or later syntax.

## Overview

The library provides two objects: `navigation` and `spinner`.

### Navigation

Create a navigation bar to switch between view for different projects. The URL 
state is changed via the location hash, which is also checked on startup.

Setup:

```js
const projectsList = ['BAR', 'BAZ', 'FOO'];
const projectsNavigation = new navigation({
    container: '#navigation',
    setCurrentProject: (project, hasProject) => {
        if (!hasProject) {
            console.log('A non-project was selected: ' + project);
        }
        console.log('Selected project: ' + project);
    }
})
projectsNavigation.start(projectsList);

location.hash = '#FOO';
```

### Spinner

Create a loading spinner which can be shown until the data is fully loaded.

Setup:
```js
import * as d3 from 'd3';
const loadingSpinner = new spinner({
    container: '#container',
    id: 'loading-spinner',
    width: d3.select('#container').node().clientWidth,
    height: 100,
    startAngle: 220
});
loadingSpinner.start();

loadingSpinner.stop();
```

## License

The visualization fragments library is licensed under the Apache 2.0 License.
