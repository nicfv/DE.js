'use strict';

/**
 * Contains basic plotting capabilities.
 */
class SimpleGraph {
    /**
     * Construct a new SimpleGraph within the parent element.
     */
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
        this.frame = -1;
        this.frameSkip = 1;
        this.animation = undefined;
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
    /**
     * Set the absolute position of the graph in relation to the parent element, in pixels.
     */
    setPosition(x, y) {
        this.canvas.style.top = +x + 'px';
        this.canvas.style.left = +y + 'px';
        this.#draw();
    }
    /**
     * Set the size of the graph, in pixels.
     */
    setSize(w, h) {
        this.canvas.style.width = +w + 'px';
        this.canvas.style.height = +h + 'px';
        this.canvas.width = +w;
        this.canvas.height = +h;
        this.#draw();
    }
    /**
     * Set graph limits.
     */
    setGraphLimits(xMin, xMax, yMin, yMax) {
        this.xMin = xMin;
        this.xMax = xMax;
        this.yMin = yMin;
        this.yMax = yMax;
        this.#draw();
    }
    /**
     * Add a series to the existing graph.
     */
    addSeries(series, x, y, color, weight) {
        this.data[series] = {};
        this.data[series]['color'] = color;
        this.data[series]['weight'] = weight;
        this.data[series]['x'] = x;
        this.data[series]['y'] = y;
        this.#draw();
    }
    /**
     * Remove series `series` from the graph.
     */
    clearSeries(series) {
        delete this.data[series];
        this.#draw();
    }
    /**
     * Clear all series from the graph.
     */
    clearAll() {
        this.data = {};
        this.#draw();
    }
    #draw() {
        let pt, y = 0, end = false;
        if (this.frame <= 0) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            // Draw Axes
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            pt = this.#translatePoint(this.xMin, 0);
            this.ctx.moveTo(pt.x, pt.y);
            pt = this.#translatePoint(this.xMax, 0);
            this.ctx.lineTo(pt.x, pt.y);
            this.ctx.stroke();
            this.ctx.beginPath();
            pt = this.#translatePoint(0, this.yMin);
            this.ctx.moveTo(pt.x, pt.y);
            pt = this.#translatePoint(0, this.yMax);
            this.ctx.lineTo(pt.x, pt.y);
            this.ctx.stroke();
        }
        // Draw Series
        for (let key in this.data) {
            this.ctx.fillStyle = this.data[key].color;
            this.ctx.strokeStyle = this.data[key].color;
            this.ctx.lineWidth = this.data[key].weight;
            this.ctx.beginPath();
            for (let i = (this.frame < 0 ? 0 : this.frame); i < (this.frame < 0 ? this.data[key].x.length : this.frame + this.frameSkip + 1); i++) {
                pt = this.#translatePoint(this.data[key].x[i], this.data[key].y[i]);
                this.ctx.lineTo(pt.x, pt.y);
            }
            this.ctx.stroke();
            if (this.frame <= 0) {
                this.ctx.fillText(key, 2, y += 12);
            }
            end = end || this.frame >= this.data[key].x.length;
        }
        return end;
    }
    /**
     * Set a one time playthrough animation. Set `dt = 0` to stop the animation.
     */
    animate(dt, frameSkip = 1) {
        if (dt > 0) {
            this.frame = 0;
            this.frameSkip = frameSkip;
            this.animation = setInterval(() => {
                if (this.#draw()) {
                    this.frame = -1;
                    clearInterval(this.animation);
                    this.#draw();
                }
                this.frame += frameSkip;
            }, dt * 1000);
        } else {
            this.frame = -1;
            this.frameSkip = 1;
            clearInterval(this.animation);
            this.#draw();
        }
    }
}