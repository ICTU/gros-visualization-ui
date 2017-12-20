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

        const hasProject = !d3.select(this.config.container)
            .selectAll('ul li')
            .filter(d => d === project)
            .classed('is-active', true)
            .empty();

        this.config.setCurrentProject(project, hasProject);
    }
}

export default navigation;
