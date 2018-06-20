/*
Unit tests for the visualization locale fragment.

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

describe('Locale', () => {
    it('Selects locales', (done) => {
        const specs = require('./locales.json');
        const { d3, locale } = setupPage('', done);
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

        assert.equal(locales.locale().format(",.4f")(1234.5678), "1,234.5678");

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

        assert.equal(locales.locale().format(",.4f")(1234.5678), "1.234,5678");

        done();
    });
    it('Generates navigation', (done) => {
        const specs = require('./locales.json');
        const { d3, locale } = setupPage('<div id="languages"></div>', done);
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
        const { window, d3, locale } = setupPage('<p data-message="test"></p><div data-message="replace"><span class="count" data-message-title="number">5</span> <span data-message="owner">UUU</span></div>', done);
        const locales = new locale(specs, "en");
        locales.updateMessages(d3, ['title']);
        assert.equal(d3.select("p").text(), "This is a test.");
        assert.equal(d3.select("div").html(), `There are <span class="count" data-message-title="number" title="Count">5</span> pens on the table, owned by <span data-message="owner">the owner</span>.`);
        done();
    });
});
