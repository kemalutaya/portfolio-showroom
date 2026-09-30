import{a as O,D as N,j as B}from"./index-BT_GWdg3.js";import{S as F,O as Y,W as G,P as q,a as X,V as K,M as $,C as J,b as Q,c as Z}from"./three-C0dFtn0l.js";const ee=`
  vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}
  vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;}
  vec4 permute(vec4 x){return mod289(((x*34.)+1.)*x);}
  vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-.85373472095314*r;}
  float snoise(vec3 v){
    const vec2 C=vec2(1./6.,1./3.);const vec4 D=vec4(0.,.5,1.,2.);
    vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
    vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.-g;
    vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
    vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;
    i=mod289(i);
    vec4 p=permute(permute(permute(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));
    float n_=.142857142857;vec3 ns=n_*D.wyz-D.xzx;
    vec4 j=p-49.*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.*x_);
    vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.-abs(x)-abs(y);
    vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
    vec4 s0=floor(b0)*2.+1.;vec4 s1=floor(b1)*2.+1.;
    vec4 sh=-step(h,vec4(0.));
    vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
    vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
    vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
    p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
    vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);m=m*m;
    return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
  }
`;function f(a){const n=document.createElement("i");n.style.cssText=`display:none;color:var(${a})`,document.body.appendChild(n);const[v=0,m=0,c=0]=(getComputedStyle(n).color.match(/[\d.]+/g)??[]).map(Number);return n.remove(),new Z(v/255,m/255,c/255)}const oe=`
  varying vec2 vUv;
  void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }
`,te=`
  uniform float uTime;
  uniform vec2  uMouse;       // [-1, 1]
  uniform float uMousePace;   // [0, ~1] eased mouse velocity
  uniform float uAspect;      // viewport.width / viewport.height
  uniform float uDarkMix;     // 0 = light/cream, 1 = dark/navy
  uniform vec3  uBgLight;     // --contour-bg-light
  uniform vec3  uLineLight;   // --contour-line-light
  uniform vec3  uBgDark;      // --contour-bg-dark
  uniform vec3  uLineDark;    // --contour-line-dark
  varying vec2 vUv;
  ${ee}

  // Tuning constants. Tune these to taste.
  // Tuned from full-HD screenshots of landonorris.com - the contours are
  // BIG sweeping curves (only 2-4 visible across a 1920px viewport), not
  // dense topographic detail. SCALE drives that.
  const float SCALE             = 0.72;  // base noise scale - LOWER = larger cells = fewer, sparser blobs across the viewport
  const float NOISE_DETAIL      = 3.0;   // number of contour bands per noise cell - LOWER = fewer parallel lines (less busy / fewer blobs)
  const float DISTORT_SCALE     = 0.55;  // size of the slow underlying blobs
  const float DISTORT_INTENSITY = 0.50;  // how much the slow blobs warp the contours
  const float HAIRLINE_PIXELS   = 1.5;   // contour line width in screen pixels (fwidth-driven)
  const float CURSOR_SCALE      = 1.5;   // falloff sharpness around the cursor
  const float CURSOR_INTENSITY  = 0.05;  // how much the cursor drags contour UVs

  // Near-isotropic noise sampling - contours form in all directions like a
  // real topographic map. NOT stretched into horizontal stripes.
  const vec2  ANISOTROPY        = vec2(1.0, 1.0);

  void main(){
    // Aspect-corrected UV so contours stay circular at any window ratio.
    vec2 uv = vUv;
    uv.x *= uAspect;

    // Mouse in the same UV space as the noise sample.
    vec2 mouse = uMouse * 0.5 + 0.5;
    mouse.x *= uAspect;
    float cursor = 1.0 - distance(mouse, uv) * CURSOR_SCALE;
    cursor *= uMousePace;
    cursor = clamp(cursor, 0.0, 1.0);

    // Layer 1: slow, large-scale noise.
    float noiseDistort = 0.5 + snoise(vec3(uv * DISTORT_SCALE, uTime * 0.1)) * 0.5;

    // Layer 2: low-frequency noise whose UV is warped by layer 1 + the cursor.
    vec2 warpedUv = (uv + cursor * CURSOR_INTENSITY + noiseDistort * DISTORT_INTENSITY) * SCALE * ANISOTROPY;
    float n = snoise(vec3(warpedUv, uTime));

    // Multiply by NOISE_DETAIL BEFORE fract() - this is the topographic-map
    // trick. With NOISE_DETAIL = 1, fract(n) wraps once per noise cell and
    // produces small closed loops around peaks/valleys. With NOISE_DETAIL = 4,
    // fract wraps four times per cell, producing FOUR PARALLEL contours that
    // flow along the noise gradient over long distances - exactly what makes
    // Lando's lines look like real elevation contours instead of pebbles.
    float bands = (n * 0.5 + 0.5) * NOISE_DETAIL;

    // Hairline contour lines using GLSL derivatives (fwidth) - resolution
    // independent. fwidth(bands) tracks per-pixel change in bands, so the
    // line stays HAIRLINE_PIXELS thick regardless of NOISE_DETAIL or SCALE.
    float contour = fract(bands);
    float dist    = abs(contour - 0.5);
    float w       = fwidth(bands) * HAIRLINE_PIXELS * 0.5;
    float line    = 1.0 - smoothstep(0.0, w, dist);

    // Theme colors come from the --contour-* tokens in tokens.css.
    vec3 bg      = mix(uBgLight, uBgDark, uDarkMix);
    vec3 lineCol = mix(uLineLight, uLineDark, uDarkMix);

    // Tiny cursor-velocity highlight so flicks leave a faint glow.
    lineCol += cursor * 0.04;

    // Line opacity: soft, tonal beige hairlines - lower alpha so
    // the contours read as a warm beige tint rather than stark black. The lower
    // contrast also hides most of the half-res upscale aliasing. Dark sections
    // use white lines on navy, kept legible at a similar low alpha.
    float lineAlpha = line * mix(0.55, 0.45, uDarkMix);
    vec3 color = mix(bg, lineCol, lineAlpha);

    gl_FragColor = vec4(color, 1.0);
  }
`;function se(){const a=O.useRef(null);return O.useEffect(()=>{const n=a.current;if(!n)return;const v=window.matchMedia("(prefers-reduced-motion: reduce)").matches,m="ontouchstart"in window||window.matchMedia&&window.matchMedia("(pointer: coarse)").matches||navigator.maxTouchPoints>0;if(v||m)return;const c=new F,y=new Y(-1,1,1,-1,0,10);y.position.z=1;const i=new G({antialias:!1});i.setSize(window.innerWidth,window.innerHeight),i.setPixelRatio(Math.min(window.devicePixelRatio,1)),n.appendChild(i.domElement);const g=new K(0,0),r={value:N()==="dark"?1:0};let E=r.value;const L={uBgLight:"--contour-bg-light",uLineLight:"--contour-line-light",uBgDark:"--contour-bg-dark",uLineDark:"--contour-line-dark"},b=Object.fromEntries(Object.entries(L).map(([e,o])=>[e,{value:f(o)}])),S=e=>{const o=f(e?"--contour-clear-dark":"--contour-clear-light");i.setClearColor(new J().setRGB(o.x,o.y,o.z,Q),1)};S(r.value===1);const T=()=>{const e=N()==="dark";E=e?1:0;for(const[o,d]of Object.entries(L))b[o].value=f(d);S(e)};window.addEventListener("themechange",T);const I=new q(2,2),s=new X({vertexShader:oe,fragmentShader:te,uniforms:{uTime:{value:0},uMouse:{value:g},uMousePace:{value:0},uAspect:{value:window.innerWidth/window.innerHeight},uDarkMix:r,...b}}),P=new $(I,s);c.add(P);let l={x:0,y:0},t={x:0,y:0};const k=e=>{l.x=e.clientX/window.innerWidth*2-1,l.y=-(e.clientY/window.innerHeight)*2+1};window.addEventListener("mousemove",k);const C=()=>{i.setSize(window.innerWidth,window.innerHeight),s.uniforms.uAspect.value=window.innerWidth/window.innerHeight};window.addEventListener("resize",C);let u=document.visibilityState!=="hidden";const R=()=>{const e=document.visibilityState!=="hidden";e&&!u?(u=!0,h=requestAnimationFrame(w)):u=e};document.addEventListener("visibilitychange",R);let h,A=0,p=performance.now();const U=1e3/30,W=.09;let z=0,D=0,x=0;function w(e=performance.now()){if(!u||(h=requestAnimationFrame(w),e-p<U-1))return;const o=Math.min(.05,(e-p)/1e3);p=e,A+=W*o;const d=1-Math.exp(-4*o);t.x+=(l.x-t.x)*d,t.y+=(l.y-t.y)*d,g.set(t.x,t.y);const M=(t.x-z)/Math.max(o,.001),_=(t.y-D)/Math.max(o,.001),H=Math.min(1,Math.sqrt(M*M+_*_)*.4),V=1-Math.exp(-8*o);x+=(H-x)*V,z=t.x,D=t.y;const j=1-Math.exp(-7*o);r.value+=(E-r.value)*j,s.uniforms.uTime.value=A,s.uniforms.uMousePace.value=x,i.render(c,y)}return w(),()=>{cancelAnimationFrame(h),document.removeEventListener("visibilitychange",R),window.removeEventListener("mousemove",k),window.removeEventListener("themechange",T),window.removeEventListener("resize",C),i.dispose(),n.contains(i.domElement)&&n.removeChild(i.domElement),I.dispose(),s.dispose()}},[]),B.jsx("div",{ref:a,className:"hero-canvas","aria-hidden":"true"})}export{se as default};
