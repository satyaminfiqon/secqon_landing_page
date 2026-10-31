/**
 * Scanner WebGL2 Hero Background
 * Converted from React Scanner component to Vanilla JavaScript.
 */

(function () {
  const MAX_PINGS = 6;
  const INTRO_SECONDS = 2;
  const DIRECTIONS = { vertical: 0, horizontal: 1, diagonal: 2 };

  const VERTEX = `#version 300 es
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

  const FRAGMENT = `#version 300 es
precision highp float;

uniform vec2 uResolution;
uniform float uWave;
uniform float uSweep;
uniform float uSweepWidth;
uniform float uTrail;
uniform float uScale;
uniform float uFrequency;
uniform float uRipple;
uniform float uDensity;
uniform float uLineWidth;
uniform float uGlow;
uniform float uDirection;
uniform float uSpread;
uniform float uBrightness;
uniform float uVignette;
uniform float uOpacity;
uniform float uScanline;
uniform float uRatio;
uniform float uGrain;
uniform float uTime;
uniform vec2 uMouse;
uniform float uPresence;
uniform float uMouseRadius;
uniform float uMouseStrength;
uniform float uAttract;
uniform vec3 uPings[${MAX_PINGS}];
uniform float uIntro;
uniform float uLightMode;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;

out vec4 fragColor;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float signal(vec2 p, float t) {
  float w = sin(p.x * 1.3 + t * 0.7);
  w += sin(p.y * 1.7 - t * 0.52) * 0.8;
  w += sin((p.x + p.y) * 0.9 + t * 0.91) * 0.6;
  w += sin((p.x - p.y) * 1.53 - t * 0.63) * 0.42;
  return w * 0.35;
}

float smoother(float x) {
  x = clamp(x, 0.0, 1.0);
  return x * x * x * (x * (x * 6.0 - 15.0) + 10.0);
}

vec2 axes(vec2 p) {
  if (uDirection < 0.5) return vec2(p.y, p.x);
  if (uDirection < 1.5) return vec2(p.x, -p.y);
  return vec2((p.x + p.y) * 0.70710678, (p.x - p.y) * 0.70710678);
}

float coverage(float lc, float width) {
  float fw = max(fwidth(lc), 1e-5);
  float dist = abs(fract(lc + 0.5) - 0.5) / fw;
  float crowd = smoothstep(0.2, 0.55, fw);
  float cover = clamp(width * 0.5 + 0.5 - dist, 0.0, 1.0) * min(width, 1.0);
  return mix(cover, min(width * fw, 1.0), crowd);
}

void main() {
  vec2 uv = (gl_FragCoord.xy * 2.0 - uResolution) / uResolution.y;
  vec2 p = uv / max(uScale, 0.001);
  vec2 ax = axes(p);

  float sig = signal(p * uFrequency, uWave);
  float coord = ax.x + sig * uRipple;

  vec2 mp = uMouse / max(uScale, 0.001);
  vec2 md = p - mp;
  float radius = max(uMouseRadius / max(uScale, 0.001), 0.01);
  float lens = exp(-dot(md, md) / (radius * radius)) * uPresence;
  float mouseAxis = axes(mp).x + signal(mp * uFrequency, uWave) * uRipple;
  coord -= (coord - mouseAxis) * lens * uMouseStrength * mix(0.55, -0.9, uAttract);

  float pingLight = 0.0;
  for (int i = 0; i < ${MAX_PINGS}; i++) {
    vec3 ping = uPings[i];
    if (ping.z < 0.0) continue;
    float d = length(uv - ping.xy);
    float age = ping.z;
    float r = age * 1.1;
    float w = 0.12 + age * 0.1;
    float band = exp(-((d - r) * (d - r)) / (w * w));
    float fade = exp(-age * 0.9) * smoothstep(0.0, 0.12, age);
    coord += band * fade * 0.018 / max(uScale, 0.001);
    pingLight += band * fade;
  }

  float u = fract(uSweep - coord / max(uSweepWidth, 0.05));
  float tail = mix(11.0, 1.8, clamp(uTrail, 0.0, 1.0));
  float lead = smoothstep(0.84, 1.0, u);
  lead *= lead;
  float sweep = max(exp(-u * tail), lead);
  float head = max(exp(-u * 26.0), lead * lead * lead);

  float introFront = mix(-1.6, 1.6, smoother(uIntro)) / max(uScale, 0.001);
  float reveal = 1.0 - smoothstep(introFront - 0.05, introFront + 0.3, coord);
  float introHead = exp(-abs(coord - introFront) * 14.0) * (1.0 - uIntro) * step(0.0001, 1.0 - uIntro);
  reveal = mix(reveal, 1.0, step(0.9999, uIntro));

  float lit = clamp(sweep * 0.86 + lens * uMouseStrength * 0.7 + pingLight * 0.9 + introHead, 0.0, 1.6);
  float hot = clamp(head + introHead + pingLight * 0.35, 0.0, 1.0);

  float lc = coord * uDensity;
  float width = uLineWidth * (1.0 + lit * 1.4 + hot * 0.9);
  float thread = 0.62 + 0.38 * hash(vec2(floor(lc + 0.5), 3.7));
  float split = uSpread * (0.5 + lit * 1.3) * max(fwidth(lc), 1e-5);
  float cg = coverage(lc, width);
  float cr = coverage(lc + split, width);
  float cb = coverage(lc - split, width);

  float fw = max(fwidth(lc), 1e-5);
  float dist = abs(fract(lc + 0.5) - 0.5) / fw;
  float crowd = smoothstep(0.2, 0.55, fw);
  float halo = exp(-dist / (3.0 + uGlow * 9.0)) * (1.0 - crowd) * uGlow * lit * 1.15;

  float base = 0.11 * reveal;
  float level = (base + lit * (1.0 - base)) * thread * uBrightness;

  vec3 tone = mix(uColor1, uColor2, smoothstep(0.05, 0.75, lit));
  tone = mix(tone, uColor3, hot);
  vec3 haloTone = mix(uColor1, uColor2, 0.65);

  float vx = smoother((1.0 - abs(uv.x / (uResolution.x / uResolution.y))) / 0.6);
  float vy = smoother((1.0 - abs(uv.y)) / 0.6);
  float vignette = mix(1.0, vx * vy, uVignette);

  vec3 cover3 = vec3(cr, cg, cb);
  float alphaLine = max(max(cr, cg), cb) * level;
  vec3 colLine = tone * cover3 * level;

  float grain = (hash(gl_FragCoord.xy + fract(uTime) * 91.7) - 0.5) * uGrain;
  float scan = 1.0 - uScanline * 0.55 * (0.5 + 0.5 * cos(gl_FragCoord.y * 6.2831853 / (3.0 * uRatio)));

  if (uLightMode > 0.5) {
    float ink = clamp(alphaLine * vignette * scan, 0.0, 1.0);
    float wash = clamp(halo * 0.28 * vignette, 0.0, 1.0);
    float alpha = clamp(ink + wash * (1.0 - ink) + grain * 0.5 * ink, 0.0, 1.0) * uOpacity;
    vec3 col = (tone * ink + haloTone * wash * (1.0 - ink)) / max(ink + wash * (1.0 - ink), 1e-4);
    fragColor = vec4(col * alpha, alpha);
    return;
  }

  vec3 col = (colLine + haloTone * halo) * vignette * scan;
  float alpha = clamp(max(alphaLine, halo) * vignette * scan + grain * max(alphaLine, 0.04), 0.0, 1.0);
  col = clamp(col + grain * 0.6 * alpha, 0.0, 1.0);
  col = min(col, vec3(alpha));
  fragColor = vec4(col * uOpacity, alpha * uOpacity);
}`;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const compile = (gl, type, source) => {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  };

  const link = gl => {
    const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);
    const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
    const program = gl.createProgram();
    if (!vertex || !fragment || !program) return null;
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      return null;
    }
    const uniforms = {};
    const total = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < total; i++) {
      const info = gl.getActiveUniform(program, i);
      if (info) uniforms[info.name.replace(/\[0\]$/, '')] = gl.getUniformLocation(program, info.name);
    }
    return { program, uniforms };
  };

  const toRgb = hex => {
    let h = String(hex || '#ffffff')
      .replace('#', '')
      .trim();
    if (h.length === 3 || h.length === 4)
      h = h
        .slice(0, 3)
        .split('')
        .map(c => c + c)
        .join('');
    const num = parseInt(h.slice(0, 6), 16);
    if (Number.isNaN(num)) return [1, 1, 1];
    return [((num >> 16) & 255) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255];
  };

  function createScanner(container, customConfig = {}) {
    if (!container) return null;

    let canvas = container.querySelector('canvas.scanner-canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.className = 'scanner-canvas';
      canvas.setAttribute('aria-hidden', 'true');
      container.appendChild(canvas);
    }

    const gl = canvas.getContext('webgl2', {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      depth: false,
      stencil: false
    });

    if (!gl) {
      console.warn('WebGL2 not supported on this browser/device.');
      return null;
    }

    const shader = link(gl);
    if (!shader) return null;
    const u = shader.uniforms;
    const vao = gl.createVertexArray();

    const defaults = {
      color1: '#5227FF',
      color2: '#4fa951',
      color3: '#FFFFFF',
      speed: 0.5,
      sweepSpeed: 0.25,
      sweepWidth: 1.6,
      trail: 0.5,
      reverse: false,
      scale: 1.5,
      frequency: 2,
      ripple: 0.22,
      bandDensity: 11,
      lineWidth: 1.2,
      glow: 0.6,
      scanDirection: 'vertical',
      colorSpread: 0.7,
      brightness: 1,
      vignette: 0.3,
      scanline: true,
      scanlineIntensity: 0.5,
      grain: true,
      grainIntensity: 0.04,
      opacity: 1,
      mouseInteraction: true,
      mouseRadius: 0.5,
      mouseStrength: 0.7,
      mouseMode: 'repel',
      clickEffect: 'ping',
      intro: true,
      lightMode: false,
      dpr: undefined
    };

    const cfg = Object.assign({}, defaults, customConfig);

    const settings = {
      color1: cfg.color1,
      color2: cfg.color2,
      color3: cfg.color3,
      speed: cfg.speed,
      sweepSpeed: cfg.reverse ? -cfg.sweepSpeed : cfg.sweepSpeed,
      sweepWidth: Math.max(0.05, cfg.sweepWidth),
      trail: clamp(cfg.trail, 0, 1),
      scale: Math.max(0.05, cfg.scale),
      frequency: cfg.frequency,
      ripple: cfg.ripple,
      bandDensity: Math.max(0.5, cfg.bandDensity),
      lineWidth: Math.max(0.2, cfg.lineWidth),
      glow: Math.max(0, cfg.glow),
      direction: DIRECTIONS[cfg.scanDirection] ?? 0,
      colorSpread: clamp(cfg.colorSpread, 0, 1),
      brightness: Math.max(0, cfg.brightness),
      vignette: clamp(cfg.vignette, 0, 1),
      scanline: cfg.scanline ? clamp(cfg.scanlineIntensity, 0, 1) : 0,
      grain: cfg.grain ? Math.max(0, cfg.grainIntensity) : 0,
      opacity: clamp(cfg.opacity, 0, 1),
      mouseInteraction: cfg.mouseInteraction,
      mouseRadius: Math.max(0.05, cfg.mouseRadius),
      mouseStrength: Math.max(0, cfg.mouseStrength),
      attract: cfg.mouseMode === 'attract',
      clickEffect: cfg.clickEffect,
      intro: cfg.intro,
      lightMode: cfg.lightMode,
      dpr: cfg.dpr
    };

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const view = { width: 1, height: 1, ratio: 1 };
    const pointer = { x: 0, y: 0, inside: false };
    const mouse = { x: 0, y: 0, ready: false };
    const pings = new Float32Array(MAX_PINGS * 3);
    for (let k = 0; k < MAX_PINGS; k++) pings[k * 3 + 2] = -1;
    let pingIndex = 0;
    let presence = 0;
    let wave = 0;
    let sweep = -0.39;
    let clock = 0;
    let introClock = settings.intro && !reduce ? 0 : 1;
    let raf = 0;
    let last = 0;
    let visible = true;
    let quiet = 0;

    const toUv = (x, y) => [(x * 2 - view.width) / view.height, (view.height - y * 2) / view.height];

    const draw = () => {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(shader.program);
      gl.uniform2f(u.uResolution, canvas.width, canvas.height);
      gl.uniform1f(u.uWave, wave);
      gl.uniform1f(u.uSweep, sweep);
      gl.uniform1f(u.uSweepWidth, settings.sweepWidth);
      gl.uniform1f(u.uTrail, settings.trail);
      gl.uniform1f(u.uScale, settings.scale);
      gl.uniform1f(u.uFrequency, settings.frequency);
      gl.uniform1f(u.uRipple, settings.ripple);
      gl.uniform1f(u.uDensity, settings.bandDensity);
      gl.uniform1f(u.uLineWidth, settings.lineWidth * view.ratio);
      gl.uniform1f(u.uGlow, settings.glow);
      gl.uniform1f(u.uDirection, settings.direction);
      gl.uniform1f(u.uSpread, settings.colorSpread);
      gl.uniform1f(u.uBrightness, settings.brightness);
      gl.uniform1f(u.uVignette, settings.vignette);
      gl.uniform1f(u.uOpacity, settings.opacity);
      gl.uniform1f(u.uScanline, settings.scanline);
      gl.uniform1f(u.uRatio, view.ratio);
      gl.uniform1f(u.uGrain, settings.grain);
      gl.uniform1f(u.uTime, clock);
      gl.uniform2f(u.uMouse, mouse.x, mouse.y);
      gl.uniform1f(u.uPresence, settings.mouseInteraction ? presence : 0);
      gl.uniform1f(u.uMouseRadius, settings.mouseRadius);
      gl.uniform1f(u.uMouseStrength, settings.mouseStrength);
      gl.uniform1f(u.uAttract, settings.attract ? 1 : 0);
      gl.uniform3fv(u.uPings, pings);
      gl.uniform1f(u.uIntro, introClock);
      gl.uniform1f(u.uLightMode, settings.lightMode ? 1 : 0);
      gl.uniform3fv(u.uColor1, toRgb(settings.color1));
      gl.uniform3fv(u.uColor2, toRgb(settings.color2));
      gl.uniform3fv(u.uColor3, toRgb(settings.color3));
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.bindVertexArray(vao);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    let sizedDpr = settings.dpr;

    const resize = () => {
      sizedDpr = settings.dpr;
      view.width = Math.max(1, container.clientWidth);
      view.height = Math.max(1, container.clientHeight);
      view.ratio = Math.min(settings.dpr || window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(view.width * view.ratio));
      canvas.height = Math.max(1, Math.round(view.height * view.ratio));
      draw();
      wake();
    };

    const frame = now => {
      raf = 0;
      if (!visible || document.hidden) return;
      if (settings.dpr !== sizedDpr) resize();
      const dt = last ? clamp((now - last) / 1000, 0, 1 / 20) : 1 / 60;
      last = now;
      clock += dt;
      if (!reduce) {
        wave += dt * settings.speed;
        sweep += dt * settings.sweepSpeed;
      }
      if (introClock < 1) introClock = Math.min(1, introClock + dt / INTRO_SECONDS);
      const target = toUv(pointer.x, pointer.y);
      const follow = 1 - Math.exp(-dt / 0.09);
      mouse.x += (target[0] - mouse.x) * follow;
      mouse.y += (target[1] - mouse.y) * follow;
      presence += ((pointer.inside && settings.mouseInteraction ? 1 : 0) - presence) * (1 - Math.exp(-dt / 0.3));
      let busy = (!reduce && (settings.speed !== 0 || settings.sweepSpeed !== 0)) || introClock < 1 || presence > 0.001;
      for (let k = 0; k < MAX_PINGS; k++) {
        if (pings[k * 3 + 2] < 0) continue;
        pings[k * 3 + 2] += dt;
        if (pings[k * 3 + 2] > 4) pings[k * 3 + 2] = -1;
        else busy = true;
      }
      draw();
      quiet = busy ? 0 : quiet + dt;
      if (quiet < 0.5) raf = requestAnimationFrame(frame);
    };

    function wake() {
      quiet = 0;
      if (!raf && visible && !document.hidden) {
        last = 0;
        raf = requestAnimationFrame(frame);
      }
    }

    const locate = event => {
      const rect = container.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      return { x, y, inside: x >= 0 && y >= 0 && x <= rect.width && y <= rect.height };
    };

    const onPointerMove = event => {
      const { x, y, inside } = locate(event);
      const was = pointer.inside;
      pointer.inside = inside;
      if (inside) {
        pointer.x = x;
        pointer.y = y;
        if (!was || !mouse.ready) {
          const [ux, uy] = toUv(x, y);
          mouse.x = ux;
          mouse.y = uy;
          mouse.ready = true;
        }
      }
      if (inside || was) wake();
    };

    const onPointerDown = event => {
      if (settings.clickEffect !== 'ping' || reduce) return;
      const { x, y, inside } = locate(event);
      if (!inside) return;
      const [ux, uy] = toUv(x, y);
      pings[pingIndex * 3] = ux;
      pings[pingIndex * 3 + 1] = uy;
      pings[pingIndex * 3 + 2] = 0;
      pingIndex = (pingIndex + 1) % MAX_PINGS;
      wake();
    };

    const onPointerLeave = () => {
      pointer.inside = false;
      wake();
    };

    const onVisibility = () => wake();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    const intersection = new IntersectionObserver(entries => {
      visible = entries.some(entry => entry.isIntersecting);
      if (visible) wake();
    });
    intersection.observe(container);

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    document.documentElement.addEventListener('pointerleave', onPointerLeave);
    document.addEventListener('visibilitychange', onVisibility);

    resize();
    wake();

    return {
      destroy: () => {
        cancelAnimationFrame(raf);
        resizeObserver.disconnect();
        intersection.disconnect();
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerdown', onPointerDown);
        document.documentElement.removeEventListener('pointerleave', onPointerLeave);
        document.removeEventListener('visibilitychange', onVisibility);
        gl.deleteVertexArray(vao);
        gl.deleteProgram(shader.program);
        gl.getExtension('WEBGL_lose_context')?.loseContext();
      },
      wake
    };
  }

  // Export to global scope
  window.createScanner = createScanner;

  // Auto-init for #heroScanner if exists
  document.addEventListener('DOMContentLoaded', () => {
    const heroScanner = document.getElementById('heroScanner');
    if (heroScanner) {
      window.scannerInstance = createScanner(heroScanner, {
        color1: '#5227FF',
        color2: '#4fa951',
        color3: '#FFFFFF',
        speed: 0.5,
        sweepSpeed: 0.25,
        sweepWidth: 1.6,
        trail: 0.5,
        ripple: 0.22,
        bandDensity: 11,
        glow: 0.6,
        scanDirection: 'vertical',
        colorSpread: 0.7,
        scanline: true,
        scanlineIntensity: 0.5,
        mouseInteraction: true,
        clickEffect: 'ping',
        reverse: false,
        scale: 1.5,
        frequency: 2,
        lineWidth: 1.2,
        brightness: 1,
        vignette: 0.3,
        grain: true,
        grainIntensity: 0.04,
        opacity: 1,
        mouseMode: 'repel',
        mouseRadius: 0.5,
        mouseStrength: 0.7,
        intro: true,
        lightMode: false
      });
    }
  });
})();

