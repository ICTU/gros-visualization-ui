/*
Unit tests for the visualization fragments.

Copyright 2017-2018 ICTU

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
/* jshint node: true, mocha: true */
'use strict';

const fs = require('fs'),
      { Script } = require('vm'),
      d3 = require('d3'),
      jsdom = require('jsdom');

const bundle = fs.readFileSync('dist/bundle.js').toString(),
      bundleScript = new Script(bundle);

global.__coverage__ = {};
var currentWindow;

function setupPage(body, done) {
    const virtualConsole = new jsdom.VirtualConsole();
    // Fail the test immediately on uncaught/JSDOM errors
    virtualConsole.on("jsdomError", (error) => {
        done(error || "JSDOM Error");
    });
    virtualConsole.sendTo(console, { omitJSDOMErrors: true });

    // Set up the DOM document.
    const html = `<html><head></head><body>${body}</body>`;
    const dom = new jsdom.JSDOM(html, {
        runScripts: "outside-only",
        pretendToBeVisual: true,
        virtualConsole
    });

    dom.window.__coverage__ = global.__coverage__;
    // Create a D3 object.
    const d3window = d3.select(dom.window.document);

    // Run the script to acquire the module components.
    const { Locale, Navbar, Navigation, Spinner } = dom.runVMScript(bundleScript);

    currentWindow = dom.window;

    return {
        window: dom.window,
        d3: d3window,
        Locale, Navbar, Navigation, Spinner
    };
}

afterEach(() => {
    // Close the window used in the test so that timers and scripts stop.
    if (currentWindow !== null) {
        currentWindow.close();
        currentWindow = null;
    }
});

module.exports = setupPage;
