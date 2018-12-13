/*
Item navigation UI fragment.

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

import * as d3 from 'd3';

const defaultConfiguration = {
    window: window,
    location: location,
    container: "#navigation",
    prefix: "",
    setCurrentItem: (item, hasItem) => hasItem,
    isActive: (key, currentItem, d) => key === currentItem,
    key: (item) => item,
    addElement: (element) => {
        element.text(d => d);
    },
    updateElement: (element) => {},
    removeElement: (element) => { element.remove(); }
};

class Navigation {
    // Create a new navigation with the given configuration
    constructor(configuration = {}) {
        this.config = Object.assign({}, defaultConfiguration, configuration);
        this.currentItem = null;
    }

    checkHash(hash) {
        if (hash.startsWith(`#${this.config.prefix}`)) {
            return this.setCurrentItem(hash.substring(this.config.prefix.length + 1));
        }
        return false;
    }

    // Create the navigation list
    start(items) {
        d3.select(this.config.container).append('ul');
        this.update(items);

        if (!this.checkHash(this.config.location.hash) && items.length !== 0) {
            this.setCurrentItem(this.config.key(items[0]));
        }

        // Use event listeners rather than d3 for jsdom compatibility
        this.config.window.addEventListener("hashchange", () => {
            this.checkHash(this.config.location.hash);
        });
    }

    update(items) {
        const list = d3.select(this.config.container + ' ul')
            .selectAll('li')
            .data(items, this.config.key)
            .call(this.config.updateElement);
        list.exit().call(this.config.removeElement);
        list.enter()
            .append('li')
            .classed('is-active',
                d => this.config.isActive(this.config.key(d), this.currentItem, d)
            )
            .append('a')
            .attr('href', (item) => `#${this.config.prefix}${this.config.key(item)}`)
            .call(this.config.addElement);
    }

    setCurrentItem(item) {
        this.currentItem = item;

        const container = d3.select(this.config.container);
        const list = container.selectAll('ul li')
            .classed('is-active',
                d => this.config.isActive(this.config.key(d), item, d)
            );

        const hasItem = this.config.setCurrentItem(item,
            !container.select('ul li.is-active').empty()
        );
        if (hasItem) {
            list.call(this.config.updateElement);
        }
        return hasItem;
    }
}

export default Navigation;
