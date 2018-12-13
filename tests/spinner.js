/*
Unit tests for the visualization spinner fragment.

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

const assert = require('chai').assert,
      setupPage = require('./index');

describe('Spinner', () => {
    it('Creates the spinner', (done) => {
        const { window, d3, spinner } = setupPage('<div id="loader_container"></div>', done);
        const loadingSpinner = new spinner();
        loadingSpinner.start();
        assert.isFalse(d3.select("svg#loader").empty(), 'Spinner has SVG');
        done();
    });
    it('Rotates the spinner', (done) => {
        const { window, d3, spinner } = setupPage('<div id="loader_container"></div>', done);
        const loadingSpinner = new spinner({
            startAngle: 45,
            duration: 1000
        });
        loadingSpinner.start();
        const spin = d3.select("svg#loader g g");
        assert.equal(spin.attr("style"), "transform: rotate(45deg); animation: gros-spinner 1000ms linear;");
        done();
    });
    it('Creates at most one spinner with same ID', (done) => {
        const { window, d3, spinner } = setupPage('<div id="loader_container"></div>', done);
        const loadingSpinner = new spinner();
        loadingSpinner.start();
        loadingSpinner.start();
        assert.equal(d3.selectAll("svg#loader").size(), 1);
        done();
    });
    it('Removes the spinner and its events', (done) => {
        const { window, d3, spinner } = setupPage('<div id="loader_container"></div>', done);
        const duration = 25;
        const loadingSpinner = new spinner({ duration: duration });
        loadingSpinner.start();
        loadingSpinner.stop();
        assert.isTrue(d3.select("svg#loader").empty(), 'Spinner is removed');
        done();
    });
});
