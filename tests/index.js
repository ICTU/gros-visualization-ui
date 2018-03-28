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
    const { locale, navbar, navigation, spinner } = dom.runVMScript(bundleScript);

    currentWindow = dom.window;

    return {
        window: dom.window,
        d3: d3window,
        locale, navbar, navigation, spinner
    };
}

afterEach(() => {
    // Close the window used in the test so that timers and scripts stop.
    if (currentWindow !== null) {
        currentWindow.close();
        currentWindow = null;
    }
});

describe('Locale', () => {
    it('Selects locales', (done) => {
        const specs = require('./locales.json');
        const { d3, locale } = setup('', done);
        const locales = new locale(specs);
        const extraSpecs = {
            en: {
                remote: "external"
            },
            nl: {
                remote: "extern"
            }
        };

        assert.equal(locales.specs, specs);
        assert.equal(locales.lang, "en");
        assert.equal(locales.selectedLocale, specs.en);

        assert.equal(locales.message("test"), "This is a test.");
        assert.equal(locales.message("format", [4, "foo"]),
                                     "We have 4 things of type 'foo'.");
        assert.equal(locales.message("missing", [1, 2]), "missing(1,2)");
        assert.equal(locales.message("missing", [3, 4], "Other"), "Other");
        assert.equal(locales.attribute("attribute", "x"), "one");
        assert.equal(locales.attribute("nothere", "temp"), "temp");
        assert.equal(locales.attribute("nothere", "y", "xyz"), "xyz");
        assert.equal(locales.retrieve(extraSpecs, "remote"), "external");
        assert.equal(locales.retrieve({en: "Yes", nl: "Ja"}), "Yes");
        assert.equal(locales.retrieve(extraSpecs, "other", "miss"), "miss");
        assert.equal(locales.get("prop"), "value");

        locales.select("nonexistent");
        assert.equal(locales.lang, "en");
        assert.equal(locales.selectedLocale, specs.en);

        locales.select("nl");
        assert.equal(locales.lang, "nl");
        assert.equal(locales.selectedLocale, specs.nl);

        assert.equal(locales.message("test"), "Dit is een test.");
        assert.equal(locales.message("format", [2, "bar"]),
                                     "We hebben 2 dingen van het type 'bar'.");
        assert.equal(locales.retrieve(extraSpecs, "remote"), "extern");
        assert.equal(locales.retrieve({en: "Yes", nl: "Ja"}), "Ja");
        assert.equal(locales.attribute("attribute", "x"), "een");
        assert.equal(locales.get("prop"), "waarde");

        done();
    });
    it('Generates navigation', (done) => {
        const specs = require('./locales.json');
        const { d3, locale } = setup('<div id="languages"></div>', done);
        const locales = new locale(specs, "nl");
        locales.generateNavigation("#languages");
        const items = d3.selectAll("#languages ul li");
        assert.equal(items.size(), 2);
        const first = items.filter(":nth-child(1)").select('a');
        assert.equal(first.attr('href'), '?en');
        assert.equal(first.attr('hreflang'), 'en');
        assert.equal(first.text(), 'English');
        assert.isFalse(items.filter(":nth-child(1)").classed("is-active"));
        const second = items.filter(":nth-child(2)").select('a');
        assert.equal(second.attr('href'), '?nl');
        assert.equal(second.attr('hreflang'), 'nl');
        assert.equal(second.text(), 'Nederlands');
        assert.isTrue(items.filter(":nth-child(2)").classed("is-active"));
        done();
    });
    it('Replaces messages', (done) => {
        const specs = require('./locales.json');
        const { window, d3, locale } = setup('<p data-message="test"></p><div data-message="replace"><span class="count" data-message-title="number">5</span> <span data-message="owner">UUU</span></div>', done);
        const locales = new locale(specs, "en");
        locales.updateMessages(d3, ['title']);
        assert.equal(d3.select("p").text(), "This is a test.");
        assert.equal(d3.select("div").html(), `There are <span class="count" data-message-title="number" title="Count">5</span> pens on the table, owned by <span data-message="owner">the owner</span>.`);
        done();
    });
});

describe('Navigation bar', () => {
    it('Builds navigation', (done) => {
        const specs = require('./locales.json');
        const structure = require('./navbar.json');
        const { d3, locale, navbar } = setup('<div id="navbar"></div>', done);
        const locales = new locale(specs);
        const config = {
            "container": "#navbar",
            "languages": "#languages",
            "language_page": "index.html",
            "language_query": "x=y&l",
            "my_url": "http://localhost"
        };
        const nav = new navbar(config, locales);
        const elm = d3.select('#navbar');
        nav.fill(structure);
        const brand = elm.select('.navbar-brand');
        const logo = brand.select('a.navbar-item');
        assert.equal(logo.attr('href'), 'http://localhost');
        assert.equal(logo.attr('title'), 'Page');
        const img = logo.select('img');
        assert.equal(img.attr('src'), 'logo.svg');
        assert.equal(img.attr('alt'), 'Brand');
        assert.equal(img.attr('width'), '28');
        assert.equal(img.attr('height'), '28');

        const burger = brand.select('.navbar-burger');
        assert.equal(burger.attr('data-target'), 'menu-content');
        assert.equal(burger.selectAll('span').size(), 3);

        const fullscreen = brand.select('.navbar-fullscreen');
        assert.equal(fullscreen.attr('title'), 'Full screen');
        assert.equal(fullscreen.select('.icon i').attr('class'), 'fas fa-arrows-alt');

        const menu = elm.select('.navbar-menu');
        assert.equal(menu.attr('id'), 'menu-content');
        const item = menu.select('.navbar-start .navbar-item');
        const link = item.select('.navbar-link');
        assert.equal(link.attr('href'), 'http://localhost/content?prop=value&message=Message content');
        assert.equal(link.text().trim(), 'Contents');
        const items = item.selectAll('.navbar-dropdown a.navbar-item');
        assert.equal(items.size(), 2);
        assert.equal(items.filter(':first-child').attr('href'), 'one');
        assert.equal(items.filter(':first-child').text().trim(), 'One');
        assert.equal(items.filter(':first-child').select('.icon i').attr('class'), 'fas fa-align-center');

        assert.equal(items.filter(':last-child').attr('href'), 'two');
        assert.equal(items.filter(':last-child').text().trim(), 'Two');
        assert.equal(items.filter(':last-child').select('.icon i').attr('class'), 'far fa-circle');
        const divider = item.select('.navbar-dropdown hr');
        assert.isTrue(divider.classed('navbar-divider'));

        const languages = menu.select('.navbar-end > .navbar-item.has-dropdown');
        const back = languages.select('.navbar-link');
        assert.equal(back.attr('href'), '/');
        assert.equal(back.attr('title'), 'Return to default language');
        const langs = languages.selectAll('#languages > ul > li');
        assert.equal(langs.size(), 2);
        const active = langs.select('a.is-active');
        assert.equal(active.attr('href'), 'index.html?x=y&l=en');
        assert.equal(active.attr('hreflang'), 'en');
        assert.equal(active.text(), 'English');
        const inactive = langs.select('a:not(.is-active)');
        assert.equal(inactive.attr('href'), 'index.html?x=y&l=nl');
        assert.equal(inactive.attr('hreflang'), 'nl');
        assert.equal(inactive.text(), 'Nederlands');
        const end = menu.select('.navbar-end > a.navbar-item');
        assert.equal(end.attr('href'), 'https://example.com');
        assert.equal(end.attr('title'), 'Example');
        const example = end.select('img');
        assert.equal(example.attr('src'), 'http://localhost/example-en.svg');
        assert.equal(example.attr('width'), '50');
        assert.equal(example.attr('height'), '24');

        done();
    });
    it('Ignores invalid types', (done) => {
        const specs = require('./locales.json');
        const structure = [{"type": "invalid"}];
        const { d3, locale, navbar } = setup('<div id="navbar"></div>', done);
        const locales = new locale(specs);
        const config = {
            "container": "#navbar"
        };
        const nav = new navbar(config, locales);
        const elm = d3.select('#navbar');
        nav.fill(structure);

        done();
    });
    it('Dispatches burger events', (done) => {
        const specs = require('./locales.json');
        const structure = require('./navbar.json');
        const { d3, locale, navbar } = setup('<div id="navbar"></div>', done);
        const locales = new locale(specs);
        const config = {
            "container": "#navbar",
            "languages": "#languages",
        };
        const nav = new navbar(config, locales);
        const elm = d3.select('#navbar');
        nav.fill(structure);
        const burger = elm.select('.navbar-burger');

        burger.on('click.test', () => {
            assert.isTrue(burger.classed('is-active'));
            assert.isTrue(elm.select('#menu-content').classed('is-active'));
            done();
        });
        burger.dispatch('click');
    });
    it('Dispatches fullscreen events', (done) => {
        const specs = require('./locales.json');
        const structure = require('./navbar.json');
        const { d3, locale, navbar } = setup('<div id="navbar"></div>', done);
        const locales = new locale(specs);
        const config = {
            "container": "#navbar",
            "languages": "#languages",
        };
        const nav = new navbar(config, locales);
        const elm = d3.select('#navbar');
        nav.fill(structure);
        const fullscreen = elm.select('.navbar-fullscreen');

        elm.on('fullscreen', () => {
            assert.isTrue(fullscreen.classed('is-active'));
            done();
        });
        fullscreen.dispatch('click');
        nav.setFullscreen(true);
    });
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

    it('Works with multiple navigations', (done) => {
        const { window, d3, navigation } = setup('<div id="projects"></div><div id="times"></div>', done);
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

    it('Honors callback actions', (done) => {
        const { window, d3, navigation } = setup('<div id="navigation"></div>', done);
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
            }
        });
        projectsNavigation.start(projectsList);
        const items = d3.selectAll('#navigation ul li'),
              first = items.filter(":nth-child(1)");
        assert.isFalse(first.classed('is-active'), 'First element not selected');
        assert.equal(first.select('a').text(), 'Project BAR');
        done();
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
    it('Creates at most one spinner', (done) => {
        const { window, d3, spinner } = setup('<div id="loader_container"></div>', done);
        const loadingSpinner = new spinner();
        loadingSpinner.start();
        loadingSpinner.start();
        assert.equal(d3.selectAll("svg#loader").size(), 1);
        loadingSpinner.stop();
        assert.isTrue(d3.select("svg#loader").empty(), 'Spinner is removed');
        done();
    });
});
