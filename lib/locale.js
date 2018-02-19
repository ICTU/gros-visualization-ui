/*
Locale selection.

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

import * as d3 from 'd3';
import {vsprintf} from 'sprintf-js';

class locale {
    constructor(specs = {}, lang="en") {
        this.specs = specs;
        this.selectedLocale = specs[lang];
    }

    // Update the selected locale if a language specification exists for it.
    select(lang) {
        if (lang in this.specs) {
            this.selectedLocale = this.specs[lang];
        }
        return this.selectedLocale;
    }

    // Retrieve the D3 locale based on the locale attributes.
    locale() {
        return d3.formatLocale(this.selectedLocale);
    }

    // Retrieve a message and replace placehodlers with arguments in it.
    message(msg, args) {
        var result = this.selectedLocale.messages && this.selectedLocale.messages[msg];
        if (result) {
            result = vsprintf(result, args);
        }
        return result;
    }

    // Retrieve the value in a locale attribute by its key, or the key if the
    // attribute or key cannot be located.
    attribute(name, key) {
        return (this.selectedLocale[name] && this.selectedLocale[name][key]) ||
            key;
    }

    // Retrieve an attribute value.
    get(name) {
        return this.selectedLocale[name];
    }

    // Create a navigation element. The page is the base URL to link to and the
    // query is the query string key to provide the language to.
    generateNavigation(nav, page='', query='') {
        if (!(nav instanceof d3.selection)) {
            nav = d3.select(nav);
        }
        const item = nav.append('ul')
            .selectAll('li')
            .data(Object.keys(this.specs))
            .enter()
            .append('li');
        item.append('a')
            .attr('href', d => page + '?' + (query ? query + '=' : '') + d)
            .attr('hreflang', d => d)
            .text(d => this.specs[d].language);
        item.classed('is-active', d => this.specs[d] == this.selectedLocale);
    }

    // Replace all elements within the selection or the entire document with
    // a data-message attribute with their respective message, using children
    // elements as arguments to the message.
    updateMessages(selection=undefined) {
        var locale = this;
        if (selection === undefined) {
            selection = d3.selection();
        }
        selection.selectAll("[data-message]").each(function() {
            const msg = this.getAttribute("data-message");
            const children = Array.from(this.children).map((c) => c.outerHTML);
            const replacement = locale.message(msg, children);
            if (replacement) {
                d3.select(this).html(replacement);
            }
        });
    }
}

export default locale;
