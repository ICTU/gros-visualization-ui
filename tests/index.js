/*
Unit tests for the visualization fragments.

Copyright 2017 ICTU

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
      assert = require('chai').assert,
      d3 = require('d3'),
      jsdom = require('jsdom');

const bundle = fs.readFileSync('dist/bundle.js').toString(),
      bundleScript = new Script(bundle);

var currentWindow;

function setup(body, done) {
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

    // Create a D3 object.
    const d3window = d3.select(dom.window.document);

    // Run the script to acquire the module components.
    const { navigation, spinner } = dom.runVMScript(bundleScript);

    currentWindow = dom.window;

    return { window: dom.window, d3: d3window, navigation, spinner };
}

afterEach(() => {
    // Close the window used in the test so that timers and scripts stop.
    if (currentWindow !== null) {
        currentWindow.close();
        currentWindow = null;
    }
});

describe('Navigation', () => {
    const projectsList = ['BAR', 'BAZ', 'FOO'];
    it('Fills navigation', (done) => {
        const { window, d3, navigation } = setup('<div id="navigation"></div>', done);
        const projectsNavigation = new navigation();
        projectsNavigation.start(projectsList);
        const items = d3.selectAll('#navigation ul li');
        assert.equal(items.size(), 3);
        assert.equal(items.filter(":nth-child(1)").select('a').text(), 'BAR');
        assert.equal(items.filter(":nth-child(2)").select('a').text(), 'BAZ');
        assert.equal(items.filter(":nth-child(3)").select('a').text(), 'FOO');
        done();
    });

    it('Sets active class', (done) => {
        const { window, d3, navigation } = setup('<div id="navigation"></div>', done);
        const projectsNavigation = new navigation();
        projectsNavigation.start(projectsList);
        const items = d3.selectAll('#navigation ul li'),
              first = items.filter(":nth-child(1)");
        assert.isTrue(first.classed('is-active'), 'First element selected');
        window.location.hash = "#BAZ";
        window.addEventListener("hashchange", () => {
            assert.isFalse(first.classed('is-active'), 'First element unselected');
            const second = items.filter(":nth-child(2)");
            assert.isTrue(second.classed('is-active'), 'Second element selected');
            done();
        });
    });
});

describe('Spinner', () => {
    it('Creates the spinner', (done) => {
        const { window, d3, spinner } = setup('<div id="loader_container"></div>', done);
        const loadingSpinner = new spinner();
        loadingSpinner.start();
        assert.isFalse(d3.select("svg#loader").empty(), 'Spinner has SVG');
        done();
    });
});
