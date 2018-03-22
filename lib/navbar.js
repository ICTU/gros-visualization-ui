/*
Navigation heading fragment.

Copyright 2018 ICTU

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
import _ from 'lodash';
import mustache from 'mustache';

const defaultConfiguration = {
    container: "nav",
    languages: "",
    language_page: "",
    language_query: "lang"
};
const html = (data) => {
    return data !== undefined ? mustache.escape(data) : '';
};
class navbar {
    constructor(configuration, locales) {
        this.config = Object.assign({}, defaultConfiguration, configuration);
        this.locales = locales;
        this.types = {
            "brand": (item) => `
                <div class="navbar-brand">
                    ${this.build(item.items)}
                </div>`,
            "link": (item) => `
                <a class="navbar-${item.class || "item"}"
                    href="${html(this.link(item.url))}"
                    title="${html(this.locale(item.title))}">
                    ${this.icon(item.icon)}
                    ${this.build(item.content)}
                </a>`,
            "image": (item) => `
                <img src="${html(item.url)}" alt="${html(this.locale(item.alt))}"
                    width="${html(item.width)}" height="${html(item.height)}"
                    style="${html(item.style)}">`,
            "text": (item) => `${html(this.locale(item.text))}`,
            "burger": (item) => `
                <div class="navbar-burger" data-target="${html(item.target)}">
                    ${"<span></span>".repeat(item.lines)}
                </div>`,
            "menu": (item) => `
                <div class="navbar-menu" id="${html(item.id)}">
                    ${this.build(item.items)}
                </div>`,
            "start": (item) => `
                <div class="navbar-start">
                    ${this.build(item.items)}
                </div>`,
            "end": (item) => `
                <div class="navbar-end">
                    ${this.build(item.items)}
                </div>`,
            "dropdown": (item) => `
                <div class="navbar-item has-dropdown is-hoverable">
                    ${this.build([_.assign({"type": "link", "class": "link"}, item.link)])}
                    <div class="navbar-dropdown is-boxed" ${item.id !== undefined ? `id="${html(item.id)}"` : ''}>
                        ${this.build(item.items)}
                    </div>
                </div>`,
            "divider": (item) => `<hr class="navbar-divider">`
        };
    }

    locale(data) {
        if (typeof data === "string" || data === undefined) {
            return data;
        }
        return this.locales.retrieve(data, null, data.en);
    }

    link(data) {
        if (typeof data === "object") {
            return this.config[data.config];
        }
        return data;
    }

    icon(data) {
        if (data === undefined) {
            return '';
        }
        return `<span class="icon">
            <i class="${data[0]} fa-${data[1]}" aria-hidden="true"></i>
        </span>`;
    }

    build(structure) {
        if (typeof structure === "object" && !Array.isArray(structure)) {
            return html(this.locale(structure));
        }
        const nav = this;
        return _.map(structure, (item) => {
            return (nav.types[item.type] || ((item) => {
                console.log(`Invalid type: ${item.type}\n${item}`);
                return '';
            }))(item);
        }).join('\n');
    }

    fill(structure) {
        const selection = d3.select(this.config.container);
        selection.html(this.build(structure));

        if (this.config.languages) {
            const languages = selection.select(this.config.languages);
            this.locales.generateNavigation(languages,
                this.config.language_page, this.config.language_query, 'link'
            );
            languages.selectAll('a').classed('navbar-item', true);
        }
    }
}

export default navbar;
