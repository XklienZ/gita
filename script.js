const canvas = document.getElementById("heartbeatCanvas");
const ctx = canvas.getContext("2d");

let W = window.innerWidth;
let H = window.innerHeight;
canvas.width = W;
canvas.height = H;

const sizeSteps = 100;
const a = Array(sizeSteps).fill(13);
const b = linspace(-5, -3.3, sizeSteps);
const c = linspace(-2, -2.4, sizeSteps);
const d = linspace(-1, -0.16, sizeSteps);
const scalex = linspace(1, 1.18, sizeSteps).map((x) => x * 10);
const scaley = linspace(1, 1.36, sizeSteps).map((x) => x * 10);

let animationTime = 0;
const TRANSITION_DURATION = 500;
const PARTICLE_DELAY = 0;
let initSize = 0;

function linspace(start, end, num) {
    const arr = [];
    const step = (end - start) / (num - 1);
    for (let i = 0; i < num; i++) arr.push(start + step * i);
    return arr;
}

function hsvToRgb(h, s, v) {
    let f = (n, k = (n + h * 6) % 6) =>
        v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
    return [f(5) * 255, f(3) * 255, f(1) * 255];
}

function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

function easeInOutQuart(t) {
    return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
}

class PersistentParticle {
    constructor(t, size, color, offS, index) {
        this.t = t;
        this.targetSize = size;
        this.currentSize = size * 0.3;
        this.color = color;
        this.offS = offS;
        this.index = index;
        this.startTime = index * PARTICLE_DELAY;

        this.initialX = Math.random() * W;
        this.initialY = Math.random() * H;
        this.opacity = 0.2;
    }

    getTargetPos(i) {
        const t = this.t;
        let x = 16 * Math.pow(Math.sin(t), 3) * (scalex[i] + this.offS);
        let y =
            (a[i] * Math.cos(t) +
                b[i] * Math.cos(2 * t) +
                c[i] * Math.cos(3 * t) +
                d[i] * Math.cos(4 * t)) *
            (scaley[i] + this.offS);
        return [x + W / 2, -y + H / 2];
    }

    getCurrentPos(i) {
        if (animationTime < this.startTime) {
            return [this.initialX, this.initialY];
        }

        const elapsed = animationTime - this.startTime;
        const progress = Math.min(elapsed / TRANSITION_DURATION, 1);
        const easedProgress = easeOutCubic(progress);

        const [targetX, targetY] = this.getTargetPos(i);

        const currentX = this.initialX + (targetX - this.initialX) * easedProgress;
        const currentY = this.initialY + (targetY - this.initialY) * easedProgress;

        return [currentX, currentY];
    }

    draw(i) {
        const elapsed = animationTime - this.startTime;
        const progress = Math.min(Math.max(elapsed / TRANSITION_DURATION, 0), 1);
        const easedProgress = easeInOutQuart(progress);

        this.currentSize =
            this.targetSize * 0.3 + this.targetSize * 0.7 * easedProgress;

        this.opacity = 0.2 + 0.8 * easedProgress;

        const [x, y] = this.getCurrentPos(i);

        const colorMatch = this.color.match(
            /rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/
        );
        if (colorMatch) {
            const [, r, g, b, originalAlpha] = colorMatch;
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${originalAlpha * this.opacity})`;
        } else {
            ctx.fillStyle = this.color;
        }

        ctx.beginPath();
        ctx.arc(x, y, this.currentSize, 0, Math.PI * 2);
        ctx.fill();
    }
}

class GlitterParticle {
    constructor(t, size, color, offX, offY, offS, phi, index) {
        this.t = t;
        this.targetSize = size;
        this.currentSize = size * 0.2;
        this.color = color;
        this.offX = offX;
        this.offY = offY;
        this.offS = offS;
        this.phi = phi;
        this.index = index;
        this.startTime = index * PARTICLE_DELAY;

        this.initialX = Math.random() * W;
        this.initialY = Math.random() * H;
        this.opacity = 0.1;
    }

    getTargetPos(i) {
        const t = this.t;
        let x =
            (16 * Math.pow(Math.sin(t), 3) + this.offX) * (scalex[i] + this.offS);
        let y =
            (a[i] * Math.cos(t) +
                b[i] * Math.cos(2 * t) +
                c[i] * Math.cos(3 * t) +
                d[i] * Math.cos(4 * t) +
                this.offY) *
            (scaley[i] + this.offS);
        return [x + W / 2, -y + H / 2];
    }

    getCurrentPos(i) {
        if (animationTime < this.startTime) {
            return [this.initialX, this.initialY];
        }

        const elapsed = animationTime - this.startTime;
        const progress = Math.min(elapsed / TRANSITION_DURATION, 1);
        const easedProgress = easeOutCubic(progress);

        const [targetX, targetY] = this.getTargetPos(i);

        const currentX = this.initialX + (targetX - this.initialX) * easedProgress;
        const currentY = this.initialY + (targetY - this.initialY) * easedProgress;

        return [currentX, currentY];
    }
    update(){
        // if (this.targetSize < 20) {
        //     this.targetSize = initSize;
        //     initSize+=.5
        // }
    }
    draw(i) {
        this.update()
        const elapsed = animationTime - this.startTime;
        const progress = Math.min(Math.max(elapsed / TRANSITION_DURATION, 0), 1);
        const easedProgress = easeInOutQuart(progress);

        this.currentSize =
            this.targetSize * 0.2 + this.targetSize * 0.8 * easedProgress;

        this.opacity = 0.1 + 0.9 * easedProgress;

        const [x, y] = this.getCurrentPos(i);

        const alpha =
            Math.floor(128 * Math.cos(this.phi + i / 5) + 127) * this.opacity;
        ctx.fillStyle = `rgba(${this.color[0]}, ${this.color[1]}, ${this.color[2]
            }, ${alpha / 255})`;
        ctx.beginPath();
        ctx.arc(x, y, this.currentSize, 0, Math.PI * 2);
        ctx.fill();
    }
}

const persistentParticles = [];
const glitterParticles = [];

let particleIndex = 0;
for (let repeat = 0; repeat < 3; repeat++) {
    for (let t = 0.18; t < 2 * Math.PI; t += 0.003) {
        let offS = Math.log(1 - Math.random()) * 1.8;
        let size = rand(1, 2);

        let [r, g, b] = hsvToRgb(0.95, rand(0.2, 0.7), 1);
        const alpha = Math.random() * 255;
        let color = `rgba(${r}, ${g}, ${b}, ${alpha / 255})`;
        persistentParticles.push(
            new PersistentParticle(t, size, color, offS, particleIndex)
        );
        particleIndex++;
    }
}

particleIndex = 0;
for (let repeat = 0; repeat < 3; repeat++) {
    for (let t = .2; t < 2 * Math.PI; t += 0.003) {
        let offX = randn() * 1.5;
        let offY = randn() * 1.5;
        let offS = 1;
        let size = rand(0.5, 1.5);
        let [r, g, b] = hsvToRgb(0.95, rand(0.5, 0.8), 1);
        let phi = rand(0, 2 * Math.PI);
        glitterParticles.push(
            new GlitterParticle(
                t,
                size,
                [r, g, b],
                offX,
                offY,
                offS,
                phi,
                particleIndex
            )
        );
        particleIndex++;
    }
}

const bloomIndices = linspace(0, sizeSteps - 1, 40);
const shrinkIndices = linspace(sizeSteps - 1, 0, 30);
const indices = bloomIndices.concat(shrinkIndices);
let frame = 0;

function rand(a = 0, b = 1) {
    return Math.random() * (b - a) + a;
}

function randn() {
    return (
        Math.sqrt(-2 * Math.log(Math.random())) *
        Math.cos(2 * Math.PI * Math.random())
    );
}

function animate() {
    animationTime += 16;

    ctx.clearRect(0, 0, W, H);

    const heartbeatStartTime = 0;

    let index = 0;
    if (animationTime > heartbeatStartTime) {
        index = Math.floor(indices[frame % indices.length]);
        frame++;
    }

    for (let p of persistentParticles) p.draw(index);
    for (let p of glitterParticles) p.draw(sizeSteps - 1 - index);

    requestAnimationFrame(animate);
}

animate();

window.addEventListener("resize", () => {
    const oldW = W;
    const oldH = H;
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    const scaleX = W / oldW;
    const scaleY = H / oldH;

    for (let p of persistentParticles) {
        p.initialX *= scaleX;
        p.initialY *= scaleY;
    }
    for (let p of glitterParticles) {
        p.initialX *= scaleX;
        p.initialY *= scaleY;
    }
});
