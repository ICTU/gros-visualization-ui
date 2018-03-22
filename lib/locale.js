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
        this.lang = lang;
        this.selectedLocale = specs[lang];
    }

    // Update the selected locale if a language specification exists for it.
    select(lang) {
        if (lang in this.specs) {
            this.lang = lang;
            this.selectedLocale = this.specs[lang];
        }
        return this.selectedLocale;
    }

    // Retrieve the D3 locale based on the locale attributes.
    locale() {
        return d3.formatLocale(this.selectedLocale);
    }

    // Retrieve a message and replace placehodlers with a list of arguments in
    // the message string. If the message cannot be located, then either the
    // fallback or a description of the message and its arguments is returned.
    message(msg, args, fallback=undefined) {
        if ("messages" in this.selectedLocale && msg in this.selectedLocale.messages) {
            return vsprintf(this.selectedLocale.messages[msg], args);
        }
        return fallback !== undefined ? fallback :
            (args && args.length ? `${msg}(${args.join(",")})` : msg);
    }

    // Retrieve the value in a locale attribute by its key, or the fallback or
    // key if the attribute or key cannot be located.
    attribute(name, key, fallback=undefined) {
        if (name in this.selectedLocale && key in this.selectedLocale[name]) {
            return this.selectedLocale[name][key];
        }
        return fallback !== undefined ? fallback : key;
    }

    // Retrieve the value in an external locale specification, an object of
    // objects or an object of strings where the outer object's keys are
    // language codes, by its key or the value itself. If the locale or key
    // cannot be located, then the fallback or key is returned.
    retrieve(specs, key=null, fallback=undefined) {
        var result = specs[this.lang];
        if (result !== undefined && key !== null) {
            result = specs[this.lang][key];
        }
        return result !== undefined ? result :
            (fallback !== undefined ? fallback : key);
    }

    // Retrieve an attribute value.
    get(name) {
        return this.selectedLocale[name];
    }

    // Create a navigation element. The page is the base URL to link to and the
    // query is the query string to append the language to. The query string
    // may have other parameters as long as the final part is the query string
    // key (which may be empty) without the key-value separator.
    generateNavigation(nav, page='', query='', linkActive=false) {
        if (!(nav instanceof d3.selection)) {
            nav = d3.select(nav);
        }
        const item = nav.append('ul')
            .selectAll('li')
            .data(Object.keys(this.specs))
            .enter()
            .append('li');
        const link = item.append('a')
            .attr('href', d => page + '?' + (query ? query + '=' : '') + d)
            .attr('hreflang', d => d)
            .text(d => this.specs[d].language);
        const active = linkActive === 'link' ? link : item;
        active.classed('is-active', d => this.specs[d] == this.selectedLocale);
    }

    // Replace all elements within the selection or the entire document with
    // a data-message attribute with their respective message, using children
    // elements as arguments to the message.
    updateMessages(selection=undefined, attributes=[]) {
        var locale = this;
        if (selection === undefined) {
            selection = d3.selection();
        }
        selection.selectAll("[data-message]").each(function() {
            if (!selection.node().contains(this)) {
                return;
            }
            const msg = this.getAttribute("data-message");
            const children = Array.from(this.children).map((c) => c.outerHTML);
            const replacement = locale.message(msg, children);
            if (replacement) {
                locale.updateMessages(d3.select(this).html(replacement), attributes);
            }
        });
        attributes.forEach((attribute) => {
            selection.selectAll(`[data-message-${attribute}]`).each(function() {
                const msg = this.getAttribute(`data-message-${attribute}`);
                const replacement = locale.message(msg);
                if (replacement) {
                    d3.select(this).attr(attribute, replacement);
                }
            });
        });
    }
}

export default locale;
