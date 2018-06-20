/*
Unit tests for the visualization navigation fragment.

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

describe('Navigation', () => {
    const projectsList = ['BAR', 'BAZ', 'FOO'];
    it('Fills navigation', (done) => {
        const { window, d3, navigation } = setupPage('<div id="navigation"></div>', done);
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
        const { window, d3, navigation } = setupPage('<div id="navigation"></div>', done);
        const projectsNavigation = new navigation();
        projectsNavigation.start(projectsList);
        const items = d3.selectAll('#navigation ul li'),
              first = items.filter(":nth-child(1)");
        assert.isTrue(first.classed('is-active'), 'First element selected');
        function hash_baz() {
            window.removeEventListener("hashchange", hash_baz);
            assert.isFalse(first.classed('is-active'), 'First element unselected');
            const second = items.filter(":nth-child(2)");
            assert.isTrue(second.classed('is-active'), 'Second element selected');

            window.addEventListener("hashchange", () => {
                assert.isFalse(first.classed('is-active'), 'First element unselected');
                assert.isFalse(second.classed('is-active'), 'Second element unselected');
                done();
            });
            window.location.hash = "#NONEXISTENT";
        }
        window.addEventListener("hashchange", hash_baz);
        window.location.hash = "#BAZ";
    });

    it('Works with multiple navigations', (done) => {
        const { window, d3, navigation } = setupPage('<div id="projects"></div><div id="times"></div>', done);
        const projectsNavigation = new navigation({
            container: '#projects',
            prefix: 'project_'
        });
        projectsNavigation.start(projectsList);

        const timeNavigation = new navigation({
            container: '#times',
            prefix: 'time_'
        });
        timeNavigation.start(['month', 'week', 'day', 'hour']);

        const projects = d3.selectAll('#projects ul li'),
              times = d3.selectAll('#times ul li');
        var activeProject = 1;
        var activeTime = 1;
        var next = () => {};
        function updateNavigation(hash, project, time, chain) {
            activeProject = project;
            activeTime = time;
            next = chain;
            window.location.hash = hash;
        }
        function checkNavigation() {
            const hash = window.location.hash;
            assert.isTrue(projects.filter(`:nth-child(${activeProject})`).classed('is-active'), `Project selected for ${hash}: ${activeProject}`);
            assert.isTrue(times.filter(`:nth-child(${activeTime})`).classed('is-active'), `Time selected for ${hash}: ${activeTime}`);
            next();
        }

        window.addEventListener("hashchange", checkNavigation);
        checkNavigation();
        updateNavigation("#project_FOO", 3, 1, () => {
            updateNavigation("#time_week", 3, 2, () => {
                updateNavigation("#day", 3, 2, () => {
                    done();
                });
            });
        });
    });

    it('Works with multiple updates', (done) => {
        const { window, d3, navigation } = setupPage('<div id="projects"></div><div id="times"></div>', done);
        const projectsNavigation = new navigation({
            container: '#projects',
            prefix: 'project_'
        });
        projectsNavigation.start(projectsList);

        projectsNavigation.update(['BAR', 'DEF', 'FOO', 'QUX']);
        assert.equal(d3.selectAll('#projects ul li').size(), 4);

        projectsNavigation.update(['DEF', 'ZUR']);
        assert.equal(d3.selectAll('#projects ul li a').size(), 2);
        done();
    });

    it('Honors callback actions', (done) => {
        const { window, d3, navigation } = setupPage('<div id="navigation"></div>', done);
        window.location.hash = "#something_else";
        const projectsNavigation = new navigation({
            setCurrentItem: (item, hasItem) => {
                // Pretend we do something with the item, and since it does
                // not exist in the navigation we do not select any item, even
                // the first.
                return true;
            },
            addElement: (element) => {
                element.text(d => `Project ${d}`);
            },
            updateElement: (element) => {
                element.attr('target', '_blank');
            },
            removeElement: (element) => {
                element.style('background', 'red');
            }
        });
        projectsNavigation.start(projectsList);
        const items = d3.selectAll('#navigation ul li'),
              first = items.filter(":nth-child(1)");
        assert.isFalse(first.classed('is-active'), 'First element not selected');
        assert.equal(first.select('a').text(), 'Project BAR');
        assert.equal(first.select('a').attr('target'), '_blank');
        projectsNavigation.update([]);
        assert.equal(first.style('background'), 'red');
        done();
    });
});
