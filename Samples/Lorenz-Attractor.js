'use strict';

class LorenzAttractor {
    constructor(sigma, rho, beta) {
        this.DE = new DifferentialEquation(3, 1);
        this.DE.setGoverningEquationForNthDimension(0, (t, x) => this.#dx(t, x));
        this.DE.setGoverningEquationForNthDimension(1, (t, x) => this.#dy(t, x));
        this.DE.setGoverningEquationForNthDimension(2, (t, x) => this.#dz(t, x));
        this.sigma = +sigma;
        this.rho = +rho;
        this.beta = +beta;
    }
    setInitialConditions(x0, y0, z0) {
        this.DE.setInitialConditionsForNthDimension(0, [x0]);
        this.DE.setInitialConditionsForNthDimension(1, [y0]);
        this.DE.setInitialConditionsForNthDimension(2, [z0]);
    }
    solve(t0, dt, tf) {
        this.DE.solve(t0, dt, tf);
    }
    getResult() {
        return {
            't': this.DE.getTime(),
            'x': this.DE.getData(0, 0),
            'y': this.DE.getData(1, 0),
            'z': this.DE.getData(2, 0),
        };
    }
    #dx(t, x) {
        return this.sigma * (x[2] - x[0]);
    }
    #dy(t, x) {
        return x[0] * (this.rho - x[4]) - x[2];
    }
    #dz(t, x) {
        return (x[0] * x[2] - this.beta * x[4]);
    }
}