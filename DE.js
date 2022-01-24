'use strict';

/**
 * Initialize, define, and solve any type of ordinary differential equation.
 */
class DifferentialEquation {
    /**
     * Initialize a new differential equation for any order and number of dimensions.
     */
    constructor(dimensions, order) {
        this.dimensions = +dimensions;
        this.dims = [];
        this.governingEquations = [];
        this.time = [];
        for (let i = 0; i < dimensions; i++) {
            this.dims[i] = new DifferentialEquationDimension(order);
        }
    }
    /**
     * Set the `order-1` initial conditions for dimension `n` of this differential equation.
     */
    setInitialConditionsForNthDimension(n, initialConditions) {
        if (n >= 0 && n < this.dimensions) {
            this.dims[n].setInitialConditions(initialConditions);
        } else {
            throw 'Dimension ' + n + ' does not exist.';
        }
    }
    /**
     * Set the governing equation for dimension `n` of this differential equation.
     * The function `f` should accept two parameters `f(t, x)` and return the highest order derivative in dimension `n`.
     * The first parameter `t` is the scalar time variable, and the second parameter `x` should be an array of values in the following format:
     * `x, dx, ddx, ... y, dy, ddy, ...`
     */
    setGoverningEquationForNthDimension(n, f) {
        if (typeof f === 'function' && n >= 0 && n < this.dimensions && !this.governingEquations[n]) {
            this.governingEquations[n] = f;
        } else {
            throw 'Failed to set governing equation ' + f + ' for dimension ' + n;
        }
    }
    /**
     * Return a parameter array to use for governing equations. Parameter format:
     * `x, dx, ddx, ... y, dy, ddy, ...`
     */
    #getGoverningEquationParameters() {
        let parameters = [];
        for (let i = 0; i < this.dimensions; i++) {
            parameters.push(this.dims[i].getAllDerivativesForLatestTimeStep());
        }
        return parameters.flat();
    }
    /**
     * Validate governing equations and initial parameters before solving.
     */
    #validate() {
        let f, x;
        for (let i = 0; i < this.dimensions; i++) {
            if (typeof this.dims[i].getNthDerivative(0)[0] !== 'number') {
                throw 'Initial conditions not set for dimension ' + i;
            }
            f = this.governingEquations[i];
            if (typeof f !== 'function') {
                throw 'There is no governing equation for dimension ' + i;
            }
            x = this.#getGoverningEquationParameters();
            if (typeof f(0, x) !== 'number') {
                throw 'The governing equation for dimension ' + i + ' does not return a number.';
            }
        }
        return true;
    }
    /**
     * Solve the differential equation from `t0` to `tf` with timestep `dt`
     */
    solve(t0, dt, tf) {
        if (!this.#validate()) { return; }
        // Set highest order derivatives based on initial conditions
        let x = this.#getGoverningEquationParameters();
        for (let i = 0; i < this.dimensions; i++) {
            const f = this.governingEquations[i];
            this.dims[i].setHighestOrderDerivative(f(t0, x));
        }
        this.time.push(t0);
        // Step through time and solve each timestep
        for (let t = t0 + dt; t <= tf; t += dt) {
            x = this.#getGoverningEquationParameters();
            for (let i = 0; i < this.dimensions; i++) {
                const f = this.governingEquations[i];
                this.dims[i].solve(dt);
                this.dims[i].setHighestOrderDerivative(f(t, x));
            }
            this.time.push(t);
        }
    }
    /**
     * Returns data for all time from a specific dimension and order.
     */
    getData(dimension, order) {
        return this.dims[+dimension].getNthDerivative(+order);
    }
    /**
     * Return the time array from the solution of this differential equation.
     */
    getTime() {
        return this.time;
    }
    /**
     * Clears computed data.
     */
    clearData() {
        this.time = [];
        for (let i = 0; i < this.dimensions; i++) {
            this.dims[i].clear();
        }
    }
}

/**
 * Represents a single time-dependent dimension in a differential equation.
 */
class DifferentialEquationDimension {
    /**
     * Initialize a new dimension in a differential equations with `order` time derivatives.
     */
    constructor(order) {
        this.order = +order;
        this.clear();
    }
    /**
     * Set the initial conditions of all lower order derivatives starting with the 0th derivative using the values in `initialConditions`
     */
    setInitialConditions(initialConditions) {
        if (Array.isArray(initialConditions) && initialConditions.length === this.order) {
            for (let i = 0; i <= this.order - 1; i++) {
                this.data[i][0] = initialConditions[i];
            }
        } else {
            throw 'Incorrect number or type of initial conditions. Expected an array of ' + this.order + 'numbers. Found:\n' + JSON.stringify(initialConditions, null, 2);
        }
    }
    /**
     * Solve all lower order derivatives after some timestep `dt`
     */
    solve(dt) {
        const step = this.#getCurrentTimeStepIndex();
        for (let i = 0; i <= this.order - 1; i++) {
            this.data[i][step] = this.data[i][step - 1];
            for (let j = i + 1; j <= this.order; j++) {
                this.data[i][step] += (dt ** (j - i)) * this.data[j][step - 1] / this.#factorial(j - i);
            }
        }
    }
    /**
     * Set the highest order derivative at the latest timestep to `value`
     */
    setHighestOrderDerivative(value) {
        const step = this.#getCurrentTimeStepIndex();
        this.data[this.order][step] = value;
    }
    /**
     * Returns the index of the latest timestep calculated.
     */
    #getCurrentTimeStepIndex() {
        return this.data[this.order].length;
    }
    /**
     * Calculates the factorial of the integer `n`
     */
    #factorial(n) {
        if (n < 2) {
            return 1;
        } else {
            return n * this.#factorial(n - 1);
        }
    }
    /**
     * Return an array of values for all time for derivative `n` of this dimension.
     */
    getNthDerivative(n) {
        return this.data[n];
    }
    /**
     * Return an array of values for all derivates of this dimension in increasing order for the latest computed timestep.
     */
    getAllDerivativesForLatestTimeStep() {
        const step = Math.max(this.#getCurrentTimeStepIndex() - 1, 0);
        return this.data.map(x => x[step]);
    }
    /**
     * Clear all data in this dimension.
     */
    clear() {
        this.data = [];
        for (let i = 0; i <= this.order; i++) {
            this.data[i] = [];
        }
    }
}