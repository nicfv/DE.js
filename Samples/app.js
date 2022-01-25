'use strict';

window.onload = () => {
    const msd = new MassSpringDamper(5.0, 1.2, 10.0);
    msd.setInitialConditions(0.0, 0.0);
    msd.setForcingFunction((t) => Math.sign(Math.cos(0.25 * t)));
    msd.simulate(0, 0.001, 60.0);

    const graph = new SimpleGraph(document.body, 100, 100, 1600, 800);
    graph.addSeries('Response', msd.getResult().t, msd.getResult().x, 'blue', 2);
    graph.addSeries('Forcing', msd.getResult().t, msd.getResult().f, 'red', 2);
    graph.setGraphLimits(-1, 60, -3, 3);
    graph.animate(0.02, 50);

    const la = new LorenzAttractor(10, 28, 8 / 3);
    la.setInitialConditions(0.1, 0.0, 0.01);
    la.solve(0, 0.001, 60);

    const la2 = new LorenzAttractor(10, 28, 8 / 3);
    la2.setInitialConditions(0.1, 0.0, 0.0);
    la2.solve(0, 0.001, 60);

    const graph2 = new SimpleGraph(document.body, 1000, 100, 1600, 800);
    graph2.addSeries('Butterfly (x=0.1, z=0.01)', la.getResult().x, la.getResult().z, 'orange', 2);
    graph2.addSeries('Butterfly (x=0.1, z=0.0)', la2.getResult().x, la2.getResult().z, 'green', 2);
    graph2.setGraphLimits(-40, 40, -10, 60);
    graph2.animate(0.01, 10);
};