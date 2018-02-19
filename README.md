# Common visualization UI fragments

[![npm](https://img.shields.io/npm/v/@gros/visualization-ui.svg)](https://www.npmjs.com/package/@gros/visualization-ui)
[![Build 
Status](https://travis-ci.org/ICTU/gros-visualization-ui.svg?branch=master)](https://travis-ci.org/ICTU/gros-visualization-ui)

This library contains a number of user interface fragments to be used in 
visualization based on [Data-Driven Documents](https://d3js.org/).

## Installation

Install the fragments using `npm install --save @gros/visualization-ui`, then 
use them in your visualization sources with
```js
import {locale, navigation, spinner} from '@gros/visualization-ui';
```

This requires that your visualization is built via 
[Webpack](https://webpack.js.org/) or some other dependency bundler that 
supports rewriting ES2015 or later syntax.

## Overview

The library provides three objects: `locale`, `navigation` and `spinner`. These 
objects must be instantiated with `new` and can be provided an object of 
configuration options. All modules have the option `container` which defines 
a query selector for an element to insert the fragment into.

### Locale

Create a localization object to provide translated messages and attributes of 
a selected locale. For this purpose, the object must be instantiated with an 
object containing locale-specific attribute objects, with language codes as 
keys of the encompassing object. The attribute objects should have the same 
keys as each other, where `"messages"` plays a special role; it must be an 
object containing message keys and raw output or sprintf-compatible format 
strings. Also, `"language"` must provide a human-readable description of the 
locale in its own language.

The localization object can select a different language at any time, and can be 
queried for any attribute or message from the locale object. Additionally, it 
can generate a navigation list for selecting a different language (but it does
not handle the selection change event itself), and it can automatically replace 
elements with a `data-message` attribute in the document or a certain selection 
with their locale equivalent, using the element children as arguments.

Setup:

```js
import * as d3 from 'd3';
import spec from './locales.json';
const locales = new locale(spec, lang="en");
// Select locale from query string
locales.select(URLSearchParams(window.location.search).get("lang"));

console.log(locales.message("test"));
console.log(locales.message("format", [3, 'baz']));
// Replace all messages in document
locales.updateMessages();

// Generate navigation
locales.generateNavigation(d3.select("nav.languages"), "index.html", "lang");
```

### Navigation

Create a navigation bar to switch between view for different selections. The 
URL state is changed via the location hash, which is also checked on startup.
Multiple navigation objects can exist concurrently if a unique `prefix` is 
given to each of them. By default, the first item in the navigation is 
selected, but this can be overridden by returning `true` in `setCurrentItem`, 
in which case nothing is selected if an unknown location hash is set at start.

Setup:

```js
const projectsList = ['BAR', 'BAZ', 'FOO'];
const projectsNavigation = new navigation({
    container: '#navigation',
    prefix: 'project_',
    setCurrentItem: (project, hasProject) => {
        if (!hasProject) {
            console.log('An unknown project was selected: ' + project);
        }
        else {
            console.log('Selected project: ' + project);
        }
        return hasProject;
    },
    addElement: (element) => {
        element.text(d => `Project ${d}`);
    }
})
projectsNavigation.start(projectsList);

location.hash = '#project_FOO'; // Select the third project
location.hash = '#FOO'; // Not handled
location.hash = '#project_QUX'; // Unknown project selected
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

## Development

- The repository can be found on 
  [GitHub](https://github.com/ICTU/gros-visualization-ui).
- [Travis](https://travis-ci.org/ICTU/gros-visualization-ui) is used to run 
  unit tests.
- You can perform local tests using `npm test`.
- We publish releases to 
  [npm](https://www.npmjs.com/package/@gros/visualization-ui).

## License

The visualization fragments library is licensed under the Apache 2.0 License.
