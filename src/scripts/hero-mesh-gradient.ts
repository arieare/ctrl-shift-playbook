const canvas = document.querySelector<HTMLCanvasElement>("[data-hero-gradient]");
const photo = document.querySelector<HTMLImageElement>("[data-hero-photo]");

const vertexShaderSource = `
attribute vec2 a_position;

varying vec2 v_uv;

void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const fragmentShaderSource = `
precision mediump float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec3 u_colors[4];

varying vec2 v_uv;

float hash21(vec2 p) {
  p = fract(p * vec2(0.3183099, 0.3678794)) + 0.1;
  p += dot(p, p + 19.19);
  return fract(p.x * p.y);
}

float valueNoise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  float x1 = mix(a, b, u.x);
  float x2 = mix(c, d, u.x);
  return mix(x1, x2, u.y);
}

vec2 rotate(vec2 uv, float th) {
  return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;
}

vec2 getPosition(int i, float t) {
  float index = float(i);
  float a = index * 0.37;
  float b = 0.6 + fract(index / 3.0) * 0.9;
  float c = 0.8 + fract(float(i + 1) / 4.0);
  float x = sin(t * b + a);
  float y = cos(t * c + a * 1.5);

  return 0.5 + 0.5 * vec2(x, y);
}

void main() {
  const float scale = 2.0;
  const float rotation = 3.0717794835;
  const float swirl = 1.0;

  vec2 uv = v_uv;
  vec2 centered = uv - 0.5;
  centered.x *= u_resolution.x / max(u_resolution.y, 1.0);
  centered = rotate(centered / scale, rotation);
  uv = centered + 0.5;

  float t = 0.5 * (u_time + 41.5);
  float radius = smoothstep(0.0, 1.0, length(uv - 0.5));

  vec2 uvRotated = uv - 0.5;
  uvRotated = rotate(uvRotated, -3.0 * swirl * radius);
  uvRotated += 0.5;

  vec3 color = vec3(0.0);
  float totalWeight = 0.0;

  for (int i = 0; i < 4; i++) {
    vec2 pos = getPosition(i, t);
    float dist = length(uvRotated - pos);
    dist = pow(dist, 3.5);
    float weight = 1.0 / (dist + 0.001);

    color += u_colors[i] * weight;
    totalWeight += weight;
  }

  color /= max(totalWeight, 0.0001);

  float grain = valueNoise(v_uv * u_resolution * 0.42);
  color += (grain - 0.5) * 0.018;

  gl_FragColor = vec4(color, 1.0);
}
`;

const hero = (canvas ?? photo)?.closest<HTMLElement>("[data-hero]");
const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const colors = [
  [0.294, 0.294, 0.765],
  [0.435, 0.384, 0.737],
  [0.839, 0.663, 0.675],
  [0.98, 0.812, 0.741],
] as const;

const initializeHeroPhoto = () => {
  if (!hero || !photo) {
    return;
  }

  const showPhoto = () => {
    if (photo.naturalWidth > 0) {
      hero.classList.add("is-hero-photo-ready");
    }
  };

  if (photo.complete) {
    showPhoto();
  } else {
    photo.addEventListener("load", showPhoto, { once: true });
  }
};

const compileShader = (gl: WebGLRenderingContext, type: number, source: string) => {
  const shader = gl.createShader(type);

  if (!shader) {
    return null;
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }

  return shader;
};

const createProgram = (gl: WebGLRenderingContext) => {
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

  if (!vertexShader || !fragmentShader) {
    return null;
  }

  const program = gl.createProgram();

  if (!program) {
    return null;
  }

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }

  return program;
};

const initializeHeroGradient = () => {
  if (!canvas || !hero) {
    return;
  }

  const gl = canvas.getContext("webgl", {
    alpha: false,
    antialias: false,
    depth: false,
    powerPreference: "low-power",
    stencil: false,
  });

  if (!gl) {
    return;
  }

  const program = createProgram(gl);

  if (!program) {
    return;
  }

  const positionLocation = gl.getAttribLocation(program, "a_position");
  const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
  const timeLocation = gl.getUniformLocation(program, "u_time");
  const colorsLocation = gl.getUniformLocation(program, "u_colors");
  const positionBuffer = gl.createBuffer();

  if (positionLocation < 0 || !resolutionLocation || !timeLocation || !colorsLocation || !positionBuffer) {
    return;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      -1, -1,
      1, -1,
      -1, 1,
      -1, 1,
      1, -1,
      1, 1,
    ]),
    gl.STATIC_DRAW,
  );

  gl.useProgram(program);
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
  gl.uniform3fv(colorsLocation, new Float32Array(colors.flat()));

  let animationFrame = 0;
  let isDocumentVisible = document.visibilityState === "visible";
  let isHeroVisible = true;
  let startTime = window.performance.now();

  const resizeCanvas = () => {
    const rect = canvas.getBoundingClientRect();
    const basePixelRatio = Math.min(window.devicePixelRatio || 1, 1.75);
    const rawPixelCount = rect.width * rect.height * basePixelRatio * basePixelRatio;
    const maxPixelCount = 1_600_000;
    const pixelRatio = rawPixelCount > maxPixelCount
      ? basePixelRatio * Math.sqrt(maxPixelCount / rawPixelCount)
      : basePixelRatio;
    const width = Math.max(1, Math.floor(rect.width * pixelRatio));
    const height = Math.max(1, Math.floor(rect.height * pixelRatio));

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    gl.viewport(0, 0, width, height);
  };

  const render = (time: number) => {
    resizeCanvas();
    gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
    gl.uniform1f(timeLocation, (time - startTime) * 0.0006);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  };

  const animate = (time: number) => {
    render(time);

    if (!reduceMotionQuery.matches && isDocumentVisible && isHeroVisible) {
      animationFrame = window.requestAnimationFrame(animate);
    } else {
      animationFrame = 0;
    }
  };

  const stopAnimation = () => {
    if (animationFrame) {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    }
  };

  const updateMotion = () => {
    stopAnimation();
    startTime = window.performance.now();
    render(startTime);

    if (!reduceMotionQuery.matches && isDocumentVisible && isHeroVisible) {
      animationFrame = window.requestAnimationFrame(animate);
    }
  };

  const updateHeroVisibility = () => {
    const rect = hero.getBoundingClientRect();
    const nextIsHeroVisible = rect.bottom > 0 && rect.top < window.innerHeight;

    if (nextIsHeroVisible !== isHeroVisible) {
      isHeroVisible = nextIsHeroVisible;
      updateMotion();
    }
  };

  window.addEventListener("resize", () => {
    render(window.performance.now());
    updateHeroVisibility();
  }, { passive: true });
  window.addEventListener("scroll", updateHeroVisibility, { passive: true });
  document.addEventListener("visibilitychange", () => {
    isDocumentVisible = document.visibilityState === "visible";
    updateMotion();
  });
  reduceMotionQuery.addEventListener("change", updateMotion);

  if ("IntersectionObserver" in window) {
    const heroObserver = new IntersectionObserver((entries) => {
      isHeroVisible = entries.some((entry) => entry.isIntersecting);
      updateMotion();
    });

    heroObserver.observe(hero);
  }

  hero.classList.add("is-hero-gradient-ready");
  updateMotion();
};

initializeHeroPhoto();
initializeHeroGradient();
