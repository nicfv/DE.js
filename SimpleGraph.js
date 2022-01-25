'use strict';

class SimpleGraph {
    constructor(parent, x, y, w, h) {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.style.position = 'absolute';
        this.canvas.style.border = '1px solid #ddd';
        this.canvas.style.boxShadow = '0 0 4px 0 #ddd';
        this.canvas.style.borderRadius = '4px';
        this.canvas.style.outline = 'none';
        this.setPosition(x, y);
        this.setSize(w, h);
        parent.appendChild(this.canvas);
        this.data = {};
        this.xMin = -1;
        this.xMax = 1;
        this.yMin = -1;
        this.yMax = 1;
        this.#draw();
    }
    #normalize(x, min, max) {
        return (x - min) / (max - min);
    }
    #expand(x, min, max) {
        return x * (max - min) + min;
    }
    #translate(x, min1, max1, min2, max2) {
        return this.#expand(this.#normalize(x, min1, max1), min2, max2);
    }
    #translatePoint(x, y) {
        return {
            'x': this.#translate(x, this.xMin, this.xMax, 0, this.canvas.width),
            'y': this.#translate(y, this.yMin, this.yMax, this.canvas.height, 0),
        }
    }
    setPosition(x, y) {
        this.canvas.style.top = +x + 'px';
        this.canvas.style.left = +y + 'px';
        this.#draw();
    }
    setSize(w, h) {
        this.canvas.style.width = +w + 'px';
        this.canvas.style.height = +h + 'px';
        this.canvas.width = +w;
        this.canvas.height = +h;
        this.#draw();
    }
    setGraphLimits(xMin, xMax, yMin, yMax) {
        this.xMin = xMin;
        this.xMax = xMax;
        this.yMin = yMin;
        this.yMax = yMax;
        this.#draw();
    }
    graphLine(series, x, y, color, weight) {
        this.data[series] = {};
        this.data[series]['type'] = 'line';
        this.data[series]['color'] = color;
        this.data[series]['weight'] = weight;
        this.data[series]['x'] = x;
        this.data[series]['y'] = y;
        this.#draw();
    }
    clearSeries(series) {
        delete this.data[series];
        this.#draw();
    }
    clearAll() {
        this.data = {};
        this.#draw();
    }
    #draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        let pt, y = 0;
        for (let key in this.data) {
            this.ctx.fillStyle = this.data[key].color;
            this.ctx.strokeStyle = this.data[key].color;
            this.ctx.lineWidth = this.data[key].weight;
            this.ctx.beginPath();
            pt = this.#translatePoint(this.data[key].x[0], this.data[key].y[0]);
            this.ctx.moveTo(pt.x, pt.y);
            for (let i = 1; i < this.data[key].x.length; i++) {
                pt = this.#translatePoint(this.data[key].x[i], this.data[key].y[i]);
                this.ctx.lineTo(pt.x, pt.y);
            }
            this.ctx.stroke();
            this.ctx.fillText(key, 2, y += 12);
        }
    }
}