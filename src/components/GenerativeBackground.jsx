import React, { useEffect, useRef } from 'react';
import p5 from 'p5';

const GenerativeBackground = () => {
    const renderRef = useRef(null);

    useEffect(() => {
        const sketch = (p) => {
            let particles = [];
            const numParticles = 120;
            const noiseScale = 0.005;
            
            p.setup = () => {
                const canvas = p.createCanvas(p.windowWidth, p.windowHeight);
                canvas.parent(renderRef.current);
                p.background(255, 255, 255); // White background
                
                for (let i = 0; i < numParticles; i++) {
                    particles.push(new Particle(p));
                }
            };

            p.draw = () => {
                // Subtle fade for trailing effect - using pure white for light theme
                p.fill(255, 255, 255, 12); 
                p.noStroke();
                p.rect(0, 0, p.width, p.height);

                particles.forEach(part => {
                    part.update();
                    part.display();
                    part.wrap();
                });
            };

            p.windowResized = () => {
                p.resizeCanvas(p.windowWidth, p.windowHeight);
                p.background(255, 255, 255);
            };

            class Particle {
                constructor(p) {
                    this.p = p;
                    this.pos = p.createVector(p.random(p.width), p.random(p.height));
                    this.vel = p.createVector(0, 0);
                    this.acc = p.createVector(0, 0);
                    this.maxSpeed = p.random(0.5, 2); // Slightly slower for professional feel
                    this.prevPos = this.pos.copy();
                }

                update() {
                    // Flow field dynamics
                    let angle = this.p.noise(this.pos.x * noiseScale, this.pos.y * noiseScale, this.p.frameCount * 0.001) * this.p.TWO_PI * 4;
                    let force = p5.Vector.fromAngle(angle);
                    force.setMag(0.05);
                    
                    this.acc.add(force);
                    this.vel.add(this.acc);
                    this.vel.limit(this.maxSpeed);
                    this.pos.add(this.vel);
                    this.acc.mult(0);
                }

                display() {
                    // Dynamic color based on velocity/position - Blue ink tones
                    let speed = this.vel.mag();
                    let alpha = this.p.map(speed, 0, this.maxSpeed, 20, 80);
                    
                    // Gradient effect between professional blues
                    let lerpAmt = this.p.map(this.pos.x, 0, this.p.width, 0, 1);
                    let c = this.p.lerpColor(this.p.color(0, 85, 255), this.p.color(0, 209, 255), lerpAmt);
                    
                    this.p.stroke(this.p.red(c), this.p.green(c), this.p.blue(c), alpha);
                    this.p.strokeWeight(1.2);
                    this.p.line(this.pos.x, this.pos.y, this.prevPos.x, this.prevPos.y);
                    this.updatePrev();
                }

                updatePrev() {
                    this.prevPos.x = this.pos.x;
                    this.prevPos.y = this.pos.y;
                }

                wrap() {
                    if (this.pos.x > this.p.width) {
                        this.pos.x = 0;
                        this.updatePrev();
                    }
                    if (this.pos.x < 0) {
                        this.pos.x = this.p.width;
                        this.updatePrev();
                    }
                    if (this.pos.y > this.p.height) {
                        this.pos.y = 0;
                        this.updatePrev();
                    }
                    if (this.pos.y < 0) {
                        this.pos.y = this.p.height;
                        this.updatePrev();
                    }
                }
            }
        };

        const myP5 = new p5(sketch);

        return () => {
            myP5.remove();
        };
    }, []);

    return <div ref={renderRef} className="fixed inset-0 z-[-1] pointer-events-none" />;
};

export default GenerativeBackground;
