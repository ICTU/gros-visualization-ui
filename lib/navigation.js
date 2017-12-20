/*
Project navigation UI fragment.

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
    window: window,
    location: location,
    container: "#navigation",
    setCurrentProject: (project, hasProject) => {}
};

class navigation {
    // Create a new project navigation with the given configuration
    constructor(configuration = {}) {
        this.config = Object.assign({}, defaultConfiguration, configuration);
        this.currentProject = null;
    }

    // Create the navigation list
    start(projects) {
        d3.select(this.config.container).append('ul');
        this.update(projects);

        const hash = this.config.location.hash.substring(1);
        this.setCurrentProject(hash === "" ? projects[0] : hash);
        d3.select(this.config.window).on("hashchange", () => {
            this.setCurrentProject(this.config.location.hash.substring(1));
        });
    }

    update(projects) {
        d3.select(this.config.container + ' ul').selectAll('li')
            .data(projects)
            .enter()
            .append('li')
            .classed('is-active', d => d === this.currentProject)
            .append('a')
            .text(d => d)
            .attr('href', (project) => `#${project}`);
    }

    setCurrentProject(project) {
        this.currentProject = project;

        const container = d3.select(this.config.container);
        container.selectAll('ul li')
            .classed('is-active', d => d === project);

        const hasProject = !container.select('ul li.is-active').empty();

        this.config.setCurrentProject(project, hasProject);
    }
}

export default navigation;
