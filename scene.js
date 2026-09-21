import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

function skyTexture() {
  const c = document.createElement('canvas');
  c.width = 2;
  c.height = 256;
  const x = c.getContext('2d');
  const g = x.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, '#7897b1');
  g.addColorStop(0.54, '#f4b876');
  g.addColorStop(1, '#f9d8ab');
  x.fillStyle = g;
  x.fillRect(0, 0, 2, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function createScene({ renderer }) {
  const scene = new THREE.Scene();
  const sky = skyTexture();
  scene.background = sky;
  scene.fog = new THREE.FogExp2('#edbd8c', 0.018);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(new RoomEnvironment(), 0.04);
  scene.environment = env.texture;
  scene.environmentIntensity = 0.42;

  const mats = {};
  const M = (n, c, r = 0.7, me = 0, e = 0) =>
    (mats[n] ??= new THREE.MeshStandardMaterial({
      color: c,
      roughness: r,
      metalness: me,
      emissive: e ? c : '#000',
      emissiveIntensity: e,
    }));

  const add = (g, m, p = [0, 0, 0], s = [1, 1, 1], parent = scene) => {
    const o = new THREE.Mesh(g, m);
    o.position.set(...p);
    o.scale.set(...s);
    o.castShadow = o.receiveShadow = true;
    parent.add(o);
    return o;
  };

  // ===== MÀU ĐẤT XANH TỰ NHIÊN HƠN =====
  const soil = M('soil', '#7a8f5a', 0.96);
  const edge = M('edge', '#5c7040', 0.95);
  const path = M('path', '#a68b5b', 0.98);
  const grass = M('grass', '#5e8a45', 0.9);
  const rice = M('rice', '#6f9a49', 0.8);
  const water = M('water', '#4d9492', 0.18);
  const feather = M('feather', '#fffaf0', 0.72, 0, 0.18);
  const beak = M('beak', '#c9834d', 0.75);
  const tile = M('tile', '#914d3c', 0.86);
  const oldTile = M('oldTile', '#683e35', 0.9);
  const wall = M('wall', '#d8bd91', 0.9);
  const brick = M('brick', '#a5543d', 0.92);
  const wood = M('wood', '#69442c', 0.83);
  const darkWood = M('darkWood', '#40291d', 0.85);
  const leaf = M('leaf', '#3f713e', 0.8);
  const leaf2 = M('leaf2', '#678a43', 0.82);
  const bamboo = M('bamboo', '#6d8b48', 0.83);
  const stone = M('stone', '#71726b', 0.92);
  const pot = M('pot', '#b96747', 0.8);
  const lantern = M('lantern', '#ffc76f', 0.25, 0.1, 1.6);
  const flower = M('flower', '#e8a456', 0.65);

  // Elevated island
  add(new THREE.CylinderGeometry(25.4, 27.1, 1.1, 18), edge, [0, -0.55, 0]);
  add(new THREE.CylinderGeometry(25.7, 25.7, 0.32, 18), soil, [0, 0.02, 0]);

  // ===== NÚI BAO QUANH (kiểu núi Việt Nam) =====
  const mountainMat = M('mountain', '#6b8f6a', 0.92);
  const mountainFar = M('mountainFar', '#7a9a88', 0.94);
  const mountainMist = M('mountainMist', '#9bb5a8', 0.9);

  function mountain(x, z, scale = 1, mat = mountainMat) {
    const g = new THREE.Group();
    g.position.set(x, 0.1, z);
    g.scale.setScalar(scale);
    scene.add(g);
    add(new THREE.ConeGeometry(4.2, 9.5, 7), mat, [0, 4.8, 0], [1, 1, 1], g);
    add(new THREE.ConeGeometry(2.8, 6.2, 6), mat, [3.2, 3.2, 1.5], [1, 1, 1], g);
    add(new THREE.ConeGeometry(2.4, 5.4, 6), mat, [-2.8, 2.8, -1.8], [1, 1, 1], g);
    return g;
  }

  mountain(0, -38, 2.8, mountainFar);
  mountain(32, -28, 2.4, mountainFar);
  mountain(-30, -30, 2.5, mountainFar);
  mountain(38, 8, 2.2, mountainMist);
  mountain(-36, 12, 2.3, mountainMist);
  mountain(28, 32, 2.1, mountainFar);
  mountain(-26, 34, 2.0, mountainFar);
  mountain(0, 40, 2.6, mountainMist);

  // ===== MÂY TRÔI TRÊN NÚI =====
  const cloudMat = M('cloud', '#fffaf2', 0.95, 0, 0);
  cloudMat.transparent = true;
  cloudMat.opacity = 0.88;
  cloudMat.depthWrite = false;

  function cloudCluster(x, y, z, scale = 1, puffCount = 6) {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    g.scale.setScalar(scale);
    scene.add(g);
    for (let i = 0; i < puffCount; i++) {
      const r = 0.55 + 0.45 * ((i * 37) % 5) / 4,
        px = (i - (puffCount - 1) / 2) * 0.72 + 0.22 * Math.sin(i * 3.1),
        py = 0.16 * Math.cos(i * 2.4),
        pz = 0.3 * Math.sin(i * 1.7);
      add(new THREE.SphereGeometry(r, 8, 6), cloudMat, [px, py, pz], [1, 0.62, 1], g);
    }
    return g;
  }

  const clouds = [
    [-10, 9.5, -35, 1.9, 0],
    [14, 11.5, -31, 2.3, 0.6],
    [30, 8.5, -25, 1.7, 1.2],
    [-28, 10.5, -27, 2.0, 1.9],
    [2, 14, -39, 2.6, 2.6],
    [34, 12.5, 7, 1.8, 3.3],
    [-33, 13.5, 11, 1.9, 4.0],
    [24, 10.5, 31, 1.7, 4.7],
    [-23, 11.5, 33, 1.8, 5.4],
    [3, 15, 39, 2.1, 6.1],
  ].map(([x, y, z, scale, phase]) => ({
    g: cloudCluster(x, y, z, scale),
    baseX: x,
    baseZ: z,
    speed: 0.05 + 0.03 * (phase % 3),
    phase,
  }));

  // Winding path
  function dirtPath(points, width = 0.95) {
    const samples = [];
    for (let i = 0; i < points.length - 1; i++) {
      const a = points[i],
        b = points[i + 1];
      for (let j = 0; j < 6; j++) {
        const t = j / 6,
          s = t * t * (3 - 2 * t);
        samples.push([
          THREE.MathUtils.lerp(a[0], b[0], s),
          THREE.MathUtils.lerp(a[1], b[1], s),
          width * (0.88 + 0.12 * Math.sin(i * 2.1 + j * 1.6)),
        ]);
      }
    }
    samples.push([points.at(-1)[0], points.at(-1)[1], width]);
    const vertices = [];
    samples.forEach(([x, z, w], i) => {
      const a = samples[Math.max(0, i - 1)],
        b = samples[Math.min(samples.length - 1, i + 1)],
        dx = b[0] - a[0],
        dz = b[1] - a[1],
        len = Math.hypot(dx, dz) || 1,
        nx = -dz / len,
        nz = dx / len,
        j = 0.08 * Math.sin(i * 2.7);
      vertices.push(
        x + nx * (w + j),
        0.245,
        z + nz * (w + j),
        x - nx * (w - j),
        0.245,
        z - nz * (w - j)
      );
    });
    const indices = [];
    for (let i = 0; i < samples.length - 1; i++)
      indices.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    add(geo, path);
  }

  dirtPath([[-8.1, 6.3], [-6.4, 5.4], [-6.1, 3], [-5, 0.6], [-2, -1], [0.5, 0.2], [1, 1]], 1.05);
  dirtPath([[-0.2, 0.6], [-1.2, 2.4], [-0.9, 4.6], [0.3, 6.1]], 0.7);
  dirtPath([[-2, -1], [0.9, -1.4], [1.6, -3.6], [4, -5.2], [6.5, -6], [9, -6]], 0.7);
  dirtPath([[1, 1], [4, 1.4], [7, 0.6], [9, 0], [12, -1]], 0.64);
  dirtPath([[9, -6], [10.8, -4.9], [11.9, -3], [12, -1]], 0.7);

  // Rice fields
  const swaying = [];
  const leaf3 = M('leaf3', '#57853f', 0.8);
  const plantGeos = [0, 1, 2].map((k) => new THREE.ConeGeometry(0.045, 0.42 + 0.06 * k, 5));

  function paddy(x, z, w, d) {
    add(new THREE.BoxGeometry(w, 0.12, d), rice, [x, 0.24, z]);
    add(new THREE.BoxGeometry(w - 0.42, 0.025, d - 0.42), water, [x, 0.32, z]);
    const cols = 10,
      rows = 5;
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) {
        const i = r * cols + c,
          jx = Math.sin(i * 12.9898) * 0.12,
          jz = Math.cos(i * 78.233) * 0.1,
          q = add(
            plantGeos[i % 3],
            [leaf, leaf2, leaf3][(r + c * 2) % 3],
            [
              x - w / 2 + 0.55 + (c * (w - 1.1)) / (cols - 1) + jx,
              0.53,
              z - d / 2 + 0.55 + (r * (d - 1.1)) / (rows - 1) + jz,
            ]
          );
        q.scale.y = 0.85 + (0.3 * ((i * 7) % 5)) / 4;
        q.userData.phase = i * 0.71;
        swaying.push(q);
      }
  }
  paddy(-13.2, 8.3, 7.2, 4.8);
  paddy(12.8, -9.2, 7.6, 4.9);

  // ===== KHU CHỢ PHÍA ĐÔNG =====
  const marketGroup = new THREE.Group();
  marketGroup.position.set(14, 0.28, 2);
  scene.add(marketGroup);

  function stall(x, z, rot = 0, color = '#c4a574') {
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    g.rotation.y = rot;
    marketGroup.add(g);
    add(new THREE.BoxGeometry(1.6, 0.12, 1.0), wood, [0, 0.55, 0], [1, 1, 1], g);
    add(new THREE.CylinderGeometry(0.06, 0.07, 0.55, 6), darkWood, [-0.65, 0.27, -0.35], [1, 1, 1], g);
    add(new THREE.CylinderGeometry(0.06, 0.07, 0.55, 6), darkWood, [0.65, 0.27, -0.35], [1, 1, 1], g);
    add(new THREE.CylinderGeometry(0.06, 0.07, 0.55, 6), darkWood, [-0.65, 0.27, 0.35], [1, 1, 1], g);
    add(new THREE.CylinderGeometry(0.06, 0.07, 0.55, 6), darkWood, [0.65, 0.27, 0.35], [1, 1, 1], g);
    add(new THREE.BoxGeometry(1.9, 0.08, 1.3), M('stallRoof', color, 0.85), [0, 1.35, 0], [1, 1, 1], g);
    for (const px of [-0.85, 0.85]) {
      add(new THREE.CylinderGeometry(0.04, 0.05, 1.3, 5), bamboo, [px, 0.95, -0.55], [1, 1, 1], g);
      add(new THREE.CylinderGeometry(0.04, 0.05, 1.3, 5), bamboo, [px, 0.95, 0.55], [1, 1, 1], g);
    }
    add(new THREE.SphereGeometry(0.18, 7, 5), leaf2, [-0.4, 0.75, 0.1], [1, 1, 1], g);
    add(new THREE.SphereGeometry(0.15, 7, 5), flower, [0.2, 0.72, -0.15], [1, 1, 1], g);
    add(new THREE.CylinderGeometry(0.12, 0.14, 0.22, 8), pot, [0.45, 0.7, 0.2], [1, 1, 1], g);
    return g;
  }

  stall(0, 0, 0.2, '#c4a574');
  stall(2.4, 0.8, -0.3, '#b98b5a');
  stall(1.2, -1.6, 0.5, '#d4b48a');
  stall(3.6, -0.6, -0.15, '#c4a574');

  // ---------- Birds ----------
  const TAU = Math.PI * 2,
    smooth = (t) => t * t * (3 - 2 * t),
    clamp01 = (t) => Math.max(0, Math.min(1, t)),
    wrapPi = (a) => ((((a + Math.PI) % TAU) + TAU) % TAU) - Math.PI;
  const swallow = M('swallow', '#4e463f', 0.8),
    tA = 3.6,
    tB = 9,
    tC = 2.6,
    tD = 6,
    TOT = tA + tB + tC + tD,
    REST = 1.04,
    P = {},
    Q = {};

  function wingPivot(g, mat, r, sx, sy, s, px, py, pz, ox) {
    const p = new THREE.Group();
    p.position.set(px, py, pz * s);
    g.add(p);
    add(new THREE.IcosahedronGeometry(r, 0), mat, [0, 0, ox * s], [sx, sy, 0.8], p);
    return p;
  }

  function buildEgret() {
    const g = new THREE.Group();
    g.rotation.order = 'YZX';
    g.scale.setScalar(1.35);
    scene.add(g);
    add(new THREE.SphereGeometry(0.26, 8, 6), feather, [0, 0, 0], [1.35, 0.72, 0.72], g);
    const neckPivot = new THREE.Group();
    neckPivot.position.set(0.18, 0.12, 0);
    g.add(neckPivot);
    const neck = add(new THREE.CylinderGeometry(0.055, 0.08, 0.65, 6), feather, [0.02, 0.26, 0], [1, 1, 1], neckPivot);
    neck.rotation.z = -0.2;
    add(new THREE.SphereGeometry(0.13, 7, 5), feather, [0.16, 0.61, 0], [1.1, 1, 1], neckPivot);
    const bill = add(new THREE.ConeGeometry(0.07, 0.35, 5), beak, [0.39, 0.6, 0], [1, 1, 1], neckPivot);
    bill.rotation.z = -Math.PI / 2;
    const wingL = wingPivot(g, feather, 0.18, 1.5, 0.25, 1, -0.1, 0.14, 0.1, 0.14),
      wingR = wingPivot(g, feather, 0.18, 1.5, 0.25, -1, -0.1, 0.14, 0.1, 0.14);
    const leg = (s) => {
      const p = new THREE.Group();
      p.position.set(0, -0.1, s * 0.07);
      g.add(p);
      add(new THREE.CylinderGeometry(0.018, 0.025, 0.42, 5), beak, [0, -0.21, 0], [1, 1, 1], p);
      return p;
    };
    return { g, neckPivot, wingL, wingR, legL: leg(1), legR: leg(-1) };
  }

  function buildSmall(sc = 1.45) {
    const g = new THREE.Group();
    g.rotation.order = 'YZX';
    g.scale.setScalar(sc);
    scene.add(g);
    add(new THREE.IcosahedronGeometry(0.12, 0), swallow, [0, 0, 0], [1.4, 0.7, 0.7], g);
    add(new THREE.ConeGeometry(0.035, 0.12, 4), beak, [0.19, 0, 0], [1, 1, 1], g).rotation.z = -Math.PI / 2;
    return {
      g,
      wingL: wingPivot(g, swallow, 0.1, 1.8, 0.18, 1, -0.08, 0.02, 0.06, 0.09),
      wingR: wingPivot(g, swallow, 0.1, 1.8, 0.18, -1, -0.08, 0.02, 0.06, 0.09),
    };
  }

  function egretPose(e, t, o) {
    let c = (((t + e.off) % TOT) + TOT) % TOT;
    o.dip = 0;
    o.walk = 0;
    o.mv = 0;
    if (c < tA) {
      const u = c / tA,
        p = 1 - (1 - u) * (1 - u),
        q = smooth(u);
      o.x = e.sx + (e.l1x - e.sx) * p;
      o.z = e.sz + (e.l1z - e.sz) * p;
      o.y = e.H + (REST - e.H) * q;
      o.m = 0;
      return o;
    }
    c -= tA;
    if (c < tB) {
      const w = c / tB,
        k = 3,
        ph = TAU * k * w,
        pr = w - (0.9 * Math.sin(ph)) / (TAU * k),
        sp = 1 - 0.9 * Math.cos(ph),
        env = smooth(clamp01((w - 0.04) * 10)) * (1 - smooth(clamp01((w - 0.88) * 10))),
        mv = clamp01(sp - 0.2) * env;
      o.x = e.l1x + (e.l2x - e.l1x) * pr;
      o.z = e.l1z + (e.l2z - e.l1z) * pr;
      o.y = REST + 0.02 * Math.abs(Math.sin(pr * e.dist * 3.2)) * mv;
      o.m = 1;
      o.walk = pr * e.dist;
      o.mv = mv;
      o.dip = env * Math.pow((1 + Math.cos(ph)) / 2, 2) * (0.85 + 0.15 * Math.sin(c * 11));
      return o;
    }
    c -= tB;
    if (c < tC) {
      const u = c / tC,
        p = u * u,
        q = 1 - (1 - u) * (1 - u);
      o.x = e.l2x + (e.tx - e.l2x) * p;
      o.z = e.l2z + (e.tz - e.l2z) * p;
      o.y = REST + (e.H - REST) * q;
      o.m = 2;
      return o;
    }
    c -= tC;
    const s = c / tD,
      a = e.th0 + e.dir * 1.4 * Math.PI * s;
    o.x = e.ccx + e.R * Math.cos(a);
    o.z = e.ccz + e.R * Math.sin(a);
    o.y = e.H + 0.5 * Math.sin(Math.PI * s);
    o.m = 3;
    return o;
  }

  const fields = [
    { cx: -13.2, cz: 8.3, hx: 2.8, hz: 1.7 },
    { cx: 12.8, cz: -9.2, hx: 3, hz: 1.75 },
  ];

  const egrets = [
    [0, -0.8, 0.3, 0.1, 0.32, 0, 1, 6.5, 4.6, 0.2],
    [0, 0.7, 0.62, -0.6, 0.6, 7.1, -1, 7.2, 5.4, 2.6],
    [0, -0.5, 0.92, 0.6, 0.9, 14.2, 1, 6, 4.2, 4.4],
    [1, 0.8, 0.3, -0.1, 0.32, 3.5, -1, 6.5, 4.8, 1],
    [1, -0.7, 0.68, 0.6, 0.66, 10.6, 1, 7, 5.2, 3.6],
    [1, 0.3, 0.95, -0.7, 0.9, 17.7, -1, 6.2, 4.4, 5.3],
  ].map(([f, u1, v1, u2, v2, off, dir, R, H, th0]) => {
    const F = fields[f],
      L = Math.hypot(F.cx, F.cz),
      ccx = F.cx + (F.cx / L) * 2,
      ccz = F.cz + (F.cz / L) * 2,
      aS = th0 + dir * 1.4 * Math.PI,
      e = {
        ...buildEgret(),
        off,
        dir,
        R,
        H,
        th0,
        ccx,
        ccz,
        l1x: F.cx + u1 * F.hx,
        l1z: F.cz + v1 * F.hz,
        l2x: F.cx + u2 * F.hx,
        l2z: F.cz + v2 * F.hz,
        hd: 0,
        bank: 0,
        pitch: 0,
      };
    e.dist = Math.hypot(e.l2x - e.l1x, e.l2z - e.l1z);
    e.tx = ccx + R * Math.cos(th0);
    e.tz = ccz + R * Math.sin(th0);
    e.sx = ccx + R * Math.cos(aS);
    e.sz = ccz + R * Math.sin(aS);
    return e;
  });

  function updateEgret(e, dt) {
    egretPose(e, time, P);
    egretPose(e, time + 0.1, Q);
    const vx = (Q.x - P.x) / 0.1,
      vy = (Q.y - P.y) / 0.1,
      vz = (Q.z - P.z) / 0.1,
      sp = Math.hypot(vx, vz);
    if (sp > 0.2) e.hd = Math.atan2(-vz, vx);
    if (e.yaw === undefined) e.yaw = e.hd;
    e.yaw += wrapPi(e.hd - e.yaw) * (1 - Math.exp(-dt * (P.m === 1 ? 2.5 : 5)));
    const air = clamp01((P.y - REST) / 0.7),
      k = 1 - Math.exp(-dt * 3);
    e.pitch +=
      (air * THREE.MathUtils.clamp(Math.atan2(vy, Math.max(sp, 0.5)) * 0.9, -0.6, 0.6) - e.pitch) * k;
    e.bank += ((P.m === 3 ? e.dir * 0.3 : 0) * air - e.bank) * k;
    const g = e.g;
    g.position.set(P.x, P.y, P.z);
    g.rotation.set(e.bank, e.yaw, e.pitch);
    e.neckPivot.rotation.z = -P.dip * 1.9 * (1 - air) - 0.5 * air;
    const sw = Math.sin(P.walk * 3.2) * 0.55 * P.mv;
    e.legL.rotation.z = -air + (1 - air) * sw;
    e.legR.rotation.z = -air - (1 - air) * sw;
    const f = Math.sin(time * (P.m === 3 ? 7 : 11) + e.off) * (P.m === 3 ? 0.45 : 0.75);
    e.wingL.rotation.x = (1 - air) * 0.55 - air * f;
    e.wingR.rotation.x = -(1 - air) * 0.55 + air * f;
  }

  const flock = (n, cx, cz, rx, rz, w, ph, h) =>
    Array.from({ length: n }, (_, i) => [
      cx,
      cz,
      rx + ((i % 3) - 1) * 0.9,
      rz + ((i % 3) - 1) * 0.7,
      w,
      ph - i * 0.11,
      h + (i % 2) * 0.7 - i * 0.12,
      0.8,
      2.1,
    ]);

  const smallBirds = [
    ...flock(6, 0, 0, 20, 17, 0.2, 0, 10.5),
    ...flock(4, 0, 0, 14, 12, -0.24, 2.4, 8.6),
    [0, 0, 12, 9, 0.32, 0, 7.2, 0.7, 1.6],
    [-3, -2, 8, 6.5, -0.42, 2, 6.2, 0.6, 1.6],
    [-13, 8, 6.5, 4.2, 0.5, 4, 5.4, 0.5, 1.5],
    [12.5, -9, 6.8, 4.5, -0.45, 1, 5.8, 0.5, 1.5],
  ].map(([cx, cz, rx, rz, w, ph, h, ha, sc = 1.5]) => ({
    ...buildSmall(sc),
    cx,
    cz,
    rx,
    rz,
    w,
    ph,
    h,
    ha,
  }));

  const smallPos = (b, t, o) => {
    const a = b.w * t + b.ph;
    o.x = b.cx + b.rx * Math.cos(a);
    o.z = b.cz + b.rz * Math.sin(a);
    o.y = b.h + b.ha * Math.sin(a * 2.3 + b.ph);
    return o;
  };

  function updateSmall(b) {
    smallPos(b, time, P);
    smallPos(b, time + 0.1, Q);
    const vx = (Q.x - P.x) / 0.1,
      vy = (Q.y - P.y) / 0.1,
      vz = (Q.z - P.z) / 0.1,
      sp = Math.hypot(vx, vz);
    b.g.position.set(P.x, P.y, P.z);
    b.g.rotation.set(
      Math.sign(b.w) * 0.3,
      Math.atan2(-vz, vx),
      THREE.MathUtils.clamp(Math.atan2(vy, sp) * 0.9, -0.5, 0.5)
    );
    const f = Math.sin(time * 15 + b.ph) * (0.25 + 0.45 * Math.max(0, Math.sin(time * 0.9 + b.ph * 1.7)));
    b.wingL.rotation.x = -f;
    b.wingR.rotation.x = f;
  }

  // ---------- Villagers & livestock ----------
  const skin = M('skin', '#c98f62', 0.85),
    strawHat = M('strawHat', '#e6cd8e', 0.8),
    shirtA = M('shirtA', '#7b5a3c', 0.85),
    shirtB = M('shirtB', '#3f5a70', 0.85),
    shirtC = M('shirtC', '#8a6f4b', 0.85),
    trouser = M('trouser', '#3a2f2a', 0.9),
    hay = M('hay', '#d3ae5f', 0.85),
    cowHide = M('cowHide', '#b9874f', 0.88),
    cowLeg = M('cowLeg', '#a67744', 0.9),
    buffHide = M('buffalo', '#353b38', 0.9),
    buffHead = M('buffaloHead', '#303532', 0.9),
    buffLeg = M('buffaloLeg', '#272b29', 0.95),
    horn = M('horn', '#e6dcc2', 0.6),
    muzzle = M('muzzle', '#5b524b', 0.9),
    hoof = M('hoof', '#2b211b', 0.9),
    V1 = new THREE.Vector3(),
    V2 = new THREE.Vector3(),
    V3 = new THREE.Vector3();

  function buildPerson(shirt, sc = 0.8) {
    const g = new THREE.Group();
    g.scale.setScalar(sc);
    scene.add(g);
    const leg = (s) => {
      const q = new THREE.Group();
      q.position.set(0, 0.62, s * 0.09);
      g.add(q);
      add(new THREE.CylinderGeometry(0.05, 0.06, 0.62, 6), trouser, [0, -0.31, 0], [1, 1, 1], q);
      return q;
    };
    const hip = new THREE.Group();
    hip.position.set(0, 0.62, 0);
    g.add(hip);
    add(new THREE.BoxGeometry(0.22, 0.5, 0.32), shirt, [0, 0.27, 0], [1, 1, 1], hip);
    add(new THREE.SphereGeometry(0.12, 8, 6), skin, [0.03, 0.66, 0], [1, 1.05, 1], hip);
    add(new THREE.ConeGeometry(0.42, 0.2, 10), strawHat, [0.02, 0.83, 0], [1, 1, 1], hip);
    const arm = (s) => {
      const q = new THREE.Group();
      q.position.set(0, 0.47, s * 0.19);
      hip.add(q);
      add(new THREE.CylinderGeometry(0.04, 0.045, 0.5, 6), shirt, [0, -0.24, 0], [1, 1, 1], q);
      add(new THREE.SphereGeometry(0.05, 6, 5), skin, [0, -0.5, 0], [1, 1, 1], q);
      return q;
    };
    return { g, hip, legL: leg(1), legR: leg(-1), armL: arm(1), armR: arm(-1) };
  }

  function buildAnimal({ body, head, leg, scale, big }) {
    const g = new THREE.Group();
    g.scale.setScalar(scale);
    scene.add(g);
    add(new THREE.SphereGeometry(0.82, 10, 7), body, [0, 0, 0], [1.45, 0.72, 0.75], g);
    if (!big) add(new THREE.SphereGeometry(0.32, 7, 6), body, [0.55, 0.5, 0], [1, 0.9, 0.9], g);
    const neck = new THREE.Group();
    neck.position.set(0.9, 0.14, 0);
    g.add(neck);
    add(new THREE.SphereGeometry(0.32, 8, 6), body, [0.22, 0, 0], [1.3, 0.85, 0.85], neck);
    add(new THREE.SphereGeometry(0.3, 9, 7), head, [0.62, -0.1, 0], [1.25, 0.9, 0.8], neck);
    add(new THREE.SphereGeometry(0.17, 7, 6), muzzle, [0.92, -0.2, 0], [1, 0.8, 0.9], neck);
    for (const s of [1, -1]) {
      add(new THREE.ConeGeometry(big ? 0.07 : 0.045, big ? 0.55 : 0.25, 5), horn, [0.5, 0.2, s * 0.26], [1, 1, 1], neck).rotation.set(
        s * (big ? 1.05 : 0.75),
        0,
        big ? 0.5 : 0.15
      );
      add(new THREE.SphereGeometry(0.1, 6, 5), head, [0.45, 0.08, s * 0.36], [1.3, 0.5, 0.7], neck);
    }
    const legs = [
      [0.6, 0.32],
      [0.6, -0.32],
      [-0.6, 0.32],
      [-0.6, -0.32],
    ].map(([x, z]) => {
      const q = new THREE.Group();
      q.position.set(x, -0.22, z);
      g.add(q);
      add(new THREE.CylinderGeometry(0.09, 0.075, 0.78, 6), leg, [0, -0.39, 0], [1, 1, 1], q);
      add(new THREE.CylinderGeometry(0.085, 0.09, 0.1, 6), hoof, [0, -0.75, 0], [1, 1, 1], q);
      return q;
    });
    const tail = new THREE.Group();
    tail.position.set(-1.15, 0.2, 0);
    g.add(tail);
    add(new THREE.ConeGeometry(0.05, 0.65, 5), leg, [0, -0.32, 0], [1, 1, 1], tail);
    return { g, neck, legs, tail };
  }

  const stride = (a, gp, amp) =>
    a.legs.forEach((l, i) => (l.rotation.z = Math.sin(gp + (i === 1 || i === 2 ? Math.PI : 0)) * amp));

  // Planters
  const PL_T = 26,
    PL_TT = 2.2,
    PL_LEG = PL_T + PL_TT,
    PL_TOT = 2 * PL_LEG;
  const planters = [
    [-15.7, -12.4, 6.75, 0, shirtA],
    [-15.4, -12.5, 7.7, 19, shirtC],
    [10.2, 13.9, -10.6, 11, shirtB],
  ].map(([x0, x1, z, off, sh]) => {
    const q = buildPerson(sh);
    add(new THREE.ConeGeometry(0.06, 0.3, 5), leaf2, [0.03, -0.6, 0], [1, 1, 1], q.armL);
    return { ...q, x0, x1, z, off };
  });

  function updatePlanter(q) {
    const c = (((time + q.off) % PL_TOT) + PL_TOT) % PL_TOT,
      leg = c < PL_LEG ? 0 : 1,
      cc = c - leg * PL_LEG,
      a = leg ? q.x1 : q.x0,
      b = leg ? q.x0 : q.x1;
    let x = b,
      yaw,
      bend = 0.12,
      phi = 0,
      env = 0,
      mv = 0;
    if (cc < PL_T) {
      const w = cc / PL_T,
        k = 15;
      phi = TAU * k * w;
      const pr = w - (0.85 * Math.sin(phi)) / (TAU * k);
      x = a + (b - a) * pr;
      env = smooth(clamp01(cc)) * (1 - smooth(clamp01(cc - (PL_T - 1))));
      bend = 0.12 + 1.18 * env;
      mv = env * clamp01(1 - 0.85 * Math.cos(phi) - 0.2);
      yaw = leg ? 0 : Math.PI;
    } else {
      const u = smooth((cc - PL_T) / PL_TT);
      yaw = leg ? Math.PI * u : Math.PI + Math.PI * u;
    }
    q.g.position.set(x, 0.3, q.z);
    q.g.rotation.y = yaw;
    q.hip.rotation.z = -bend;
    q.armR.rotation.z = bend + 0.35 * Math.cos(phi) * env - 0.2;
    q.armL.rotation.z = bend + 0.12 + 0.08 * Math.sin(phi) * env;
    const sw = Math.sin(phi * 0.5) * 0.38 * mv;
    q.legL.rotation.z = -sw;
    q.legR.rotation.z = sw;
  }

  // Puller
  const puller = (() => {
    const q = buildPerson(shirtA),
      b = add(new THREE.ConeGeometry(0.07, 0.34, 5), leaf2, [0.04, -0.62, 0], [1, 1, 1], q.armR);
    for (let i = 0; i < 3; i++)
      add(new THREE.CylinderGeometry(0.09, 0.09, 0.5, 6), leaf, [16.15, 0.42 + 0.0 * i, -11.05 + i * 0.17], [1, 1, 1]).rotation.x =
        Math.PI / 2;
    return { ...q, b, x: 15.4, z: -10.4, yaw: Math.PI };
  })();

  function updatePuller(q) {
    const T = 3.4,
      u = (((time % T) + T) % T) / T,
      B = 0.8 + 0.5 * Math.cos(TAU * u),
      sh = u > 0.5 && u < 0.82 ? Math.sin(smooth((u - 0.5) / 0.32) * Math.PI) * 0.4 * Math.sin(u * TAU * 9) : 0,
      ar = B + 0.2 * Math.cos(TAU * u) - 0.15 + sh;
    q.g.position.set(q.x, 0.3, q.z);
    q.g.rotation.y = q.yaw;
    q.hip.rotation.z = -B;
    q.armR.rotation.z = ar;
    q.armL.rotation.z = ar;
    q.legL.rotation.z = 0.08;
    q.legR.rotation.z = -0.08;
    q.b.scale.set(1, Math.max(smooth(clamp01((u - 0.05) / 0.3)) * (1 - smooth(clamp01((u - 0.86) / 0.12))), 0.001), 1);
  }

  // ===== KHU CHỢ MIỀN TÂY (phía Tây) - chợ quê sông nước Đồng bằng sông Cửu Long =====
  const WM_X = -11,
    WM_Z = -1.5;
  const westMarketGroup = new THREE.Group();
  westMarketGroup.position.set(WM_X, 0.28, WM_Z);
  scene.add(westMarketGroup);

  const fruitYellow = M('fruitYellow', '#e8c34a', 0.55);
  const fruitGreen = M('fruitGreen', '#8ab84a', 0.55);
  const fruitRed = M('fruitRed', '#c8503f', 0.55);
  const fruitOrange = M('fruitOrange', '#e08a3a', 0.55);
  const fishSilver = M('fishSilver', '#a8b3ad', 0.35, 0.4);
  const riceSack = M('riceSack', '#e2d9c0', 0.9);
  const basketMat = M('basketMat', '#8a6a3f', 0.85);
  const clayPot = M('clayPot', '#a85f3d', 0.8);
  const tarpBlue = M('tarpBlue', '#3d6d8a', 0.6);
  const tarpRed = M('tarpRed', '#a8433a', 0.6);
  const tarpYellow = M('tarpYellow', '#d9a83f', 0.6);

  function westStall(x, z, rot, tarpMat, goods) {
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    g.rotation.y = rot;
    westMarketGroup.add(g);
    add(new THREE.BoxGeometry(1.9, 0.1, 1.1), wood, [0, 0.58, 0], [1, 1, 1], g);
    for (const [lx, lz] of [[-0.8, -0.4], [0.8, -0.4], [-0.8, 0.4], [0.8, 0.4]])
      add(new THREE.CylinderGeometry(0.045, 0.055, 0.58, 6), bamboo, [lx, 0.29, lz], [1, 1, 1], g);
    const roof = add(new THREE.BoxGeometry(2.25, 0.05, 1.55), tarpMat, [0, 1.5, -0.12], [1, 1, 1], g);
    roof.rotation.x = -0.14;
    for (const px of [-0.95, 0.95]) {
      add(new THREE.CylinderGeometry(0.035, 0.045, 1.5, 5), bamboo, [px, 1.02, -0.5], [1, 1, 1], g);
      add(new THREE.CylinderGeometry(0.035, 0.045, 1.15, 5), bamboo, [px, 0.85, 0.45], [1, 1, 1], g);
    }
    if (goods === 'fruit') {
      const fm = [fruitYellow, fruitGreen, fruitRed, fruitOrange];
      for (let i = 0; i < 16; i++)
        add(
          new THREE.SphereGeometry(0.08 + 0.02 * (i % 3), 7, 6),
          fm[i % 4],
          [-0.72 + (i % 8) * 0.2, 0.67 + 0.06 * Math.floor(i / 8), -0.28 + 0.32 * (i % 2)],
          [1, 1, 1],
          g
        );
      add(new THREE.CylinderGeometry(0.26, 0.2, 0.3, 10, 1, true), basketMat, [0.6, 0.34, 0.3], [1, 1, 1], g);
    } else if (goods === 'vegetable') {
      for (let i = 0; i < 10; i++)
        add(new THREE.ConeGeometry(0.05, 0.26, 5), leaf2, [-0.62 + i * 0.14, 0.72, -0.2 + 0.06 * (i % 3)], [1, 1, 1], g);
      add(new THREE.CylinderGeometry(0.24, 0.19, 0.28, 10, 1, true), basketMat, [0.55, 0.33, 0.25], [1, 1, 1], g);
    } else if (goods === 'fish') {
      add(new THREE.CylinderGeometry(0.5, 0.5, 0.07, 16), stone, [0, 0.63, 0], [1, 1, 0.6], g);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        add(new THREE.SphereGeometry(0.09, 6, 5), fishSilver, [Math.cos(a) * 0.32, 0.69, Math.sin(a) * 0.19], [1.9, 0.5, 0.6], g).rotation.y = a;
      }
    } else if (goods === 'rice') {
      for (let i = 0; i < 3; i++)
        add(new RoundedBoxGeometry(0.34, 0.5, 0.34, 3, 0.05), riceSack, [-0.5 + i * 0.42, 0.83, 0], [1, 1, 1], g);
      add(new THREE.CylinderGeometry(0.24, 0.27, 0.3, 10), clayPot, [0.62, 0.33, 0.25], [1, 1, 1], g);
    } else if (goods === 'pottery') {
      for (let i = 0; i < 5; i++)
        add(
          new THREE.CylinderGeometry(0.09 + 0.03 * (i % 3), 0.13, 0.24 + 0.08 * (i % 3), 8),
          clayPot,
          [-0.62 + i * 0.28, 0.61 + 0.1 * (i % 3), 0],
          [1, 1, 1],
          g
        );
    }
    return g;
  }

  westStall(-1.6, 0, 0.32, tarpBlue, 'fruit');
  westStall(1.5, 1.3, -0.22, tarpRed, 'vegetable');
  westStall(0.1, 2.7, 0.16, tarpYellow, 'fish');
  westStall(-1.9, 2.5, -0.28, tarpBlue, 'rice');
  westStall(2.3, -1.5, 0.4, tarpRed, 'pottery');

  // Thương nhân đứng bán hàng tại từng quầy
  const westMerchants = [
    [-1.6, -0.75, shirtA],
    [1.5, 0.55, shirtB],
    [0.1, 1.95, shirtC],
    [-1.9, 1.75, shirtA],
    [2.3, -2.25, shirtB],
  ].map(([lx, lz, shirt]) => {
    const p = buildPerson(shirt, 0.76);
    p.g.position.set(WM_X + lx, 0.3, WM_Z + lz);
    p.g.rotation.y = Math.PI;
    p.legL.rotation.z = 0.05;
    p.legR.rotation.z = -0.05;
    return p;
  });

  // Thuyền chở trái cây kiểu chợ nổi miền Tây (tiểu cảnh trang trí cạnh chợ)
  function sampanBoat(x, z, rot = 0) {
    const g = new THREE.Group();
    g.position.set(x, 0.3, z);
    g.rotation.y = rot;
    scene.add(g);
    add(new RoundedBoxGeometry(2.5, 0.32, 0.72, 4, 0.14), darkWood, [0, 0, 0], [1, 1, 1], g);
    const fm = [fruitYellow, fruitGreen, fruitRed, fruitOrange];
    for (let i = 0; i < 12; i++)
      add(new THREE.SphereGeometry(0.1, 6, 5), fm[i % 4], [-0.85 + i * 0.16, 0.22, 0.18 * Math.sin(i * 1.3)], [1, 1, 1], g);
    return g;
  }
  sampanBoat(WM_X - 2.5, WM_Z - 3, 0.5);

  // Thêm người dân sinh hoạt rải rác quanh làng
  function idleVillager(x, z, shirt, rotY = 0, scale = 0.78) {
    const p = buildPerson(shirt, scale);
    p.g.position.set(x, 0.3, z);
    p.g.rotation.y = rotY;
    return p;
  }
  const idleVillagers = [
    idleVillager(-3.9, 4.3, shirtC, 0.4),
    idleVillager(9.6, 5.9, shirtA, -1.2),
    idleVillager(-9.8, -4.5, shirtB, 2.1),
    idleVillager(6.8, -2.4, shirtC, -0.6),
    idleVillager(WM_X + 3.2, WM_Z + 0.4, shirtA, 1.1),
  ];

  // Ox cart
  const loopCurve = new THREE.CatmullRomCurve3(
    [
      [-2, -1],
      [0.9, -1.4],
      [1.6, -3.6],
      [4, -5.2],
      [6.5, -6],
      [9, -6],
      [10.8, -4.9],
      [11.9, -3],
      [12, -1],
      [9, 0],
      [7, 0.6],
      [4, 1.4],
      [1.8, 1.1],
      [0.5, 0.3],
      [-0.8, -0.35],
    ].map(([x, z]) => new THREE.Vector3(x, 0, z)),
    true,
    'centripetal'
  );
  const LL = loopCurve.getLength(),
    CART_D = 2.8,
    CART_V = 0.9;
  const cow = buildAnimal({ body: cowHide, head: cowHide, leg: cowLeg, scale: 0.72, big: false }),
    cart = new THREE.Group();
  scene.add(cart);
  add(new THREE.BoxGeometry(1.5, 0.09, 1), wood, [0, 0.66, 0], [1, 1, 1], cart);
  for (const z of [-0.5, 0.5]) add(new THREE.BoxGeometry(1.5, 0.16, 0.06), wood, [0, 0.79, z], [1, 1, 1], cart);
  add(new THREE.BoxGeometry(0.06, 0.16, 1), wood, [-0.75, 0.79, 0], [1, 1, 1], cart);
  add(new RoundedBoxGeometry(1, 0.52, 0.86, 3, 0.1), hay, [-0.3, 1.02, 0], [1, 1, 1], cart);
  for (const x of [-0.55, -0.05]) add(new THREE.BoxGeometry(0.05, 0.56, 0.9), darkWood, [x, 1.02, 0], [1, 1, 1], cart);
  add(new THREE.CylinderGeometry(0.04, 0.04, 1.4, 6), darkWood, [0, 0.42, 0], [1, 1, 1], cart).rotation.x = Math.PI / 2;
  for (const z of [-0.52, 0.52]) add(new THREE.BoxGeometry(2.7, 0.07, 0.07), wood, [1.95, 0.78, z], [1, 1, 1], cart).rotation.z = 0.12;
  add(new THREE.BoxGeometry(0.09, 0.09, 1.1), darkWood, [3.25, 0.96, 0], [1, 1, 1], cart);
  const wheels = [1, -1].map((s) => {
    const w = new THREE.Group();
    w.position.set(0, 0.42, s * 0.66);
    cart.add(w);
    add(new THREE.TorusGeometry(0.4, 0.045, 5, 14), wood, [0, 0, 0], [1, 1, 1], w);
    for (const r of [0, Math.PI / 4, Math.PI / 2, Math.PI * 0.75])
      add(new THREE.BoxGeometry(0.8, 0.045, 0.06), darkWood, [0, 0, 0], [1, 1, 1], w).rotation.z = r;
    add(new THREE.CylinderGeometry(0.08, 0.08, 0.12, 8), darkWood, [0, 0, 0], [1, 1, 1], w).rotation.x = Math.PI / 2;
    return w;
  });
  const driver = buildPerson(shirtB);
  cart.add(driver.g);
  driver.g.position.set(0.3, 0.254, 0);
  driver.legL.rotation.z = driver.legR.rotation.z = 1.45;

  function updateCart() {
    const d = time * CART_V,
      u = (d / LL) % 1,
      uc = (((d - CART_D) / LL) % 1 + 1) % 1;
    loopCurve.getPointAt(u, V1);
    loopCurve.getTangentAt(u, V2);
    loopCurve.getPointAt(uc, V3);
    const gp = d * 5;
    cow.g.position.set(V1.x, 0.245 + 0.72 + Math.sin(gp * 2) * 0.01, V1.z);
    cow.g.rotation.y = Math.atan2(-V2.z, V2.x);
    stride(cow, gp, 0.45);
    cow.neck.rotation.z = -0.1 + 0.06 * Math.sin(gp + 1);
    cow.tail.rotation.x = 0.3 * Math.sin(d * 1.7);
    cow.tail.rotation.z = 0.12;
    cart.position.set(V3.x, 0.245 + Math.abs(Math.sin(d * 3.3)) * 0.012, V3.z);
    cart.rotation.y = Math.atan2(-(V1.z - V3.z), V1.x - V3.x);
    for (const w of wheels) w.rotation.z = -d / 0.42;
    driver.hip.rotation.z = 0.04 + 0.03 * Math.sin(gp);
    driver.armR.rotation.z = 1.25 + 0.06 * Math.sin(gp * 0.5);
    driver.armL.rotation.z = 1;
  }

  // Water buffalo
  add(new THREE.CylinderGeometry(1, 1, 0.05, 24), grass, [-8, 0.225, -7.2], [3.9, 1, 2.5]);
  const graze = {
    ...buildAnimal({ body: buffHide, head: buffHead, leg: buffLeg, scale: 0.8, big: true }),
    cx: -8,
    cz: -7.2,
    rx: 2.6,
    rz: 1.1,
    T: 80,
    k: 4,
    a0: 0.5,
    dir: 1,
    off: 0,
    gp: 0,
    gy: 0.25,
    sc: 0.8,
    hd: 0,
  };

  function grazePos(a, t, o) {
    const w = (t + a.off) / a.T,
      pr = w - (0.8 * Math.sin(TAU * a.k * w)) / (TAU * a.k),
      an = a.a0 + a.dir * TAU * pr;
    o.x = a.cx + a.rx * Math.cos(an);
    o.z = a.cz + a.rz * Math.sin(an);
    o.w = w;
    return o;
  }

  function updateGrazer(a, dt) {
    grazePos(a, time, P);
    grazePos(a, time + 0.1, Q);
    const vx = (Q.x - P.x) / 0.1,
      vz = (Q.z - P.z) / 0.1,
      sp = Math.hypot(vx, vz);
    if (sp > 0.03) a.hd = Math.atan2(-vz, vx);
    if (a.yaw === undefined) a.yaw = a.hd;
    a.yaw += wrapPi(a.hd - a.yaw) * (1 - Math.exp(-dt * 2.5));
    const mv = clamp01(sp / 0.3);
    a.gp += sp * dt * 9;
    const pf = Math.pow((1 + Math.cos(TAU * a.k * P.w)) / 2, 2);
    a.g.position.set(P.x, a.gy + a.sc + Math.abs(Math.sin(a.gp)) * 0.015 * mv, P.z);
    a.g.rotation.y = a.yaw;
    a.neck.rotation.z = -0.1 - 1.3 * pf;
    stride(a, a.gp, 0.42 * mv);
    a.tail.rotation.x = 0.25 * Math.sin(time * 2.1);
    a.tail.rotation.z = 0.1 + 0.06 * Math.sin(time * 3);
  }

  // ===== WALKERS: nhà ↔ chợ =====
  const walkers = [];

  function createWalker(pathPoints, speed = 0.35, shirt = shirtA, scale = 0.78) {
    const person = buildPerson(shirt, scale);
    const curve = new THREE.CatmullRomCurve3(
      pathPoints.map(([x, z]) => new THREE.Vector3(x, 0, z)),
      false,
      'centripetal'
    );
    const len = curve.getLength();
    walkers.push({ person, curve, len, speed, t: Math.random(), dir: 1 });
    return person;
  }

  createWalker([[-2.4, -3.1], [1, -1], [6, 0.5], [12, 1.5], [14, 2]], 0.32, shirtA);
  createWalker([[4.1, -1.2], [7, 0], [11, 1.2], [14, 2.2]], 0.28, shirtB);
  createWalker([[-7.6, -2], [-3, -1], [2, 0.5], [8, 1.5], [13.5, 2]], 0.3, shirtC);
  createWalker([[18, 4], [15, 3], [12, 2], [8, 1], [4.1, -1.2]], 0.27, shirtA);
  createWalker([[16, -3], [12, -2], [8, -1.5], [4, -1.5], [-2.4, -3.1]], 0.29, shirtB);

  function updateWalkers(dt) {
    for (const w of walkers) {
      w.t += (w.speed * dt * w.dir) / w.len;
      if (w.t > 1) {
        w.t = 1;
        w.dir = -1;
      }
      if (w.t < 0) {
        w.t = 0;
        w.dir = 1;
      }
      const pos = w.curve.getPointAt(w.t);
      const tangent = w.curve.getTangentAt(w.t);
      w.person.g.position.set(pos.x, 0.3, pos.z);
      w.person.g.rotation.y = Math.atan2(-tangent.z * w.dir, tangent.x * w.dir);
      const phase = time * 8 + w.t * 20;
      const swing = Math.sin(phase) * 0.55;
      w.person.legL.rotation.z = swing;
      w.person.legR.rotation.z = -swing;
      w.person.armL.rotation.z = -swing * 0.6;
      w.person.armR.rotation.z = swing * 0.6;
    }
  }

  function scarecrow(x, z, rotation = 0) {
    const g = new THREE.Group();
    g.position.set(x, 0.28, z);
    g.rotation.y = rotation;
    scene.add(g);
    add(new THREE.CylinderGeometry(0.08, 0.11, 2.35, 6), wood, [0, 1.18, 0], [1, 1, 1], g);
    const arms = add(new THREE.CylinderGeometry(0.06, 0.08, 1.5, 6), wood, [0, 1.66, 0], [1, 1, 1], g);
    arms.rotation.z = Math.PI / 2;
    add(new THREE.SphereGeometry(0.29, 8, 6), flower, [0, 2.48, 0], [1, 1.1, 1], g);
    add(new THREE.ConeGeometry(0.4, 0.25, 5), rice, [0, 2.8, 0], [1, 1, 1], g);
  }

  function hayBale(x, z, scale = 1) {
    const g = new THREE.Group();
    g.position.set(x, 0.28, z);
    g.rotation.y = 0.18;
    g.scale.setScalar(scale);
    scene.add(g);
    add(new RoundedBoxGeometry(1.3, 0.82, 0.95, 3, 0.08), rice, [0, 0.42, 0], [1, 1, 1], g);
    for (let i = -1; i <= 1; i++) add(new THREE.BoxGeometry(0.045, 0.88, 0.98), flower, [i * 0.28, 0.42, 0], [1, 1, 1], g);
  }

  scarecrow(-11.2, 7, 0.2);
  scarecrow(11.4, -8.4, -0.35);
  hayBale(-1.2, 7.9, 0.9);
  hayBale(8, -7.6, 0.82);
  hayBale(-8.5, 7.4, 0.72);

  // Lake
  const lakeShape = new THREE.Shape();
  [
    [-5, -1],
    [-3, -3],
    [1, -3.5],
    [4, -2.3],
    [5, 0.2],
    [3.3, 2.8],
    [-0.4, 3.6],
    [-3.8, 2.4],
  ].forEach((v, i) => (i ? lakeShape.lineTo(...v) : lakeShape.moveTo(...v)));
  lakeShape.closePath();
  const lakeGeo = new THREE.ShapeGeometry(lakeShape);
  const lakeBank = add(lakeGeo, stone, [16, 0.24, 11]);
  lakeBank.rotation.x = -Math.PI / 2;
  const lake = add(lakeGeo, water, [16, 0.34, 11], [0.93, 0.93, 0.93]);
  lake.rotation.x = -Math.PI / 2;
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * Math.PI * 2,
      r = 3.4 + (i % 3) * 0.45;
    add(new THREE.DodecahedronGeometry(0.16 + (i % 2) * 0.1), stone, [16 + Math.cos(a) * r, 0.42, 11 + Math.sin(a) * r * 0.72], [1, 0.55, 1]);
    if (i % 2 === 0) {
      add(new THREE.ConeGeometry(0.05, 0.55, 5), bamboo, [16 + Math.cos(a) * r * 0.93, 0.63, 11 + Math.sin(a) * r * 0.68]);
      add(new THREE.SphereGeometry(0.14, 8, 6), leaf2, [16 + Math.cos(a) * r * 0.85, 0.48, 11 + Math.sin(a) * r * 0.58], [1, 0.16, 1]);
    }
  }
  for (const h of [
    [-12, 0.04, 13, 5, 1.1, 3.5],
    [10, 0.05, -13, 6, 0.9, 4],
    [-2, 0.03, 16, 5, 0.8, 3],
    [17, 0.02, 2, 5, 0.7, 4],
  ])
    add(new THREE.SphereGeometry(1, 16, 8), grass, [h[0], h[1], h[2]], [h[3], h[4], h[5]]);

  // Pond + bridge
  add(new THREE.CylinderGeometry(3.55, 3.78, 0.17, 32), stone, [4, 0.24, 6.1], [1, 1, 0.7]);
  add(new THREE.CylinderGeometry(3.28, 3.28, 0.08, 32), water, [4, 0.36, 6.1], [1, 1, 0.7]);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    add(new THREE.DodecahedronGeometry(0.22 + (i % 3) * 0.06, 0), stone, [4 + Math.cos(a) * 3.35, 0.43, 6.1 + Math.sin(a) * 2.25], [1, 0.55, 1]);
  }
  const bridge = new THREE.Group();
  scene.add(bridge);
  for (let i = 0; i < 16; i++) add(new THREE.BoxGeometry(0.38, 0.18, 1.55), wood, [0.76 + i * 0.43, 0.63, 6.1], [1, 1, 1], bridge);
  for (const x of [0.7, 4, 7.3])
    for (const z of [5.43, 6.77]) add(new THREE.CylinderGeometry(0.065, 0.08, 0.98, 7), darkWood, [x, 0.9, z], [1, 1, 1], bridge);
  for (const z of [5.43, 6.77]) add(new THREE.BoxGeometry(6.8, 0.07, 0.06), darkWood, [4, 1.2, z], [1, 1, 1], bridge);

  function pitchedRoof(w, d, rise, material, y, parent) {
    const shape = new THREE.Shape();
    shape.moveTo(-w / 2, 0);
    shape.lineTo(0, rise);
    shape.lineTo(w / 2, 0);
    shape.lineTo(-w / 2, 0);
    const geo = new THREE.ExtrudeGeometry(shape, { depth: d, bevelEnabled: false });
    geo.translate(0, 0, -d / 2);
    add(geo, oldTile, [0, y - 0.1, 0], [1, 1, 1], parent);
    add(geo, material, [0, y, 0], [0.96, 0.96, 0.96], parent);
    add(new THREE.BoxGeometry(0.18, 0.18, d + 0.14), oldTile, [0, y + rise + 0.05, 0], [1, 1, 1], parent);
  }

  function house(x, z, s = 1, roof = tile, body = wall, tower = false, rot = 0) {
    const g = new THREE.Group();
    g.position.set(x, 0.28, z);
    g.rotation.y = rot;
    g.scale.setScalar(s);
    scene.add(g);
    const h = tower ? 3.8 : 2.05,
      roofY = tower ? 4.05 : 2.2;
    add(new RoundedBoxGeometry(4.08, 0.36, 3.16, 5, 0.12), stone, [0, 0.18, 0], [1, 1, 1], g);
    add(new RoundedBoxGeometry(3.8, h, 2.75, 5, 0.13), body, [0, tower ? 2 : 1.1, 0], [1, 1, 1], g);
    add(new THREE.BoxGeometry(4.22, 0.16, 3.08), darkWood, [0, 0.38, 0], [1, 1, 1], g);
    pitchedRoof(4.55, 3.35, tower ? 1.5 : 1.22, roof, roofY, g);
    add(new THREE.BoxGeometry(4.02, 0.14, 1.02), wood, [0, 0.66, 1.68], [1, 1, 1], g);
    add(new THREE.BoxGeometry(0.98, 1.52, 0.2), wood, [0, 1, 1.4], [1, 1, 1], g);
    add(new THREE.BoxGeometry(0.76, 1.25, 0.1), darkWood, [0, 1.0, 1.52], [1, 1, 1], g);
    for (const q of [-1.12, 1.12]) {
      add(new THREE.BoxGeometry(0.76, 0.8, 0.18), wood, [q, 1.48, 1.4], [1, 1, 1], g);
      add(new THREE.BoxGeometry(0.54, 0.58, 0.08), M('window', '#31524c', 0.38), [q, 1.48, 1.53], [1, 1, 1], g);
      add(new THREE.BoxGeometry(0.68, 0.09, 0.15), wood, [q, 1.9, 1.59], [1, 1, 1], g);
    }
    for (const q of [-1.78, 1.78]) {
      add(new THREE.CylinderGeometry(0.09, 0.12, 0.9, 6), wood, [q, 0.82, 1.57], [1, 1, 1], g);
      add(new THREE.BoxGeometry(0.08, 0.08, 3.14), wood, [q, 1.5, 0], [1, 1, 1], g);
    }
    return g;
  }

  house(-2.4, -3.1, 1.08, tile, wall);
  house(-7.6, -2, 0.78, oldTile, brick);
  house(4.1, -1.2, 0.83, oldTile, wall);
  house(-8.1, 4.1, 0.62, tile, wall, true);

  [
    [-14, -7, 0.58, oldTile, wall, 0.15],
    [-12, -11, 0.64, tile, brick, -0.2],
    [-8, -12, 0.55, oldTile, wall, 0.3],
    [-3, -11, 0.62, tile, brick, -0.25],
    [3, -11, 0.56, oldTile, wall, 0.18],
    [6.5, -10.5, 0.62, tile, brick, -0.1],
    [17.5, -6.5, 0.58, oldTile, wall, 0.25],
    [15, -2, 0.64, tile, brick, -0.2],
    [14, 4, 0.55, oldTile, wall, 0.16],
    [9.8, 10.4, 0.63, tile, brick, -0.28],
    [5.5, 12.6, 0.57, oldTile, wall, 0.2],
    [1, 13, 0.62, tile, brick, -0.15],
    [-4, 13, 0.54, oldTile, wall, 0.24],
    [-8.5, 12.3, 0.61, tile, brick, -0.22],
    [-16, 1, 0.6, tile, brick, -0.18],
    [-14, -2, 0.53, oldTile, wall, 0.2],
    [-5, 9, 0.52, oldTile, wall, 0.15],
    [-1, 9, 0.55, tile, brick, -0.1],
    [9.5, 5.4, 0.54, oldTile, wall, 0.28],
  ].forEach((v) => house(...v));

  // Well
  const well = new THREE.Group();
  well.position.set(-3.6, 0.3, 3.9);
  scene.add(well);
  add(new THREE.CylinderGeometry(0.92, 0.98, 0.48, 12), stone, [0, 0.25, 0], [1, 1, 1], well);
  add(new THREE.CylinderGeometry(0.67, 0.67, 0.08, 16), M('wellWater', '#2d6767', 0.2), [0, 0.5, 0], [1, 1, 1], well);
  for (const x of [-0.9, 0.9]) add(new THREE.CylinderGeometry(0.07, 0.1, 2.2, 6), wood, [x, 1.35, 0], [1, 1, 1], well);
  add(new THREE.BoxGeometry(2.05, 0.1, 0.13), darkWood, [0, 2.25, 0], [1, 1, 1], well);
  const wr = add(new THREE.ConeGeometry(1.35, 0.68, 4), tile, [0, 2.7, 0], [1, 0.8, 0.8], well);
  wr.rotation.y = Math.PI / 4;

  // Flowers & props
  for (let i = 0; i < 18; i++) {
    const x = -8.4 + (i % 9) * 1.8,
      z = -0.1 + Math.floor(i / 9) * 2.25;
    if (z < 1 && x > 2) continue;
    add(new THREE.DodecahedronGeometry(0.07 + (i % 3) * 0.025), stone, [x, 0.35, z], [1, 0.5, 1]);
    if (i % 2 === 0) {
      add(new THREE.SphereGeometry(0.09, 7, 5), flower, [x + 0.16, 0.44, z + 0.12]);
      add(new THREE.ConeGeometry(0.045, 0.22, 5), leaf2, [x, 0.44, z]);
    }
  }

  function banana(x, z, scale = 1) {
    const g = new THREE.Group();
    g.position.set(x, 0.3, z);
    g.scale.setScalar(scale);
    scene.add(g);
    for (let i = 0; i < 6; i++) {
      const stem = add(new THREE.CylinderGeometry(0.05, 0.09, 1.8, 6), bamboo, [0, 0.9, 0], [1, 1, 1], g);
      stem.rotation.z = (i - 2.5) * 0.04;
      const l = add(new THREE.SphereGeometry(0.33, 8, 5), leaf2, [Math.cos(i) * 0.48, 1.88, Math.sin(i) * 0.48], [1.8, 0.3, 0.72], g);
      l.rotation.y = i;
    }
  }
  [
    [-3, 6.5, 1],
    [1, -5, 0.9],
    [7, 3, 1.1],
    [-9, 0, 0.9],
  ].forEach((v) => banana(...v));

  function treeCluster(x, z, count, spread, scale = 1) {
    for (let i = 0; i < count; i++) {
      const a = i * 2.399,
        r = spread * (0.35 + (0.65 * ((i * 7) % count)) / count),
        tx = x + Math.cos(a) * r,
        tz = z + Math.sin(a) * r,
        h = 2.1 + ((i * 5) % 7) * 0.22;
      add(new THREE.CylinderGeometry(0.11, 0.18, h * scale, 7), wood, [tx, (h * scale) / 2 + 0.28, tz]);
      for (let j = 0; j < 3; j++)
        add(
          new THREE.IcosahedronGeometry(0.55 + (j % 2) * 0.15, 1),
          j % 2 ? leaf : leaf2,
          [tx + (j - 1) * 0.28 * scale, h * scale + 0.7 + j * 0.25, tz + (j % 2) * 0.22],
          [0.9 * scale, 1.25 * scale, 0.9 * scale]
        );
    }
  }

  [
    [-3, -16, 9, 4, 1.1],
    [10, -15, 7, 3.5, 1],
    [19, 1.5, 8, 3.2, 1.05],
    [-14, 13.5, 8, 3.5, 0.95],
    [-19.5, -4.5, 7, 3.2, 0.9],
    // Extra clusters
    [16, 8, 6, 2.8, 0.95],
    [18, -4, 5, 2.5, 0.9],
    [-16, -10, 6, 3, 1],
    [8, 16, 5, 2.6, 0.92],
  ].forEach((v) => treeCluster(...v));

  // Props
  for (let i = 0; i < 4; i++) {
    add(new THREE.CylinderGeometry(0.15, 0.2, 0.38, 12), pot, [-5.45 + i * 0.35, 0.5, -2.6]);
    add(new THREE.SphereGeometry(0.23, 10, 7), leaf2, [-5.45 + i * 0.35, 0.86, -2.6]);
  }
  for (let i = 0; i < 6; i++) {
    const x = -5.2 + i * 0.5;
    add(new THREE.CylinderGeometry(0.045, 0.055, 0.75, 6), wood, [x, 0.65, 1.1]);
    if (i < 5) add(new THREE.BoxGeometry(0.52, 0.045, 0.05), wood, [x + 0.25, 0.75, 1.1]);
  }
  const rack = new THREE.Group();
  scene.add(rack);
  for (const x of [7.8, 9.4]) add(new THREE.CylinderGeometry(0.06, 0.08, 1.25, 6), wood, [x, 0.92, 1.8], [1, 1, 1], rack);
  add(new THREE.BoxGeometry(1.75, 0.06, 0.06), wood, [8.6, 1.45, 1.8], [1, 1, 1], rack);
  add(new THREE.PlaneGeometry(0.62, 0.55), flower, [8.45, 1.14, 1.81], [1, 1, 1], rack);
  add(new THREE.PlaneGeometry(0.52, 0.48), M('cloth', '#527a91', 0.75), [9.05, 1.17, 1.81], [1, 1, 1], rack);
  for (const p of [
    [-1.6, 0.8, 0.9],
    [2.4, 0.8, 2.4],
    [-9.7, 0.75, 5.4],
  ]) {
    add(new THREE.CylinderGeometry(0.055, 0.07, 0.85, 6), darkWood, p);
    add(new THREE.SphereGeometry(0.12, 10, 8), lantern, [p[0], p[1] + 0.42, p[2]]);
  }

  // Lighting
  const sun = new THREE.DirectionalLight('#ffd59b', 3.45);
  sun.position.set(-12, 15, 8);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -18;
  sun.shadow.camera.right = 18;
  sun.shadow.camera.top = 18;
  sun.shadow.camera.bottom = -18;
  scene.add(sun);
  const hemi = new THREE.HemisphereLight('#89a9c0', '#8b513b', 1.45);
  scene.add(hemi);

  // Animation
  let time = 0;
  function step(d) {
    time += d;
    for (const o of swaying) o.rotation.z = Math.sin(time * 1.3 + o.userData.phase) * 0.16;
    for (const e of egrets) updateEgret(e, d);
    for (const b of smallBirds) updateSmall(b);
    for (const q of planters) updatePlanter(q);
    updatePuller(puller);
    updateCart();
    updateGrazer(graze, d);
    updateWalkers(d); // người đi chợ
    for (const c of clouds) {
      c.g.position.x = c.baseX + Math.sin(time * c.speed + c.phase) * 3.2;
      c.g.position.z = c.baseZ + Math.cos(time * c.speed * 0.7 + c.phase) * 1.4;
    }
    for (const v of idleVillagers) {
      v.armL.rotation.z = 0.08 + Math.sin(time * 1.05 + v.g.position.x) * 0.05;
      v.armR.rotation.z = -0.08 - Math.sin(time * 1.05 + v.g.position.x) * 0.05;
      v.hip.rotation.y = Math.sin(time * 0.4 + v.g.position.z) * 0.1;
    }
    for (const m of westMerchants) {
      m.armL.rotation.z = 0.15 + Math.sin(time * 0.9 + m.g.position.x * 2) * 0.08;
      m.armR.rotation.z = -0.15 - Math.sin(time * 0.9 + m.g.position.x * 2) * 0.08;
    }
    water.emissive.setRGB(0.015 + 0.01 * Math.sin(time * 1.2), 0.04, 0.04);
  }
  step(1 / 60);

  return {
    scene,
    setLighting(on) {
      sun.intensity = on ? 3.45 : 1.2;
      hemi.intensity = on ? 1.45 : 0.65;
    },
    update(dt) {
      if (dt > 1) dt /= 1000;
      if (!(dt > 0)) return false;
      step(Math.min(dt, 0.1));
      return true;
    },
    dispose() {
      scene.traverse((o) => o.geometry?.dispose());
      Object.values(mats).forEach((x) => x.dispose());
      sky.dispose();
      env.dispose();
      pmrem.dispose();
    },
  };
}