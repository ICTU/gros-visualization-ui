# Common visualization UI fragments

[![npm](https://img.shields.io/npm/v/@gros/visualization-ui.svg)](https://www.npmjs.com/package/@gros/visualization-ui)
[![Build 
Status](https://travis-ci.org/ICTU/gros-visualization-ui.svg?branch=master)](https://travis-ci.org/ICTU/gros-visualization-ui)
[![Coverage 
Status](https://coveralls.io/repos/github/ICTU/gros-visualization-ui/badge.svg?branch=master)](https://coveralls.io/github/ICTU/gros-visualization-ui?branch=master)
[![Quality Gate 
Status](https://sonarcloud.io/api/project_badges/measure?project=ictu-gros%3Avisualization-ui&metric=alert_status)](https://sonarcloud.io/dashboard?id=ictu-gros%3Avisualization-ui)

This library contains a number of user interface fragments to be used in 
visualization based on [Data-Driven Documents](https://d3js.org/).

## Installation

Install the fragments using `npm install --save @gros/visualization-ui`, then 
use them in your visualization sources with
```js
import {locale, navbar, navigation, spinner} from '@gros/visualization-ui';
```

This requires that your visualization is built via 
[Webpack](https://webpack.js.org/) or some other dependency bundler that 
supports rewriting ES2015 or later syntax.

Additionally, to enable spinner animations, include the SCSS sources into your
bundler, or add the distributed CSS bundle to a Web page, for example using:

```html
<link rel="stylesheet" href="dist/bundle.min.css">
```

## Overview

The library provides four objects: `locale`, `navbar`, `navigation` and 
`spinner`. These objects must be instantiated with `new`. All modules can be 
provided an object upon construction, which is provides configuration options 
for the fragment except for `locale` where it provides localization 
specifications. All modules except for `locale` have the option `container` 
which defines a query selector for an element to insert the fragment into. In 
the `navbar`, the locale is passed separately upon construction.

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
with their locale equivalent, using the element children as arguments. It can 
also replace attributes of elements when they are prefixed with `data-message-` 
and their attribute name is explicitly provided.

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

// Replace all messages in a selection
locales.updateMessages(d3.select("#content"));

// Replace all messages in the document, including specific attributes
// (data-message-title and data-message-alt, in this example).
locales.updateMessages(d3.selection(), ["title", "alt"]);

// Generate navigation
locales.generateNavigation(d3.select("nav.languages"), "index.html", "lang");
```

### Navigation bar

Create a horizontal navigation heading to provide a branding, menus and other 
accessibility links. The navigation bar structure is defined by nested objects 
and arrays, and optionally configuration and locale sources. The structure is 
optimized to define a navigation heading with items, links, icons, but also 
branding, burger, menu, dropdown and other sections.

Setup:

```js
const nav = new navbar({
    "container": ".navbar", // Navbar container
    "languages": "#languages", // Selector of a menu in the structure
    "language_page": "index.html",
    "language_query": "lang",
    "my_url": "https://example.com" // Referenced from a link with "config" key
}, locales);
nav.fill(structure);
```

See 
[tests/navbar.json](https://github.com/ICTU/gros-visualization-ui/blob/master/tests/navbar.json) 
for an example structure.

### Navigation

Create a horizontal navigation list to switch between views for different 
selections. The URL state is changed via the location hash, which is also 
checked on startup.
Multiple navigation objects can exist concurrently if a unique `prefix` is 
given to each of them. By default, the first item in the navigation is 
selected, but this can be overridden by returning `true` in `setCurrentItem`, 
in which case nothing is selected if an unknown item is set in the location 
hash at start.

Setup and usage:

```js
const projectsList = ['BAR', 'BAZ', 'FOO'];
const projectsNavigation = new navigation({
    container: '#navigation',
    prefix: 'project_',
    setCurrentItem: (project, hasProject, list) => {
        if (!hasProject) {
            console.log('An unknown project was selected: ' + project);
        }
        else {
            console.log('Selected project: ' + project);
        }
        return hasProject;
    },
    // Customize *link* properties of new items
    addElement: (element) => {
        element.text(d => `Project ${d}`);
    }
    // Access other *list item* selections via updateElement and removeElement
})
projectsNavigation.start(projectsList);

location.hash = '#project_FOO'; // Select the third project
location.hash = '#FOO'; // Not handled
location.hash = '#project_QUX'; // Unknown project selected

// Update navigation list
projectsNavigation.update(projectsList.concat('QUX', 'ZUR'));
```

The items in the list must be unique such that the appropriate element is 
selected. Using data objects as items in the provided navigation list is also 
supported as long as a `key` configuration is provided which acts as both the 
`d3` data key function and the default method of displaying text and creating 
a comparable anchor in the navigation item link.

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

// ... Perform some loading, processing, etc.

loadingSpinner.stop();
```

## Development

- The repository can be found on 
  [GitHub](https://github.com/ICTU/gros-visualization-ui).
- [Travis](https://travis-ci.org/ICTU/gros-visualization-ui) is used to run 
  unit tests.
- You can perform local tests using `npm test`. This requires the source code
  repository for the test suite and installing the development dependencies,
  using `npm install` in the cloned repository directory.
- We publish releases to 
  [npm](https://www.npmjs.com/package/@gros/visualization-ui).

## License

The visualization fragments library is licensed under the Apache 2.0 License.
