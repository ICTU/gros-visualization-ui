/*
Loading spinner UI fragment.

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
    container: "#loader_container",
    id: 'loader',
    width: 960,
    height: 500,
    startAngle: 0,
    duration: 1500
};

class Spinner {
    // Create a new spinner instance with the given configuration
    constructor(configuration = {}) {
        this.config = Object.assign({}, defaultConfiguration, configuration);
    }

    // Update the configuration, which only takes effect on the next start
    update(configuration) {
        this.config = Object.assign({}, this.config, configuration);
    }

    // Start the loading spinner
    start() {
        // Do not add multiple spinners with the same ID
        if (!d3.select(`svg#${this.config.id}`).empty()) {
            return;
        }

        var radius = Math.min(this.config.width, this.config.height) / 2;
        const tau = 2 * Math.PI;

        var innerArc = d3.arc()
            .innerRadius(radius * 0.5)
            .outerRadius(radius * 0.7)
            .startAngle(0)
            .endAngle(0.33 * tau);
        var outerArc = d3.arc()
            .innerRadius(radius * 0.7)
            .outerRadius(radius * 0.9)
            .startAngle(0)
            .endAngle(0.33 * tau);

        var group = d3.select(this.config.container).append("svg")
            .attr("id", this.config.id)
            .classed("gros-spinner", true)
            .attr("width", this.config.width)
            .attr("height", this.config.height)
            .append("g")
            .attr("transform", `translate(${this.config.width / 2}, ${this.config.height / 2})`)
            .append("g")
            .style("transform", `rotate(${this.config.startAngle}deg)`)
            .style("animation", `${this.config.duration}ms linear infinite gros-spinner`);

        group.append("path")
            .classed("outer", true)
            .attr("d", outerArc);
        group.append("path")
            .classed("inner", true)
            .attr("d", innerArc);
    }

    // Hide the loading spinner
    stop() {
        d3.select(this.config.container)
            .select(`svg#${this.config.id}`)
            .remove();
    }
}

export default Spinner;
