/*
Loading spinner UI fragment.

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

const defaultConfiguration = {
    container: "#loader_container",
    id: 'loader',
    width: 960,
    height: 500,
    startAngle: 0,
    duration: 1500
};

class spinner {
    // Create a new spinner instance with the given configuration
    constructor(configuration = {}) {
        this.config = Object.assign({}, defaultConfiguration, configuration);
    }

    // Start the loading spinner
    start() {
        // Do not add multiple spinners with the same ID
        if (!d3.select(`svg#${this.config.id}`).empty()) {
            return;
        }

        const spin = (selection) => {
            if (d3.select(`svg#${this.config.id}`).empty()) {
                return;
            }

            selection.transition()
                .ease(d3.easeLinear)
                .duration(this.config.duration)
                .attrTween("transform", () => {
                    return d3.interpolateString(`rotate(${this.config.startAngle})`, `rotate(${this.config.startAngle - 360})`);
                });

            setTimeout(() => { spin(selection); }, this.config.duration);
        };

        var radius = Math.min(this.config.width, this.config.height) / 2;
        const tau = 2 * Math.PI;

        var innerArc = d3.arc()
            .innerRadius(radius * 0.5)
            .outerRadius(radius * 0.7)
            .startAngle(0);
        var outerArc = d3.arc()
            .innerRadius(radius * 0.7)
            .outerRadius(radius * 0.9)
            .startAngle(0);

        var group = d3.select(this.config.container).append("svg")
            .attr("id", this.config.id)
            .attr("width", this.config.width)
            .attr("height", this.config.height)
            .append("g")
            .attr("transform", `translate(${this.config.width / 2}, ${this.config.height / 2})`)
            .append("g")
            .call(spin);

        group.append("path")
            .datum({ endAngle: 0.33 * tau })
            .style("fill", "#B400C8")
            .attr("d", outerArc);
        group.append("path")
            .datum({ endAngle: 0.33 * tau })
            .style("fill", "#507AFF")
            .attr("d", innerArc);
    }

    // Hide the loading spinner
    stop() {
        d3.select(this.config.container).select('svg#' + this.config.id).remove();
    }
}

export default spinner;
