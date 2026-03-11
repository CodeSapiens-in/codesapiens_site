/**
 * FluidCursor — WebGL fluid simulation overlay.
 * Flowing liquid color trails that react to mouse movement.
 * Based on PavelDoGreat/WebGL-Fluid-Simulation (MIT).
 * 
 * Disabled on mobile/touch devices per spec.
 */
import React, { useEffect, useRef, useCallback } from 'react';

const SITE_PALETTE = [
  [0.388, 0.4, 0.945],    // indigo #6366f1
  [0.133, 0.827, 0.933],  // cyan #22d3ee
  [0.659, 0.333, 0.969],  // purple #a855f7
  [0.063, 0.725, 0.506],  // teal #10b981
];

const CONFIG = {
  SIM_RESOLUTION: 128,
  DYE_RESOLUTION: 1024,
  DENSITY_DISSIPATION: 0.97,
  VELOCITY_DISSIPATION: 0.98,
  PRESSURE: 0.8,
  PRESSURE_ITERATIONS: 25,
  CURL: 30,
  SPLAT_RADIUS: 0.003,
  SPLAT_FORCE: 6000,
  SHADING: true,
  TRANSPARENT: true,
};

function isMobile() {
  if (typeof window === 'undefined') return true;
  return window.matchMedia('(pointer: coarse)').matches || 
         /Mobi|Android/i.test(navigator.userAgent);
}

const FluidCursor = () => {
  const fluidRef = useRef(null);
  const colorIndexRef = useRef(0);

  const getNextColor = useCallback(() => {
    const col = SITE_PALETTE[colorIndexRef.current % SITE_PALETTE.length];
    colorIndexRef.current++;
    return { r: col[0] * 0.2, g: col[1] * 0.2, b: col[2] * 0.2 };
  }, []);

  useEffect(() => {
    if (isMobile()) return;

    let canvas = document.createElement('canvas');
    canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9999;
      opacity: 0.85;
      mix-blend-mode: screen;
    `;
    document.body.insertBefore(canvas, document.body.firstChild);

    let gl = canvas.getContext('webgl2', { alpha: true, depth: false, stencil: false, antialias: false }) ||
             canvas.getContext('webgl', { alpha: true, depth: false, stencil: false, antialias: false }) ||
             canvas.getContext('experimental-webgl', { alpha: true, depth: false, stencil: false, antialias: false });

    if (!gl) {
      canvas.remove();
      return;
    }

    const sim = initFluidSimulation(gl, canvas, getNextColor);
    if (!sim) {
      canvas.remove();
      return;
    }

    fluidRef.current = { sim, canvas };

    // Initial 6 random splats
    for (let i = 0; i < 6; i++) {
      const color = getNextColor();
      const r = { r: color.r * 8, g: color.g * 8, b: color.b * 8 };
      sim.splat(Math.random(), Math.random(), 500 * (Math.random() - 0.5), 500 * (Math.random() - 0.5), r);
    }

    let prevX = null, prevY = null;
    let rafId;

    const handleMove = (e) => {
      const cx = e.clientX ?? e.touches?.[0]?.clientX;
      const cy = e.clientY ?? e.touches?.[0]?.clientY;
      if (cx == null || cy == null) return;
      const rect = canvas.getBoundingClientRect();
      const x = (cx - rect.left) / rect.width;
      const y = 1 - (cy - rect.top) / rect.height;
      const dx = prevX != null ? (x - prevX) * 8 : 0;
      const dy = prevY != null ? (prevY - y) * 8 : 0;
      prevX = x;
      prevY = y;
      const color = getNextColor();
      sim.splat(x, y, dx * 500, dy * 500, color);
    };

    const handleTouchMove = (e) => {
      if (e.touches.length > 0) handleMove(e);
    };

    const handleTouchStart = (e) => {
      if (e.touches.length > 0) {
        const t = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        prevX = (t.clientX - rect.left) / rect.width;
        prevY = 1 - (t.clientY - rect.top) / rect.height;
      }
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = Math.floor(canvas.clientWidth * dpr);
      const h = Math.floor(canvas.clientHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        sim.resize?.();
      }
    };
    resize();
    window.addEventListener('resize', resize);

    const loop = () => {
      sim.step();
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('resize', resize);
      sim.destroy?.();
      canvas.remove();
    };
  }, [getNextColor]);

  return null;
};

function initFluidSimulation(gl, canvas, getColor) {
  if (gl.getParameter(gl.VERSION).includes('WebGL 2')) {
    gl.getExtension('EXT_color_buffer_float');
  }
  const linearFilter = gl.getExtension('OES_texture_float_linear');
  const halfFloat = gl.HALF_FLOAT ?? gl.getExtension('OES_texture_half_float')?.HALF_FLOAT_OES ?? 0x8D61;

  const formatRGBA = { internalFormat: gl.RGBA16F, format: gl.RGBA };
  const formatRG = { internalFormat: gl.RG16F, format: gl.RG };
  const formatR = { internalFormat: gl.R16F, format: gl.RED };

  const getRes = (res) => {
    const ar = gl.drawingBufferWidth / gl.drawingBufferHeight;
    const r = ar < 1 ? 1 / ar : ar;
    const min = Math.round(res);
    const max = Math.round(res * r);
    return gl.drawingBufferWidth > gl.drawingBufferHeight
      ? { width: max, height: min }
      : { width: min, height: max };
  };

  const createFBO = (w, h, fmt, type, filter) => {
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, fmt.internalFormat, w, h, 0, fmt.format, type, null);
    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    return {
      texture: tex,
      fbo,
      width: w,
      height: h,
      attach: (id) => { gl.activeTexture(gl.TEXTURE0 + id); gl.bindTexture(gl.TEXTURE_2D, tex); return id; }
    };
  };

  const createDoubleFBO = (w, h, fmt, type, filter) => {
    let a = createFBO(w, h, fmt, type, filter);
    let b = createFBO(w, h, fmt, type, filter);
    return {
      width: w, height: h,
      texelSizeX: 1 / w, texelSizeY: 1 / h,
      get read() { return a; },
      set read(v) { a = v; },
      get write() { return b; },
      set write(v) { b = v; },
      swap: () => { const t = a; a = b; b = t; }
    };
  };

  const compileShader = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn(gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  };

  const createProgram = (vs, fs) => {
    const p = gl.createProgram();
    gl.attachShader(p, vs);
    gl.attachShader(p, fs);
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      console.warn(gl.getProgramInfoLog(p));
      return null;
    }
    return p;
  };

  const baseVS = compileShader(gl.VERTEX_SHADER, `#version 300 es
    in vec2 aPosition;
    out vec2 vUv;
    out vec2 vL,vR,vT,vB;
    uniform vec2 texelSize;
    void main() {
      vUv = aPosition * 0.5 + 0.5;
      vL = vUv - vec2(texelSize.x,0.); vR = vUv + vec2(texelSize.x,0.);
      vT = vUv + vec2(0.,texelSize.y); vB = vUv - vec2(0.,texelSize.y);
      gl_Position = vec4(aPosition,0.,1.);
    }
  `);

  const splatFS = compileShader(gl.FRAGMENT_SHADER, `#version 300 es
    precision highp float;
    in vec2 vUv;
    uniform sampler2D uTarget;
    uniform float aspectRatio;
    uniform vec3 color;
    uniform vec2 point;
    uniform float radius;
    out vec4 outColor;
    void main() {
      vec2 p = vUv - point; p.x *= aspectRatio;
      vec3 splat = exp(-dot(p,p)/radius) * color;
      vec3 base = texture(uTarget,vUv).xyz;
      outColor = vec4(base + splat, 1.);
    }
  `);

  const advectionFS = compileShader(gl.FRAGMENT_SHADER, `#version 300 es
    precision highp float;
    in vec2 vUv;
    uniform sampler2D uVelocity;
    uniform sampler2D uSource;
    uniform vec2 texelSize;
    uniform float dt;
    uniform float dissipation;
    out vec4 outColor;
    void main() {
      vec2 coord = vUv - dt * texture(uVelocity,vUv).xy * texelSize;
      vec4 r = texture(uSource, coord);
      outColor = r / (1. + dissipation * dt);
    }
  `);

  const divergenceFS = compileShader(gl.FRAGMENT_SHADER, `#version 300 es
    precision highp float;
    in vec2 vUv,vL,vR,vT,vB;
    uniform sampler2D uVelocity;
    out vec4 outColor;
    void main() {
      float L = texture(uVelocity,vL).x, R = texture(uVelocity,vR).x;
      float T = texture(uVelocity,vT).y, B = texture(uVelocity,vB).y;
      vec2 C = texture(uVelocity,vUv).xy;
      if(vL.x<0.) L=-C.x; if(vR.x>1.) R=-C.x; if(vT.y>1.) T=-C.y; if(vB.y<0.) B=-C.y;
      outColor = vec4(0.5*(R-L+T-B),0.,0.,1.);
    }
  `);

  const curlFS = compileShader(gl.FRAGMENT_SHADER, `#version 300 es
    precision highp float;
    in vec2 vUv,vL,vR,vT,vB;
    uniform sampler2D uVelocity;
    out vec4 outColor;
    void main() {
      float L = texture(uVelocity,vL).y, R = texture(uVelocity,vR).y;
      float T = texture(uVelocity,vT).x, B = texture(uVelocity,vB).x;
      outColor = vec4(0.5*(R-L-T+B),0.,0.,1.);
    }
  `);

  const vorticityFS = compileShader(gl.FRAGMENT_SHADER, `#version 300 es
    precision highp float;
    in vec2 vUv,vL,vR,vT,vB;
    uniform sampler2D uVelocity;
    uniform sampler2D uCurl;
    uniform float curl;
    uniform float dt;
    out vec4 outColor;
    void main() {
      float L = texture(uCurl,vL).x, R = texture(uCurl,vR).x;
      float T = texture(uCurl,vT).x, B = texture(uCurl,vB).x;
      float C = texture(uCurl,vUv).x;
      vec2 force = 0.5*vec2(abs(T)-abs(B),abs(R)-abs(L));
      force /= length(force)+0.0001;
      force *= curl*C; force.y *= -1.;
      vec2 v = texture(uVelocity,vUv).xy + force*dt;
      outColor = vec4(clamp(v,-1e3,1e3),0.,1.);
    }
  `);

  const pressureFS = compileShader(gl.FRAGMENT_SHADER, `#version 300 es
    precision highp float;
    in vec2 vUv,vL,vR,vT,vB;
    uniform sampler2D uPressure;
    uniform sampler2D uDivergence;
    out vec4 outColor;
    void main() {
      float L = texture(uPressure,vL).x, R = texture(uPressure,vR).x;
      float T = texture(uPressure,vT).x, B = texture(uPressure,vB).x;
      float d = texture(uDivergence,vUv).x;
      outColor = vec4((L+R+B+T-d)*0.25,0.,0.,1.);
    }
  `);

  const gradSubFS = compileShader(gl.FRAGMENT_SHADER, `#version 300 es
    precision highp float;
    in vec2 vUv,vL,vR,vT,vB;
    uniform sampler2D uPressure;
    uniform sampler2D uVelocity;
    out vec4 outColor;
    void main() {
      float L = texture(uPressure,vL).x, R = texture(uPressure,vR).x;
      float T = texture(uPressure,vT).x, B = texture(uPressure,vB).x;
      vec2 v = texture(uVelocity,vUv).xy - vec2(R-L,T-B);
      outColor = vec4(v,0.,1.);
    }
  `);

  const clearFS = compileShader(gl.FRAGMENT_SHADER, `#version 300 es
    precision highp float;
    in vec2 vUv;
    uniform sampler2D uTexture;
    uniform float value;
    out vec4 outColor;
    void main() { outColor = value * texture(uTexture,vUv); }
  `);

  const displayFS = compileShader(gl.FRAGMENT_SHADER, `#version 300 es
    precision highp float;
    in vec2 vUv,vL,vR,vT,vB;
    uniform sampler2D uTexture;
    uniform vec2 texelSize;
    out vec4 outColor;
    void main() {
      vec3 c = texture(uTexture,vUv).rgb;
      vec3 lc=texture(uTexture,vL).rgb, rc=texture(uTexture,vR).rgb;
      vec3 tc=texture(uTexture,vT).rgb, bc=texture(uTexture,vB).rgb;
      float dx=length(rc)-length(lc), dy=length(tc)-length(bc);
      vec3 n = normalize(vec3(dx,dy,length(texelSize)));
      float diffuse = clamp(dot(n,vec3(0,0,1))+0.7,0.7,1.);
      c *= diffuse;
      float a = max(c.r,max(c.g,c.b));
      outColor = vec4(c, a);
    }
  `);

  const splatProg = createProgram(baseVS, splatFS);
  const advectionProg = createProgram(baseVS, advectionFS);
  const divergenceProg = createProgram(baseVS, divergenceFS);
  const curlProg = createProgram(baseVS, curlFS);
  const vorticityProg = createProgram(baseVS, vorticityFS);
  const pressureProg = createProgram(baseVS, pressureFS);
  const gradSubProg = createProgram(baseVS, gradSubFS);
  const clearProg = createProgram(baseVS, clearFS);
  const displayProg = createProgram(baseVS, displayFS);

  if (!splatProg || !advectionProg) return null;

  const quadBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,-1,1,1,1,1,-1]), gl.STATIC_DRAW);
  const quadIb = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, quadIb);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0,1,2,0,2,3]), gl.STATIC_DRAW);

  const bindQuad = () => {
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, quadIb);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);
  };

  let dye, velocity, divergence, curl, pressure;
  const filter = linearFilter ? gl.LINEAR : gl.NEAREST;

  const initBuffers = () => {
    const dyeRes = getRes(CONFIG.DYE_RESOLUTION);
    const simRes = getRes(CONFIG.SIM_RESOLUTION);
    dye = createDoubleFBO(dyeRes.width, dyeRes.height, formatRGBA, halfFloat, filter);
    velocity = createDoubleFBO(simRes.width, simRes.height, formatRG, halfFloat, filter);
    divergence = createFBO(simRes.width, simRes.height, formatR, halfFloat, gl.NEAREST);
    curl = createFBO(simRes.width, simRes.height, formatR, halfFloat, gl.NEAREST);
    pressure = createDoubleFBO(simRes.width, simRes.height, formatR, halfFloat, gl.NEAREST);
  };
  initBuffers();

  const correctRadius = (r) => {
    const ar = canvas.width / canvas.height;
    return ar > 1 ? r * ar : r;
  };

  const splat = (x, y, dx, dy, color) => {
    const radius = correctRadius(CONFIG.SPLAT_RADIUS / 100);
    gl.disable(gl.BLEND);
    gl.useProgram(splatProg);
    bindQuad();
    gl.uniform1i(gl.getUniformLocation(splatProg, 'uTarget'), velocity.read.attach(0));
    gl.uniform1f(gl.getUniformLocation(splatProg, 'aspectRatio'), canvas.width / canvas.height);
    gl.uniform2f(gl.getUniformLocation(splatProg, 'point'), x, y);
    gl.uniform3f(gl.getUniformLocation(splatProg, 'color'), dx, dy, 0);
    gl.uniform1f(gl.getUniformLocation(splatProg, 'radius'), radius);
    gl.viewport(0, 0, velocity.width, velocity.height);
    gl.bindFramebuffer(gl.FRAMEBUFFER, velocity.write.fbo);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    velocity.swap();
    gl.uniform1i(gl.getUniformLocation(splatProg, 'uTarget'), dye.read.attach(0));
    gl.uniform3f(gl.getUniformLocation(splatProg, 'color'), color.r, color.g, color.b);
    gl.bindFramebuffer(gl.FRAMEBUFFER, dye.write.fbo);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    dye.swap();
  };

  let lastTime = Date.now();
  const step = () => {
    const dt = Math.min((Date.now() - lastTime) / 1000, 0.016);
    lastTime = Date.now();
    gl.disable(gl.BLEND);
    const tex = (f) => [f.texelSizeX, f.texelSizeY];

    gl.useProgram(curlProg);
    bindQuad();
    gl.uniform2fv(gl.getUniformLocation(curlProg, 'texelSize'), tex(velocity));
    gl.uniform1i(gl.getUniformLocation(curlProg, 'uVelocity'), velocity.read.attach(0));
    gl.viewport(0, 0, curl.width, curl.height);
    gl.bindFramebuffer(gl.FRAMEBUFFER, curl.fbo);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

    gl.useProgram(vorticityProg);
    bindQuad();
    gl.uniform2fv(gl.getUniformLocation(vorticityProg, 'texelSize'), tex(velocity));
    gl.uniform1i(gl.getUniformLocation(vorticityProg, 'uVelocity'), velocity.read.attach(0));
    gl.uniform1i(gl.getUniformLocation(vorticityProg, 'uCurl'), curl.attach(1));
    gl.uniform1f(gl.getUniformLocation(vorticityProg, 'curl'), CONFIG.CURL);
    gl.uniform1f(gl.getUniformLocation(vorticityProg, 'dt'), dt);
    gl.bindFramebuffer(gl.FRAMEBUFFER, velocity.write.fbo);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    velocity.swap();

    gl.useProgram(divergenceProg);
    bindQuad();
    gl.uniform2fv(gl.getUniformLocation(divergenceProg, 'texelSize'), tex(velocity));
    gl.uniform1i(gl.getUniformLocation(divergenceProg, 'uVelocity'), velocity.read.attach(0));
    gl.bindFramebuffer(gl.FRAMEBUFFER, divergence.fbo);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

    gl.useProgram(clearProg);
    bindQuad();
    gl.uniform1i(gl.getUniformLocation(clearProg, 'uTexture'), pressure.read.attach(0));
    gl.uniform1f(gl.getUniformLocation(clearProg, 'value'), CONFIG.PRESSURE);
    gl.bindFramebuffer(gl.FRAMEBUFFER, pressure.write.fbo);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    pressure.swap();

    for (let i = 0; i < CONFIG.PRESSURE_ITERATIONS; i++) {
      gl.useProgram(pressureProg);
      bindQuad();
      gl.uniform2fv(gl.getUniformLocation(pressureProg, 'texelSize'), tex(velocity));
      gl.uniform1i(gl.getUniformLocation(pressureProg, 'uDivergence'), divergence.attach(0));
      gl.uniform1i(gl.getUniformLocation(pressureProg, 'uPressure'), pressure.read.attach(1));
      gl.bindFramebuffer(gl.FRAMEBUFFER, pressure.write.fbo);
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
      pressure.swap();
    }

    gl.useProgram(gradSubProg);
    bindQuad();
    gl.uniform2fv(gl.getUniformLocation(gradSubProg, 'texelSize'), tex(velocity));
    gl.uniform1i(gl.getUniformLocation(gradSubProg, 'uPressure'), pressure.read.attach(0));
    gl.uniform1i(gl.getUniformLocation(gradSubProg, 'uVelocity'), velocity.read.attach(1));
    gl.bindFramebuffer(gl.FRAMEBUFFER, velocity.write.fbo);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    velocity.swap();

    gl.useProgram(advectionProg);
    bindQuad();
    gl.uniform2fv(gl.getUniformLocation(advectionProg, 'texelSize'), tex(velocity));
    gl.uniform1i(gl.getUniformLocation(advectionProg, 'uVelocity'), velocity.read.attach(0));
    gl.uniform1i(gl.getUniformLocation(advectionProg, 'uSource'), velocity.read.attach(0));
    gl.uniform1f(gl.getUniformLocation(advectionProg, 'dt'), dt);
    gl.uniform1f(gl.getUniformLocation(advectionProg, 'dissipation'), CONFIG.VELOCITY_DISSIPATION);
    gl.bindFramebuffer(gl.FRAMEBUFFER, velocity.write.fbo);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    velocity.swap();

    gl.uniform1i(gl.getUniformLocation(advectionProg, 'uSource'), dye.read.attach(1));
    gl.uniform1f(gl.getUniformLocation(advectionProg, 'dissipation'), CONFIG.DENSITY_DISSIPATION);
    gl.bindFramebuffer(gl.FRAMEBUFFER, dye.write.fbo);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    dye.swap();

    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.BLEND);
    gl.useProgram(displayProg);
    bindQuad();
    gl.uniform2f(gl.getUniformLocation(displayProg, 'texelSize'), 1 / gl.drawingBufferWidth, 1 / gl.drawingBufferHeight);
    gl.uniform1i(gl.getUniformLocation(displayProg, 'uTexture'), dye.read.attach(0));
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
  };

  return {
    splat,
    step,
    resize: initBuffers,
    destroy: () => {},
  };
}

export default FluidCursor;
