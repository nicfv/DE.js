'use strict';

class MassSpringDamper {
    constructor(m, b, k) {
        this.m = m;
        this.b = b;
        this.k = k;
        this.DE = new DifferentialEquation(1, 2);
        this.f = (t) => 0;
        this.forcingFunction = [];
        this.DE.setGoverningEquationForNthDimension(0, (t, x) => this.ddx(t, x));
    }

    ddx(t, x) {
        return (-this.b * x[1] - this.k * x[0] + this.f(t)) / this.m;
    }

    setForcingFunction(f) {
        if (typeof f === 'function') {
            this.f = f;
        }
    }

    setInitialConditions(x0, dx0) {
        this.DE.setInitialConditionsForNthDimension(0, [x0, dx0]);
    }

    simulate(t0, dt, tf) {
        this.DE.solve(+t0, +dt, +tf);
        for (let t = t0; t < tf; t += dt) {
            this.forcingFunction.push(this.f(t));
        }
    }

    getResult() {
        return { 't': this.DE.getTime(), 'x': this.DE.getData(0, 0), 'f': this.forcingFunction };
    }
}