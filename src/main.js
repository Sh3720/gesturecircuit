import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import './style.css';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

const app = document.querySelector('#app');
app.innerHTML = `
  <div class="app-shell">
    <header class="topbar">
      <div class="brand-lockup">
        <div class="brand-mark"><span></span><span></span><span></span></div>
        <div><p class="eyebrow">INTERACTIVE ELECTRONICS STUDIO</p><h1>Gesture<span>Circuit</span><sup>3D</sup></h1></div>
      </div>
      <div class="top-actions">
        <div class="live-pill"><i></i><span id="app-status">LAB READY</span></div>
        <button class="icon-button" id="reset-camera" title="Reset camera view" aria-label="Reset camera view">⤢</button>
      </div>
    </header>

    <main class="main-grid">
      <aside class="panel parts-panel">
        <div class="panel-head"><div><p class="eyebrow">BUILD</p><h2>Parts library</h2></div><span class="panel-index">01</span></div>
        <p class="panel-subtitle">Add a component to your workbench.</p>
        <div class="parts-list">
          <button class="part-choice" data-add="battery"><span class="part-preview battery-preview"><i></i><b>+</b><small>−</small></span><span class="part-choice-copy"><strong>DC Battery</strong><small>9 V source</small></span><span class="plus">+</span></button>
          <button class="part-choice" data-add="resistor"><span class="part-preview resistor-preview"><i></i><b></b><small></small></span><span class="part-choice-copy"><strong>Resistor</strong><small>470 Ω · axial</small></span><span class="plus">+</span></button>
          <button class="part-choice" data-add="led"><span class="part-preview led-preview"><i></i><b></b></span><span class="part-choice-copy"><strong>LED</strong><small>2 V · polarized</small></span><span class="plus">+</span></button>
          <button class="part-choice" data-add="bulb"><span class="part-preview bulb-preview"><i></i><b></b></span><span class="part-choice-copy"><strong>Mini bulb</strong><small>Visual load</small></span><span class="plus">+</span></button>
          <button class="part-choice" data-add="switch"><span class="part-preview switch-preview"><i></i><b></b></span><span class="part-choice-copy"><strong>Toggle switch</strong><small>Open / closed</small></span><span class="plus">+</span></button>
        </div>
        <div class="tip-card"><span class="tip-icon">✦</span><div><strong>Workbench tip</strong><p>Use <b>Move</b> to arrange parts, <b>Wire</b> to connect terminals, and <b>Orbit</b> to rotate the 3D view.</p></div></div>
        <div class="sidebar-foot"><span class="pulse-dot"></span> <span>LOCAL SIMULATION</span><span class="foot-sep">·</span><span>NO API KEY</span></div>
      </aside>

      <section class="panel stage-panel">
        <div class="stage-topline">
          <div><p class="eyebrow">YOUR WORKSPACE</p><h2>3D circuit workbench</h2><p class="stage-desc">Build it in 3D. Wire it up. Test the flow.</p></div>
          <div class="view-tag"><span class="view-tag-dot"></span> PERSPECTIVE VIEW</div>
        </div>
        <div class="toolbar">
  <div class="mode-group" role="group" aria-label="Interaction mode">
    <button class="mode-button active" data-mode="move"><span>↔</span> Move</button>
    <button class="mode-button" data-mode="connect"><span>⌁</span> Wire</button>
    <button class="mode-button" data-mode="orbit"><span>⟳</span> Orbit</button>

    <button class="mode-button" id="undo-btn" type="button" disabled>
      <span>↶</span> Undo
    </button>
    <button class="mode-button" id="redo-btn" type="button" disabled>
      <span>↷</span> Redo
    </button>
  </div>

  <div class="toolbar-right">
    <span id="mode-hint">Drag parts to position them</span>
    <button class="ghost-button" id="clear-board">Clear board</button>
  </div>
</div>
        <div class="viewport-wrap" id="viewport-wrap">
          <div class="viewport-sheen"></div>
          <div class="viewport-badge"><span class="cube-icon">◇</span><div><strong>3D VIEWPORT</strong><small>Drag empty space to orbit · scroll to zoom</small></div></div>
          <div class="viewport-coords">X <span>—</span> Y <span>—</span> Z <span>—</span></div>
          <div class="viewport-hint" id="viewport-hint"><span class="hint-key">MOVE</span> Select a part to drag it across the board</div>
          <div id="scene-container" aria-label="Interactive 3D electronics workbench"></div>
          <div class="loading-overlay" id="loading-overlay"><div class="loader-orbit"></div><strong>Preparing your workbench</strong><small>Loading the 3D lab…</small></div>
        </div>
        <div class="stat-strip">
          <div class="stat-card"><span class="stat-icon aqua">◈</span><div><small>COMPONENTS</small><strong id="stat-components">0</strong></div></div>
          <div class="stat-card"><span class="stat-icon blue">⌁</span><div><small>CONNECTIONS</small><strong id="stat-connections">0</strong></div></div>
          <div class="stat-card"><span class="stat-icon amber">ϟ</span><div><small>SUPPLY VOLTAGE</small><strong id="stat-voltage">9.0 <em>V</em></strong></div></div>
          <div class="stat-card"><span class="stat-icon green">◉</span><div><small>SIMULATION</small><strong id="stat-simulation" class="status-idle">Standby</strong></div></div>
        </div>
      </section>

      <aside class="panel inspector-panel">
        <div class="panel-head"><div><p class="eyebrow">CONTROL ROOM</p><h2>Inspector</h2></div><span class="inspector-orb">◉</span></div>
        <div class="simulation-card" id="simulation-card"><div class="simulation-card-top"><span class="sim-mini-icon">ϟ</span><span id="simulation-badge" class="status-badge">STANDBY</span></div><h3 id="simulation-title">Ready to test</h3><p id="simulation-message">Add components, connect their terminals, then run the circuit check.</p><button id="run-simulation" class="run-button"><span>▶</span> Run circuit test</button></div>
        <div class="metric-grid"><div class="metric"><small>Current</small><strong id="metric-current">— <em>mA</em></strong><div class="metric-track"><i id="current-bar"></i></div></div><div class="metric"><small>Load voltage</small><strong id="metric-load">— <em>V</em></strong><div class="metric-track"><i id="voltage-bar"></i></div></div></div>
        <div class="inspector-section"><div class="section-title"><h3>Selected component</h3><span id="selection-chip">NONE</span></div><div id="selected-details" class="selected-details"><div class="empty-selection"><span>⌖</span><strong>No component selected</strong><small>Select a component in Move mode to inspect it.</small></div></div></div>
        <div class="inspector-section circuit-tree-section"><div class="section-title"><h3>Circuit inventory</h3><span id="inventory-count">0 ITEMS</span></div><div id="inventory-list" class="inventory-list"><p class="inventory-empty">Your added components will appear here.</p></div></div>
        <div class="inspector-bottom"><span class="secure-dot"></span><span>Calculations run locally in your browser</span></div>
      </aside>
    </main>
    <footer class="app-footer"><span>GESTURECIRCUIT <b>3D</b></span><span>LEARN BY BUILDING <i>·</i> EXPERIMENT SAFELY <i>·</i> THINK IN CIRCUITS</span><span class="version">PROTOTYPE 0.1</span></footer>
    <div id="toast" class="toast" role="status"></div>
  </div>
`;

const container = document.querySelector('#scene-container');
const viewport = document.querySelector('#viewport-wrap');
const loadingOverlay = document.querySelector('#loading-overlay');
const toast = document.querySelector('#toast');
let toastTimeout;
function showToast(message, kind = 'info') {
  toast.textContent = message;
  toast.className = `toast visible ${kind}`;
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.className = 'toast', 2800);
}


/* -------------------------------------------------------
   GESTURECIRCUIT: WEBCAM HAND TRACKING - STAGE 1
   This adds tracking only. It does not control components
   yet, so the existing mouse controls remain unchanged.
------------------------------------------------------- */

viewport.insertAdjacentHTML("beforeend", `
  <section class="gc-hand-panel">
    <div class="gc-hand-heading">
      <div>
        <span class="gc-hand-eyebrow">COMPUTER VISION</span>
        <strong>Hand tracking</strong>
      </div>
      <span id="gc-hand-status" class="gc-hand-status">OFFLINE</span>
    </div>

    <div id="gc-hand-preview" class="gc-hand-preview">
      <video id="gc-hand-video" autoplay muted playsinline></video>
      <canvas id="gc-hand-canvas"></canvas>
      <div id="gc-hand-placeholder" class="gc-hand-placeholder">
        <span>✋</span>
        <small>Enable your camera to begin</small>
      </div>
    </div>

    <div class="gc-hand-readout">
      <span id="gc-hand-gesture">Gesture: —</span>
      <span id="gc-hand-count">Hands: 0</span>
    </div>

    <button id="gc-hand-toggle" class="gc-hand-button">
      Enable camera
    </button>

    <p class="gc-hand-note">
      Your webcam feed is processed in the browser.
    </p>
  </section>
`);

const gcVideo = document.querySelector("#gc-hand-video");
const gcCanvas = document.querySelector("#gc-hand-canvas");
const gcCtx = gcCanvas.getContext("2d");
const gcPreview = document.querySelector("#gc-hand-preview");

// Hand-controlled pointer on the 3D workbench
container.style.position = "relative";

const gcWorldCursor = document.createElement("div");
gcWorldCursor.id = "gc-world-cursor";
gcWorldCursor.setAttribute("aria-label", "Hand-controlled pointer");
container.appendChild(gcWorldCursor);

const gcStatus = document.querySelector("#gc-hand-status");
const gcGesture = document.querySelector("#gc-hand-gesture");
const gcCount = document.querySelector("#gc-hand-count");
const gcToggle = document.querySelector("#gc-hand-toggle");

let gcHandLandmarker = null;
let gcCameraStream = null;
let gcCameraActive = false;
let gcLastVideoTime = -1;
let gcAnimationFrame = 0;


let gcPinchWasDown = false;
let gcLastClientX = 0;
let gcLastClientY = 0;
let gcPalmOrbitActive = false;
let gcPreviousPalmX = null;
let gcPreviousPalmY = null;

function gcDispatchPointer(type, clientX, clientY) {
  const isDown = type === "pointerdown";
  const isUp = type === "pointerup";

  const event = new PointerEvent(type, {
    bubbles: true,
    cancelable: true,
    clientX,
    clientY,
    pointerId: 7,
    pointerType: "pen",
    isPrimary: true,
    button: isDown || isUp ? 0 : -1,
    buttons: isUp ? 0 : 1
  });

  renderer.domElement.dispatchEvent(event);
}

function gcReleaseGesturePointer() {
  if (!gcPinchWasDown) return;

  gcDispatchPointer(
    "pointerup",
    gcLastClientX,
    gcLastClientY
  );

  gcPinchWasDown = false;
}


const GC_HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20],
  [0, 17]
];


function gcDrawHand(results) {
  gcCtx.clearRect(0, 0, gcCanvas.width, gcCanvas.height);

  const hands = results.landmarks || [];
  gcCount.textContent = `Hands: ${hands.length}`;

  if (!hands.length) {
    gcGesture.textContent = "Gesture: Show one hand";
    gcStatus.textContent = "SEARCHING";
    gcWorldCursor.classList.remove("visible");
    gcReleaseGesturePointer();

    // Restore normal camera controls if the hand disappears.
    if (gcPalmOrbitActive) {
      gcPalmOrbitActive = false;
      gcPreviousPalmX = null;
      gcPreviousPalmY = null;
      controls.enabled = activeMode !== "connect";
    }

    return;
  }

  const hand = hands[0];
  const indexTip = hand[8];

  // Map the index fingertip onto the 3D workbench.
  const canvasRect = renderer.domElement.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();

  gcWorldCursor.style.left =
    `${canvasRect.left - containerRect.left +
      (1 - indexTip.x) * canvasRect.width}px`;

  gcWorldCursor.style.top =
    `${canvasRect.top - containerRect.top +
      indexTip.y * canvasRect.height}px`;

  gcWorldCursor.classList.add("visible");

  // Draw the hand skeleton in the webcam preview.
  gcCtx.lineCap = "round";
  gcCtx.lineJoin = "round";
  gcCtx.lineWidth = 3;
  gcCtx.strokeStyle = "#59f0dc";

  for (const [start, end] of GC_HAND_CONNECTIONS) {
    const a = hand[start];
    const b = hand[end];

    gcCtx.beginPath();
    gcCtx.moveTo(a.x * gcCanvas.width, a.y * gcCanvas.height);
    gcCtx.lineTo(b.x * gcCanvas.width, b.y * gcCanvas.height);
    gcCtx.stroke();
  }

  for (const point of hand) {
    gcCtx.beginPath();
    gcCtx.arc(
      point.x * gcCanvas.width,
      point.y * gcCanvas.height,
      4, 0, Math.PI * 2
    );
    gcCtx.fillStyle = "#ffffff";
    gcCtx.fill();

    gcCtx.beginPath();
    gcCtx.arc(
      point.x * gcCanvas.width,
      point.y * gcCanvas.height,
      2, 0, Math.PI * 2
    );
    gcCtx.fillStyle = "#27a9ff";
    gcCtx.fill();
  }

  // Detect pinch: thumb tip and index fingertip.
  const thumb = hand[4];
  const index = hand[8];

  const pinchDistance = Math.hypot(
    thumb.x - index.x,
    thumb.y - index.y
  );

  const isPinching = pinchDistance < 0.05;

  // Detect an open palm using the four fingers.
  const fingerPairs = [
    [8, 6], [12, 10], [16, 14], [20, 18]
  ];

  const extendedCount = fingerPairs.filter(
    ([tip, joint]) => hand[tip].y < hand[joint].y
  ).length;

  const isOpenPalm =
    extendedCount >= 4 && pinchDistance > 0.08;

  gcLastClientX =
    canvasRect.left + (1 - index.x) * canvasRect.width;

  gcLastClientY =
    canvasRect.top + index.y * canvasRect.height;

  // OPEN PALM: rotate the camera by moving the palm.
  if (isOpenPalm) {
    // End any active component drag before orbiting.
    gcReleaseGesturePointer();

    const palmLandmarks = [0, 5, 9, 13, 17];

    const palmX =
      1 - palmLandmarks.reduce(
        (sum, i) => sum + hand[i].x, 0
      ) / palmLandmarks.length;

    const palmY =
      palmLandmarks.reduce(
        (sum, i) => sum + hand[i].y, 0
      ) / palmLandmarks.length;

    if (!gcPalmOrbitActive) {
      // Establish the starting position to avoid a camera jump.
      gcPalmOrbitActive = true;
      gcPreviousPalmX = palmX;
      gcPreviousPalmY = palmY;
      controls.enabled = false;
    } else {
      const dx = palmX - gcPreviousPalmX;
      const dy = palmY - gcPreviousPalmY;

      // Ignore unusually large tracking jumps.
      if (Math.abs(dx) < 0.12 && Math.abs(dy) < 0.12) {
        const offset = camera.position.clone().sub(controls.target);
        const spherical = new THREE.Spherical().setFromVector3(offset);

        spherical.theta -= dx * 4.5;
        spherical.phi += dy * 3.5;

        spherical.phi = THREE.MathUtils.clamp(
          spherical.phi,
          0.18,
          Math.PI - 0.18
        );

        offset.setFromSpherical(spherical);
        camera.position.copy(controls.target).add(offset);
        camera.lookAt(controls.target);
      }

      gcPreviousPalmX = palmX;
      gcPreviousPalmY = palmY;
    }

    gcGesture.textContent = "Gesture: PALM ORBIT";
    gcStatus.textContent = "ORBITING";
    return;
  }

  // When the palm closes, restore the ordinary interaction mode.
  if (gcPalmOrbitActive) {
    gcPalmOrbitActive = false;
    gcPreviousPalmX = null;
    gcPreviousPalmY = null;
    controls.enabled = activeMode !== "connect";
  }

  // Existing pinch interactions remain unchanged.
  if (isPinching && !gcPinchWasDown) {
    gcDispatchPointer(
      "pointerdown", gcLastClientX, gcLastClientY
    );
    gcPinchWasDown = true;
  } else if (isPinching && gcPinchWasDown) {
    gcDispatchPointer(
      "pointermove", gcLastClientX, gcLastClientY
    );
  } else if (!isPinching && gcPinchWasDown) {
    gcReleaseGesturePointer();
  }

  if (isPinching) {
    gcGesture.textContent = "Gesture: PINCH DETECTED";
    gcStatus.textContent = "PINCH";
  } else {
    gcGesture.textContent =
      extendedCount >= 3
        ? "Gesture: OPEN HAND"
        : "Gesture: HAND TRACKED";

    gcStatus.textContent = "TRACKING";
  }
}

function gcDetectionLoop() {
  if (!gcCameraActive || !gcHandLandmarker) return;

  try {
    if (
      gcVideo.readyState >= 2 &&
      gcVideo.currentTime !== gcLastVideoTime
    ) {
      gcLastVideoTime = gcVideo.currentTime;

      const results = gcHandLandmarker.detectForVideo(
        gcVideo,
        performance.now()
      );

      gcDrawHand(results);
    }
  } catch (error) {
    console.error("Hand-tracking frame failed:", error);
    gcStatus.textContent = "TRACKING ERROR";
  }

  gcAnimationFrame = requestAnimationFrame(gcDetectionLoop);
}

async function gcStartCamera() {
  gcToggle.disabled = true;

  try {
    gcStatus.textContent = "LOADING MODEL";
    gcGesture.textContent = "Gesture: Initializing";
    
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.1.1/wasm"
    );

    gcHandLandmarker = await HandLandmarker.createFromOptions(
      vision,
      {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
          delegate: "CPU"
        },
        runningMode: "VIDEO",
        numHands: 1,
        minHandDetectionConfidence: 0.55,
        minHandPresenceConfidence: 0.55,
        minTrackingConfidence: 0.55
      }
    );

    gcStatus.textContent = "REQUESTING CAMERA";

    gcCameraStream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        facingMode: "user",
        width: { ideal: 640 },
        height: { ideal: 480 }
      }
    });

    gcVideo.srcObject = gcCameraStream;
    await gcVideo.play();

    gcCanvas.width = gcVideo.videoWidth || 640;
    gcCanvas.height = gcVideo.videoHeight || 480;

    gcCameraActive = true;
    gcLastVideoTime = -1;
    gcPreview.classList.add("is-streaming");
    gcToggle.textContent = "Stop camera";
    gcStatus.textContent = "CAMERA ON";

    showToast("Hand tracking enabled", "success");
    gcDetectionLoop();
  } catch (error) {
    console.error("Could not start hand tracking:", error);

    gcStatus.textContent = "SETUP FAILED";
    gcGesture.textContent = "Gesture: Camera unavailable";

    gcCameraStream?.getTracks().forEach(track => track.stop());
    gcCameraStream = null;
    gcHandLandmarker?.close();
    gcHandLandmarker = null;

    showToast(
      error.name === "NotAllowedError"
        ? "Allow camera access in Chrome, then try again"
        : "Could not start hand tracking. Check the browser console.",
      "warn"
    );
  } finally {
    gcToggle.disabled = false;
  }
}

function gcStopCamera() {
  gcCameraActive = false;
  cancelAnimationFrame(gcAnimationFrame);

  gcCameraStream?.getTracks().forEach(track => track.stop());
  gcCameraStream = null;
  gcVideo.srcObject = null;

  gcHandLandmarker?.close();
  gcHandLandmarker = null;

  gcCtx.clearRect(0, 0, gcCanvas.width, gcCanvas.height);
  gcPreview.classList.remove("is-streaming");

  gcToggle.textContent = "Enable camera";
  gcStatus.textContent = "OFFLINE";
  gcGesture.textContent = "Gesture: —";
  gcCount.textContent = "Hands: 0";
}

gcToggle.addEventListener("click", () => {
  if (gcCameraActive) {
    gcStopCamera();
  } else {
    gcStartCamera();
  }
});


const scene = new THREE.Scene();
scene.background = new THREE.Color('#091321');
scene.fog = new THREE.Fog('#091321', 17, 34);
const camera = new THREE.PerspectiveCamera(43, 1, 0.1, 100);
camera.position.set(8.8, 8.5, 10.5);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.18;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0.4, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.065;
controls.minDistance = 6.5;
controls.maxDistance = 19;
controls.maxPolarAngle = Math.PI * 0.48;
controls.enabled = true;

scene.add(new THREE.HemisphereLight(0xbfdcff, 0x1b2635, 2.0));
const keyLight = new THREE.DirectionalLight(0xfff0d6, 3.3);
keyLight.position.set(5, 10, 5);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(2048, 2048);
keyLight.shadow.camera.left = -10;
keyLight.shadow.camera.right = 10;
keyLight.shadow.camera.top = 10;
keyLight.shadow.camera.bottom = -10;
scene.add(keyLight);
const cyanLight = new THREE.PointLight(0x29bfae, 30, 15);
cyanLight.position.set(-5, 4, -2);
scene.add(cyanLight);
const blueLight = new THREE.PointLight(0x4f79ff, 20, 14);
blueLight.position.set(5, 3, 3);
scene.add(blueLight);

// Dark lab floor and raised workbench.
const ground = new THREE.Mesh(new THREE.PlaneGeometry(50, 50), new THREE.MeshStandardMaterial({ color: 0x07101b, roughness: 0.72, metalness: 0.12 }));
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.22;
ground.receiveShadow = true;
scene.add(ground);
const boardMat = new THREE.MeshStandardMaterial({ color: 0x111f30, roughness: 0.48, metalness: 0.35 });
const board = new THREE.Mesh(new THREE.BoxGeometry(12, 0.24, 8), boardMat);
board.position.y = -0.03;
board.receiveShadow = true;
board.castShadow = true;
scene.add(board);
const boardTop = new THREE.Mesh(new THREE.PlaneGeometry(11.94, 7.94), new THREE.MeshStandardMaterial({ color: 0x0c1726, roughness: 0.72, metalness: 0.08 }));
boardTop.rotation.x = -Math.PI / 2;
boardTop.position.y = 0.094;
boardTop.receiveShadow = true;
scene.add(boardTop);
const grid = new THREE.GridHelper(12, 30, 0x31516e, 0x20344a);
grid.position.y = 0.102;
scene.add(grid);
const edgeMat = new THREE.MeshStandardMaterial({ color: 0x36bfb4, emissive: 0x0a6563, emissiveIntensity: 1.0, metalness: 0.65, roughness: 0.3 });
function edgeBar(width, height, depth, x, y, z) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), edgeMat);
  mesh.position.set(x, y, z); mesh.castShadow = true; scene.add(mesh); return mesh;
}
edgeBar(12.04, 0.035, 0.035, 0, 0.105, -4.015);
edgeBar(12.04, 0.035, 0.035, 0, 0.105, 4.015);
edgeBar(0.035, 0.035, 8.0, -6.015, 0.105, 0);
edgeBar(0.035, 0.035, 8.0, 6.015, 0.105, 0);

const componentLayer = new THREE.Group(); scene.add(componentLayer);
const wireLayer = new THREE.Group(); scene.add(wireLayer);
const particleLayer = new THREE.Group(); scene.add(particleLayer);
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.15);
const groundHit = new THREE.Vector3();
let activeMode = 'move';
let components = [];
let connections = [];
let redoConnections = [];
updateHistoryButtons();
let nextId = 1;
let selectedComponent = null;
let firstTerminal = null;
let dragState = null;
let simulation = null;
let electronParticles = [];
let elapsed = 0;
const terminalMeshes = [];
const terminalNames = {
  battery: ['+', '−'], resistor: ['A', 'B'], led: ['A', 'K'], bulb: ['1', '2'], switch: ['IN', 'OUT']
};
const partMeta = {
  battery: { label: 'DC Battery', subtitle: '9 V source', color: '#56e0cb', kind: 'SOURCE' },
  resistor: { label: 'Resistor', subtitle: '470 Ω axial', color: '#f2bb73', kind: 'PASSIVE' },
  led: { label: 'LED', subtitle: '2 V · polarized', color: '#ff657b', kind: 'DIODE' },
  bulb: { label: 'Mini bulb', subtitle: 'Visual load', color: '#ffc86b', kind: 'LOAD' },
  switch: { label: 'Toggle switch', subtitle: 'Open / closed', color: '#92a9ff', kind: 'CONTROL' }
};

const mat = (color, roughness = 0.35, metalness = 0.35, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra });
const metals = {
  steel: mat(0xb6c5d1, 0.23, 0.92),
  steelDark: mat(0x536779, 0.28, 0.84),
  gold: mat(0xe5b96d, 0.22, 0.82),
  rubber: mat(0x111923, 0.76, 0.05),
  black: mat(0x071019, 0.65, 0.05)
};
function addMesh(group, geometry, material, position = [0, 0, 0], rotation = [0, 0, 0], options = {}) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(...position); mesh.rotation.set(...rotation);
  mesh.castShadow = options.castShadow !== false; mesh.receiveShadow = true;
  group.add(mesh); return mesh;
}
function cylinderX(group, radius, length, material, x, y, z = 0, radial = 32) {
  return addMesh(group, new THREE.CylinderGeometry(radius, radius, length, radial), material, [x, y, z], [0, 0, Math.PI / 2]);
}
function rodX(group, radius, length, material, x, y, z = 0) {
  return cylinderX(group, radius, length, material, x, y, z, 16);
}
function makeTerminal(group, id, index, label, x, y, z = 0) {
  const holder = addMesh(group, new THREE.CylinderGeometry(0.11, 0.11, 0.07, 20), metals.steelDark, [x, y - 0.04, z]);
  const terminal = addMesh(group, new THREE.SphereGeometry(0.095, 24, 18), metals.steel.clone(), [x, y, z]);
  terminal.userData.isTerminal = true;
  terminal.userData.endpoint = { componentId: id, terminalIndex: index, label };
  terminalMeshes.push(terminal);
  const inset = addMesh(group, new THREE.SphereGeometry(0.037, 16, 12), label === '+' || label === 'A' || label === 'IN' ? mat(0x49e6d2, 0.18, 0.55, { emissive: 0x0d7c73, emissiveIntensity: 0.6 }) : mat(0x172533, 0.4, 0.6), [x, y + 0.071, z]);
  inset.userData.noRaycast = true;
  holder.userData.noRaycast = true;
  return terminal;
}
function addTextPlate(group, text, position, width = 0.55, height = 0.22, color = '#eaf4ff') {
  const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 160;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 512, 160);
  ctx.fillStyle = 'rgba(5,12,21,0.65)';
  ctx.beginPath(); ctx.roundRect(16, 18, 480, 124, 24); ctx.fill();
  ctx.strokeStyle = 'rgba(100,235,218,0.45)'; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = color; ctx.font = 'bold 68px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 256, 81);
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Mesh(new THREE.PlaneGeometry(width, height), new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, side: THREE.DoubleSide }));
  sprite.position.set(...position); sprite.userData.noRaycast = true; group.add(sprite); return sprite;
}
function makeBattery(group, item) {
  const green = mat(0x1e675a, 0.29, 0.42);
  const wrap = addMesh(group, new THREE.CylinderGeometry(0.32, 0.32, 0.95, 40), green, [0, 0.43, 0], [0, 0, Math.PI / 2]);
  cylinderX(group, 0.315, 0.07, metals.steelDark, -0.48, 0.43);
  cylinderX(group, 0.315, 0.07, metals.steelDark, 0.48, 0.43);
  cylinderX(group, 0.245, 0.035, mat(0x267b6b, 0.2, 0.42), -0.53, 0.43);
  cylinderX(group, 0.245, 0.035, mat(0x172735, 0.24, 0.75), 0.53, 0.43);
  addTextPlate(group, '9V  DC', [0, 0.49, 0.321], 0.58, 0.18, '#c3fff2');
  item.terminals.push(makeTerminal(group, item.id, 0, '+', -0.68, 0.43));
  item.terminals.push(makeTerminal(group, item.id, 1, '−', 0.68, 0.43));
  item.glowMeshes = [];
  item.group.userData.voltage = 9;
}
function makeResistor(group, item) {
  addMesh(group, new THREE.CylinderGeometry(0.185, 0.185, 0.85, 32), mat(0xd9bd88, 0.34, 0.12), [0, 0.38, 0], [0, 0, Math.PI / 2]);
  const bands = [ [-0.21, 0x68402d], [-0.07, 0x8d2f21], [0.07, 0x302a21], [0.20, 0xcaa15c] ];
  bands.forEach(([x, color]) => cylinderX(group, 0.189, 0.055, mat(color, 0.38, 0.16), x, 0.38, 0, 20));
  rodX(group, 0.035, 0.43, metals.steel, -0.63, 0.38);
  rodX(group, 0.035, 0.43, metals.steel, 0.63, 0.38);
  item.terminals.push(makeTerminal(group, item.id, 0, 'A', -0.83, 0.38));
  item.terminals.push(makeTerminal(group, item.id, 1, 'B', 0.83, 0.38));
  item.resistance = 470;
  item.glowMeshes = [];
}
function makeLed(group, item) {
  addMesh(group, new THREE.CylinderGeometry(0.16, 0.18, 0.24, 28), mat(0x4b172b, 0.22, 0.18), [0, 0.27, 0]);
  const lensMat = mat(0xff3859, 0.18, 0.05, { emissive: 0x4b0718, emissiveIntensity: 0.22, transparent: true, opacity: 0.92 });
  const lens = addMesh(group, new THREE.SphereGeometry(0.205, 32, 24), lensMat, [0, 0.51, 0]);
  addMesh(group, new THREE.TorusGeometry(0.18, 0.018, 8, 28), mat(0xffa7bd, 0.2, 0.4), [0, 0.48, 0], [Math.PI / 2, 0, 0]);
  rodX(group, 0.025, 0.40, metals.steel, -0.40, 0.19);
  rodX(group, 0.025, 0.40, metals.steel, 0.40, 0.19);
  item.terminals.push(makeTerminal(group, item.id, 0, 'A', -0.51, 0.19));
  item.terminals.push(makeTerminal(group, item.id, 1, 'K', 0.51, 0.19));
  item.forwardDrop = 2.0; item.glowMeshes = [lensMat]; item.glowLight = new THREE.PointLight(0xff234b, 0, 3.1); item.glowLight.position.set(0, 0.65, 0); group.add(item.glowLight);
  lens.userData.noRaycast = false;
}
function makeBulb(group, item) {
  const base = mat(0x8996a5, 0.3, 0.76);
  addMesh(group, new THREE.CylinderGeometry(0.16, 0.19, 0.26, 28), base, [0, 0.23, 0]);
  for (let y = 0.16; y <= 0.30; y += 0.055) addMesh(group, new THREE.TorusGeometry(0.17, 0.018, 8, 28), metals.steelDark, [0, y, 0]);
  const glassMat = new THREE.MeshPhysicalMaterial({ color: 0xffe9b0, roughness: 0.11, metalness: 0.0, transmission: 0.14, transparent: true, opacity: 0.52, thickness: 0.35, clearcoat: 0.8, clearcoatRoughness: 0.12 });
  addMesh(group, new THREE.SphereGeometry(0.29, 32, 24), glassMat, [0, 0.55, 0]);
  const filamentMat = mat(0xffb13b, 0.18, 0.1, { emissive: 0x301000, emissiveIntensity: 0.2 });
  const filament = addMesh(group, new THREE.TorusGeometry(0.09, 0.018, 8, 20), filamentMat, [0, 0.53, 0], [Math.PI / 2, 0, 0]);
  rodX(group, 0.022, 0.33, metals.steel, -0.37, 0.19);
  rodX(group, 0.022, 0.33, metals.steel, 0.37, 0.19);
  item.terminals.push(makeTerminal(group, item.id, 0, '1', -0.48, 0.19));
  item.terminals.push(makeTerminal(group, item.id, 1, '2', 0.48, 0.19));
  item.resistance = 60; item.forwardDrop = 0; item.glowMeshes = [filamentMat]; item.glowLight = new THREE.PointLight(0xffb54f, 0, 3.3); item.glowLight.position.set(0, 0.58, 0); group.add(item.glowLight);
}
function makeSwitch(group, item) {
  item.switchClosed = true;
  addMesh(group, new THREE.BoxGeometry(0.88, 0.20, 0.52), mat(0x243a52, 0.32, 0.55), [0, 0.19, 0]);
  addMesh(group, new THREE.BoxGeometry(0.72, 0.055, 0.38), mat(0x0b1522, 0.46, 0.22), [0, 0.305, 0]);
  const pivot = addMesh(group, new THREE.CylinderGeometry(0.075, 0.075, 0.10, 18), metals.gold, [0, 0.36, 0]);
  const lever = addMesh(group, new THREE.BoxGeometry(0.53, 0.09, 0.14), mat(0x78a8c8, 0.23, 0.76), [0, 0.42, 0]);
  lever.rotation.z = item.switchClosed ? 0 : -0.65;
  item.switchLever = lever;
  item.terminals.push(makeTerminal(group, item.id, 0, 'IN', -0.62, 0.21));
  item.terminals.push(makeTerminal(group, item.id, 1, 'OUT', 0.62, 0.21));
  item.switchClosed = true; item.glowMeshes = [];
  item.switchLever = lever; item.switchPivot = pivot;
}
function buildComponent(item) {
  const group = new THREE.Group();
  group.position.set(item.x, 0.15, item.z);
  item.group = group; item.terminals = [];
  item.id = String(nextId++);
  item.label = partMeta[item.type].label;
  item.glowMeshes = [];
  if (item.type === 'battery') makeBattery(group, item);
  if (item.type === 'resistor') makeResistor(group, item);
  if (item.type === 'led') makeLed(group, item);
  if (item.type === 'bulb') makeBulb(group, item);
  if (item.type === 'switch') makeSwitch(group, item);
  group.traverse(obj => { obj.userData.componentId = item.id; });
  componentLayer.add(group);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.018, 8, 56), new THREE.MeshBasicMaterial({ color: 0x57edd6, transparent: true, opacity: 0.0 }));
  ring.rotation.x = Math.PI / 2; ring.position.set(item.x, 0.17, item.z); ring.userData.noRaycast = true; scene.add(ring); item.selectionRing = ring;
  return item;
}


function addComponent(type) {
  if (!partMeta[type]) {
    showToast("Unknown component type", "warn");
    return;
  }

  const index = components.length;
  const layout = [
    [-3.8, -1.9],
    [-1.4, 1.7],
    [1.3, -1.8],
    [3.7, 1.4],
    [-3.6, 1.7],
    [3.4, -1.7],
    [0, 0],
  ];

  const [x, z] = layout[index % layout.length];
  const offset = Math.floor(index / layout.length);

  const item = buildComponent({
    type,
    x: x + offset * 0.25,
    z: z + offset * 0.2,
  });

  components.push(item);
  selectComponent(item);
  clearSimulation();
  updateUI();

  showToast(`${item.label} added to the workbench`);
}

const modeHints = {
  move: ["MOVE", "Drag a component body to place it on the workbench"],
  connect: ["WIRE", "Click one metal terminal, then another terminal"],
  orbit: ["ORBIT", "Drag empty space to rotate · scroll to zoom"],
};

function setMode(mode) {
  if (!modeHints[mode]) return;

  activeMode = mode;
  firstTerminal = null;
  clearTerminalHighlight();

  document.querySelectorAll("[data-mode]").forEach((button) => {
    button.classList.toggle("active", button.dataset.mode === mode);
  });

  controls.enabled = mode !== "connect";

  document.querySelector("#mode-hint").textContent = modeHints[mode][1];

  const hint = document.querySelector("#viewport-hint");
  hint.innerHTML =
    `<span class="hint-key">${modeHints[mode][0]}</span> ${modeHints[mode][1]}`;

  renderer.domElement.style.cursor =
    mode === "connect" ? "crosshair" :
    mode === "move" ? "grab" : "move";

  if (mode === "connect") {
    showToast("Wire mode: click two metal terminals", "info");
  }
}

document.querySelectorAll("[data-mode]").forEach((button) => {
  button.addEventListener("click", () => setMode(button.dataset.mode));
});

document.querySelectorAll("[data-add]").forEach((button) => {
  button.addEventListener("click", () => addComponent(button.dataset.add));
});

function screenPointer(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
}
function terminalHit(event) {
  screenPointer(event);
  const hits = raycaster.intersectObjects(terminalMeshes, false);
  return hits.length ? hits[0].object : null;
}
function componentHit(event) {
  screenPointer(event);
  const targets = components.flatMap(item => item.group.children.filter(obj => !obj.userData.noRaycast));
  const hits = raycaster.intersectObjects(targets, true);
  if (!hits.length) return null;
  let obj = hits[0].object;
  while (obj && !obj.userData.componentId) obj = obj.parent;
  return obj ? components.find(item => item.id === obj.userData.componentId) || null : null;
}
function clearTerminalHighlight() {
  for (const terminal of terminalMeshes) {
    terminal.material.emissive?.setHex(0x000000);
    terminal.material.emissiveIntensity = 0;
    terminal.scale.setScalar(1);
  }
}

function handleTerminalClick(terminal) {
  const ep = terminal.userData.endpoint;
  const item = components.find(c => c.id === ep.componentId);
  if (!item) return;

  if (!firstTerminal) {
    firstTerminal = ep;
    clearTerminalHighlight();
    terminal.material.emissive?.setHex(0x1bbba8);
    terminal.material.emissiveIntensity = 0.9;
    terminal.scale.setScalar(1.22);

    document.querySelector('#mode-hint').textContent =
      `${item.label} · terminal ${ep.label} selected — choose the second terminal`;

    showToast(`${item.label} ${ep.label} selected — choose another terminal`);
    return;
  }

  const a = firstTerminal;
  firstTerminal = null;
  clearTerminalHighlight();

  if (a.componentId === ep.componentId) {
    showToast('Choose a terminal on a different component', 'warn');
    setMode('connect');
    return;
  }

  if (connections.some(c =>
    (sameEndpoint(c.a, a) && sameEndpoint(c.b, ep)) ||
    (sameEndpoint(c.a, ep) && sameEndpoint(c.b, a))
  )) {
    showToast('Those terminals are already connected', 'warn');
    updateUI();
    return;
  }

  const newConnection = {
    id: crypto.randomUUID
      ? crypto.randomUUID()
      : String(Date.now() + Math.random()),
    a: { ...a },
    b: { ...ep }
  };

  connections.push(newConnection);

  // A new connection clears the redo history.
  redoConnections = [];

  updateHistoryButtons();

  rebuildWires();
  clearSimulation();
  updateUI();

  showToast('Wire connected successfully', 'success');

  document.querySelector('#mode-hint').textContent =
    modeHints.connect[1];
}


// Undo the most recently created wire.
function undoConnection() {
  if (firstTerminal) {
    firstTerminal = null;
    clearTerminalHighlight();
  }

  if (connections.length === 0) {
    showToast('Nothing to undo', 'info');
    return;
  }

  const lastConnection = connections.pop();
  redoConnections.push(lastConnection);
  updateHistoryButtons();

  rebuildWires();
  clearSimulation();
  updateUI();

  showToast('Last wire connection undone', 'success');
}


// Restore the most recently undone wire.
function redoConnection() {
  if (redoConnections.length === 0) {
    showToast('Nothing to redo', 'info');
    return;
  }

  const connection = redoConnections.pop();

  // Make sure both components still exist.
  const componentA = components.find(
    item => item.id === connection.a.componentId
  );

  const componentB = components.find(
    item => item.id === connection.b.componentId
  );

  if (!componentA || !componentB) {
    showToast('Cannot restore this connection', 'warn');
    return;
  }

  connections.push(connection);
  updateHistoryButtons();

  rebuildWires();
  clearSimulation();
  updateUI();

  showToast('Wire connection restored', 'success');
}

function sameEndpoint(a, b) { return a.componentId === b.componentId && a.terminalIndex === b.terminalIndex; }

function updateHistoryButtons() {

  const undoBtn = document.querySelector('#undo-btn');
  const redoBtn = document.querySelector('#redo-btn');

  if (undoBtn) {
    undoBtn.disabled = connections.length === 0;
  }

  if (redoBtn) {
    redoBtn.disabled = redoConnections.length === 0;
  }
}

renderer.domElement.addEventListener('pointerdown', event => {
  if (event.button !== 0) return;
  if (activeMode === 'connect') {
    const terminal = terminalHit(event);
    if (terminal) { event.preventDefault(); event.stopPropagation(); handleTerminalClick(terminal); }
    return;
  }
  if (activeMode !== 'move') return;
  const component = componentHit(event);
  if (!component) return;
  event.preventDefault();
  selectComponent(component);
  controls.enabled = false;
  screenPointer(event);
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -component.group.position.y);
  const point = new THREE.Vector3();
  if (raycaster.ray.intersectPlane(plane, point)) {
    dragState = { component, plane, offset: new THREE.Vector3().subVectors(component.group.position, point) };
  }
  if (event.isTrusted) {
  renderer.domElement.setPointerCapture?.(event.pointerId);
}
  renderer.domElement.style.cursor = 'grabbing';
});
renderer.domElement.addEventListener('pointermove', event => {
  if (!dragState) return;
  screenPointer(event);
  const point = new THREE.Vector3();
  if (!raycaster.ray.intersectPlane(dragState.plane, point)) return;
  const pos = point.add(dragState.offset);
  dragState.component.group.position.x = THREE.MathUtils.clamp(pos.x, -5.25, 5.25);
  dragState.component.group.position.z = THREE.MathUtils.clamp(pos.z, -3.25, 3.25);
  dragState.component.selectionRing.position.set(dragState.component.group.position.x, 0.17, dragState.component.group.position.z);
  rebuildWires();
});
function endDrag() {
  if (!dragState) return;
  dragState = null;
  controls.enabled = activeMode !== 'connect';
  renderer.domElement.style.cursor = activeMode === 'connect' ? 'crosshair' : activeMode === 'move' ? 'grab' : 'move';
}
renderer.domElement.addEventListener('pointerup', endDrag);
renderer.domElement.addEventListener('pointercancel', endDrag);

function getTerminalWorld(endpoint) {
  const item = components.find(c => c.id === endpoint.componentId);
  if (!item) return null;
  const mesh = item.terminals[endpoint.terminalIndex];
  const pos = new THREE.Vector3(); mesh.getWorldPosition(pos); return pos;
}
function makeWireCurve(a, b) {
  const distance = a.distanceTo(b);
  const lift = Math.min(0.7, 0.18 + distance * 0.10);
  const p1 = a.clone().lerp(b, 0.28); p1.y += lift;
  const p2 = a.clone().lerp(b, 0.72); p2.y += lift;
  return new THREE.CatmullRomCurve3([a.clone(), p1, p2, b.clone()]);
}

function rebuildWires() {
  // Remove the previous wire meshes and their materials.
  while (wireLayer.children.length) {
    const obj = wireLayer.children[wireLayer.children.length - 1];
    wireLayer.remove(obj);
    obj.geometry?.dispose();

    if (Array.isArray(obj.material)) {
      obj.material.forEach(material => material.dispose());
    } else {
      obj.material?.dispose();
    }
  }

  // Clear old animated current particles.
  electronParticles.forEach(particle => {
    particleLayer.remove(particle.mesh);
    particle.mesh.geometry.dispose();
    particle.mesh.material.dispose();
  });

  electronParticles = [];

  connections.forEach((connection, index) => {
    const start = getTerminalWorld(connection.a);
    const end = getTerminalWorld(connection.b);

    if (!start || !end) return;

    const curve = makeWireCurve(start, end);
    connection.curve = curve;

    // Determine wire color using the connected terminal labels.
    const endpoints = [connection.a, connection.b];

    const touchesBatteryPositive = endpoints.some(endpoint => {
      const component = components.find(
        item => item.id === endpoint.componentId
      );
      return component?.type === "battery" &&
        endpoint.terminalIndex === 0;
    });

    const touchesBatteryNegative = endpoints.some(endpoint => {
      const component = components.find(
        item => item.id === endpoint.componentId
      );
      return component?.type === "battery" &&
        endpoint.terminalIndex === 1;
    });

    const touchesLedAnode = endpoints.some(endpoint => {
      const component = components.find(
        item => item.id === endpoint.componentId
      );
      return component?.type === "led" &&
        endpoint.terminalIndex === 0;
    });

    const touchesLedCathode = endpoints.some(endpoint => {
      const component = components.find(
        item => item.id === endpoint.componentId
      );
      return component?.type === "led" &&
        endpoint.terminalIndex === 1;
    });

    let color;
    let highlight;
    let glow;

    if (touchesBatteryPositive) {
      color = 0xd92335;
      highlight = 0xff8b94;
      glow = 0x39030a;
    } else if (touchesBatteryNegative || touchesLedCathode) {
      color = 0x171d26;
      highlight = 0x697787;
      glow = 0x000000;
    } else if (touchesLedAnode) {
      color = 0xd92335;
      highlight = 0xff8b94;
      glow = 0x39030a;
    } else {
      // Default to red for intermediate positive-side wiring.
      color = 0xd92335;
      highlight = 0xff8b94;
      glow = 0x39030a;
    }

    // Main insulated cable.
    const wireMaterial = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.29,
      metalness: 0.04,
      emissive: glow,
      emissiveIntensity: 0.2
    });

    const cable = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 48, 0.046, 12, false),
      wireMaterial
    );

    cable.castShadow = true;
    cable.receiveShadow = true;
    wireLayer.add(cable);

    // Thin reflective highlight along the upper surface of the cable.
    const highlightPoints = curve.getPoints(48).map(point =>
      point.clone().add(new THREE.Vector3(0, 0.041, 0))
    );

    const highlightCurve = new THREE.CatmullRomCurve3(highlightPoints);

    const highlightMaterial = new THREE.MeshBasicMaterial({
      color: highlight,
      transparent: true,
      opacity: 0.56
    });

    const shine = new THREE.Mesh(
      new THREE.TubeGeometry(highlightCurve, 48, 0.005, 6, false),
      highlightMaterial
    );

    shine.castShadow = false;
    shine.receiveShadow = false;
    wireLayer.add(shine);

    // Preserve the existing animated current indicator.
    const particle = new THREE.Mesh(
      new THREE.SphereGeometry(0.045, 12, 10),
      new THREE.MeshBasicMaterial({ color: 0xeaffff })
    );

    particle.visible = false;
    particleLayer.add(particle);

    electronParticles.push({
      mesh: particle,
      curve,
      index
    });
  });
}

function selectComponent(item) {
  selectedComponent = item;
  components.forEach(c => {
    c.selectionRing.material.opacity = c === item ? 0.72 : 0;
    c.selectionRing.scale.setScalar(c === item ? 1 : 0.86);
  });
  updateInspector();
}
function updateInspector() {
  const details = document.querySelector('#selected-details');
  const chip = document.querySelector('#selection-chip');
  if (!selectedComponent || !components.includes(selectedComponent)) {
    chip.textContent = 'NONE';
    details.innerHTML = `<div class="empty-selection"><span>⌖</span><strong>No component selected</strong><small>Select a part in Move mode to inspect and configure it.</small></div>`;
  } else {
    const item = selectedComponent; const meta = partMeta[item.type];
    chip.textContent = meta.kind;
    const componentControls = item.type === 'resistor'
      ? `<label class="control-label" for="resistance-value">Resistance <strong><span id="resistance-readout">${item.resistance}</span> Ω</strong></label><input id="resistance-value" class="range-input" type="range" min="100" max="1200" step="10" value="${item.resistance}" />`
      : item.type === 'switch'
      ? `<button id="toggle-switch" class="small-action">${item.switchClosed ? '● Close switch' : '○ Open switch'}</button>`
      : item.type === 'battery'
      ? `<label class="control-label" for="battery-voltage">Supply <strong><span id="battery-readout">${item.voltage || 9}</span> V</strong></label><input id="battery-voltage" class="range-input" type="range" min="3" max="12" step="0.5" value="${item.voltage || 9}" />`
      : `<div class="read-only-row"><span>Component type</span><strong>${meta.kind}</strong></div>`;
    details.innerHTML = `<div class="selected-title"><div class="selected-symbol" style="--component-color:${meta.color}">${item.type === 'battery' ? '▰' : item.type === 'resistor' ? '⌁' : item.type === 'led' ? '◉' : item.type === 'bulb' ? '✦' : '⏻'}</div><div><strong>${item.label}</strong><small>${meta.kind} · ID ${item.id}</small></div></div>${componentControls}<div class="read-only-row"><span>Terminal connections</span><strong>${connections.filter(c => c.a.componentId === item.id || c.b.componentId === item.id).length}</strong></div><button id="delete-selected" class="delete-action">Remove component</button>`;
    const resistance = document.querySelector('#resistance-value');
    if (resistance) resistance.addEventListener('input', () => { item.resistance = Number(resistance.value); document.querySelector('#resistance-readout').textContent = item.resistance; clearSimulation(); updateStats(); });
    const voltage = document.querySelector('#battery-voltage');
    if (voltage) voltage.addEventListener('input', () => { item.voltage = Number(voltage.value); document.querySelector('#battery-readout').textContent = item.voltage; document.querySelector('#stat-voltage').innerHTML = `${item.voltage.toFixed(1)} <em>V</em>`; clearSimulation(); updateStats(); });
    document.querySelector('#toggle-switch')?.addEventListener('click', () => { item.switchClosed = !item.switchClosed; item.switchLever.rotation.z = item.switchClosed ? 0 : -0.65; item.switchLever.material.color.set(item.switchClosed ? 0x78a8c8 : 0xec7184); clearSimulation(); updateInspector(); showToast(item.switchClosed ? 'Switch closed' : 'Switch opened'); });
    document.querySelector('#delete-selected')?.addEventListener('click', () => removeComponent(item));
  }
  updateStats();
}
function removeComponent(item) {
  connections = connections.filter(c => c.a.componentId !== item.id && c.b.componentId !== item.id);
  components = components.filter(c => c !== item);
  redoConnections = [];
updateHistoryButtons();
  componentLayer.remove(item.group); item.group.traverse(obj => { if (obj.geometry) obj.geometry.dispose(); });
  scene.remove(item.selectionRing); item.selectionRing.geometry.dispose(); item.selectionRing.material.dispose();
  terminalMeshes.splice(0, terminalMeshes.length, ...terminalMeshes.filter(t => t.userData.endpoint?.componentId !== item.id));
  selectedComponent = components.at(-1) || null;
  clearSimulation(); rebuildWires(); updateUI();
  showToast(`${item.label} removed`);
}
function clearSimulation() {
  simulation = null;
  components.forEach(item => {
    item.glowMeshes?.forEach(material => { if (material.emissive) material.emissiveIntensity = 0.2; });
    if (item.glowLight) item.glowLight.intensity = 0;
  });
  electronParticles.forEach(p => p.mesh.visible = false);
  const title = document.querySelector('#simulation-title');
  if (title) {
    document.querySelector('#simulation-badge').textContent = 'STANDBY';
    document.querySelector('#simulation-badge').className = 'status-badge';
    title.textContent = 'Ready to test';
    document.querySelector('#simulation-message').textContent = 'Add components, connect their terminals, then run the circuit check.';
    document.querySelector('#stat-simulation').textContent = 'Standby';
    document.querySelector('#stat-simulation').className = 'status-idle';
    document.querySelector('#metric-current').innerHTML = '— <em>mA</em>';
    document.querySelector('#metric-load').innerHTML = '— <em>V</em>';
    document.querySelector('#current-bar').style.width = '0%';
    document.querySelector('#voltage-bar').style.width = '0%';
  }
}
function buildCircuitGraph() {
  const adjacency = new Map(); const edges = [];
  const addEdge = (a, b, data) => {
    if (!adjacency.has(a)) adjacency.set(a, []);
    if (!adjacency.has(b)) adjacency.set(b, []);
    const edge = { a, b, ...data };
    adjacency.get(a).push({ node: b, edge, direction: 1 });
    adjacency.get(b).push({ node: a, edge, direction: -1 });
    edges.push(edge);
  };
  connections.forEach(c => addEdge(`${c.a.componentId}:${c.a.terminalIndex}`, `${c.b.componentId}:${c.b.terminalIndex}`, { kind: 'wire', wire: c }));
  components.forEach(item => {
    if (item.type === 'battery') return;
    if (item.type === 'switch' && !item.switchClosed) return;
    addEdge(`${item.id}:0`, `${item.id}:1`, { kind: 'component', component: item });
  });
  return { adjacency, edges };
}
function findCircuitPath() {
  const battery = components.find(c => c.type === 'battery');
  if (!battery) return { ok: false, reason: 'Add a DC battery to provide power.' };
  const start = `${battery.id}:0`, target = `${battery.id}:1`;
  const { adjacency } = buildCircuitGraph();
  const queue = [start]; const seen = new Set([start]); const prev = new Map();
  while (queue.length) {
    const node = queue.shift();
    if (node === target) break;
    for (const e of adjacency.get(node) || []) {
      if (!seen.has(e.node)) { seen.add(e.node); prev.set(e.node, { node, edge: e.edge, direction: e.direction }); queue.push(e.node); }
    }
  }
  if (!seen.has(target)) return { ok: false, reason: 'No closed path yet. Connect battery + through a load and back to battery −.' };
  const path = []; let node = target;
  while (node !== start) { const p = prev.get(node); if (!p) break; path.push({ ...p.edge, direction: p.direction, from: p.node, to: node }); node = p.node; }
  path.reverse();
  const partsOnPath = path.filter(e => e.kind === 'component').map(e => ({ item: e.component, direction: e.direction }));
  const ledEntries = partsOnPath.filter(e => e.item.type === 'led');
  if (ledEntries.some(e => e.direction === -1)) return { ok: false, reason: 'The LED is reversed. Swap its anode (A) and cathode (K) connections.', path, partsOnPath, fault: 'polarity' };
  if (!partsOnPath.some(e => ['resistor', 'bulb', 'led'].includes(e.item.type))) return { ok: false, reason: 'The loop has no load. Add a resistor, LED, or bulb.', path, partsOnPath };
  const voltage = battery.voltage || 9;
  const resistorTotal = partsOnPath.filter(e => e.item.type === 'resistor').reduce((s, e) => s + e.item.resistance, 0);
  const bulbTotal = partsOnPath.filter(e => e.item.type === 'bulb').reduce((s, e) => s + (e.item.resistance || 60), 0);
  const diodeDrop = ledEntries.length * 2;
  const remainingVoltage = Math.max(0, voltage - diodeDrop);
  const totalR = resistorTotal + bulbTotal;
  const amps = remainingVoltage / Math.max(totalR, 1);
  if (ledEntries.length && resistorTotal === 0 && bulbTotal === 0) return { ok: false, reason: 'Overcurrent risk. Add a series resistor before powering the LED.', path, partsOnPath, fault: 'overcurrent', amps, voltage };
  if (ledEntries.length && amps > 0.02) return { ok: false, reason: `Current is ${(amps * 1000).toFixed(1)} mA, above the simple 20 mA LED target. Increase the series resistance.`, path, partsOnPath, fault: 'overcurrent', amps, voltage };
  return { ok: true, reason: 'A closed path is detected and the simplified DC checks passed.', path, partsOnPath, voltage, amps, loadVoltage: diodeDrop + amps * totalR, totalR };
}
function runSimulation() {
  const result = findCircuitPath();
  simulation = result;
  components.forEach(item => {
    const powered = result.ok && result.partsOnPath?.some(e => e.item === item) && ['led', 'bulb'].includes(item.type);
    item.glowMeshes?.forEach(material => { if (material.emissive) material.emissiveIntensity = powered ? 2.0 : 0.2; });
    if (item.glowLight) item.glowLight.intensity = powered ? (item.type === 'bulb' ? 3.8 : 2.5) : 0;
  });
  electronParticles.forEach(p => p.mesh.visible = Boolean(result.ok));
  const badge = document.querySelector('#simulation-badge');
  const title = document.querySelector('#simulation-title');
  const message = document.querySelector('#simulation-message');
  const statSimulation = document.querySelector('#stat-simulation');
  if (result.ok) {
    badge.textContent = 'PASS'; badge.className = 'status-badge success';
    title.textContent = 'Circuit is live'; message.textContent = result.reason;
    statSimulation.textContent = 'Running'; statSimulation.className = 'status-live';
    document.querySelector('#metric-current').innerHTML = `${(result.amps * 1000).toFixed(1)} <em>mA</em>`;
    document.querySelector('#metric-load').innerHTML = `${result.loadVoltage.toFixed(2)} <em>V</em>`;
    document.querySelector('#current-bar').style.width = `${Math.min(100, result.amps * 1000 / 25 * 100)}%`;
    document.querySelector('#voltage-bar').style.width = `${Math.min(100, result.loadVoltage / result.voltage * 100)}%`;
    document.querySelector('#app-status').textContent = 'SIMULATION RUNNING';
    showToast('Circuit test passed — animated current is flowing', 'success');
  } else {
    badge.textContent = result.fault ? 'CHECK' : 'INCOMPLETE'; badge.className = `status-badge ${result.fault ? 'warning' : ''}`;
    title.textContent = result.fault ? 'Needs attention' : 'Circuit incomplete'; message.textContent = result.reason;
    statSimulation.textContent = result.fault ? 'Check circuit' : 'Incomplete'; statSimulation.className = 'status-warning';
    document.querySelector('#app-status').textContent = 'CHECK CIRCUIT';
    document.querySelector('#metric-current').innerHTML = '0.0 <em>mA</em>';
    document.querySelector('#metric-load').innerHTML = '— <em>V</em>';
    document.querySelector('#current-bar').style.width = '0%';
    document.querySelector('#voltage-bar').style.width = '0%';
    showToast(result.reason, 'warn');
  }
  updateStats();
}
document.querySelector('#run-simulation').addEventListener('click', runSimulation);
document.querySelector('#clear-board').addEventListener('click', () => {
  components.forEach(item => { componentLayer.remove(item.group); scene.remove(item.selectionRing); item.group.traverse(obj => { obj.geometry?.dispose(); }); item.selectionRing.geometry.dispose(); item.selectionRing.material.dispose(); });
  components = []; connections = []; redoConnections = []; selectedComponent = null; firstTerminal = null; nextId = 1;
updateHistoryButtons();
  terminalMeshes.splice(0, terminalMeshes.length); clearSimulation(); rebuildWires(); updateUI(); showToast('Workbench cleared');
});
document.querySelector('#reset-camera').addEventListener('click', () => {
  camera.position.set(8.8, 8.5, 10.5); controls.target.set(0, 0.4, 0); controls.update(); showToast('Camera view reset');
});
document.querySelector('#undo-btn')?.addEventListener('click', undoConnection);
document.querySelector('#redo-btn')?.addEventListener('click', redoConnection);

function updateStats() {
  document.querySelector('#stat-components').textContent = components.length;
  document.querySelector('#stat-connections').textContent = connections.length;
  const battery = components.find(c => c.type === 'battery');
  document.querySelector('#stat-voltage').innerHTML = `${(battery?.voltage || 9).toFixed(1)} <em>V</em>`;
  const count = document.querySelector('#inventory-count'); if (count) count.textContent = `${components.length} ITEM${components.length === 1 ? '' : 'S'}`;
  const inventory = document.querySelector('#inventory-list');
  if (inventory) {
    inventory.innerHTML = components.length ? components.map(item => `<button class="inventory-item ${selectedComponent === item ? 'selected' : ''}" data-select-id="${item.id}"><span class="inventory-swatch" style="--component-color:${partMeta[item.type].color}"></span><span><strong>${item.label}</strong><small>ID ${item.id} · ${partMeta[item.type].kind}</small></span><span class="inventory-chevron">›</span></button>`).join('') : '<p class="inventory-empty">Your added components will appear here.</p>';
    inventory.querySelectorAll('[data-select-id]').forEach(btn => btn.addEventListener('click', () => { const item = components.find(c => c.id === btn.dataset.selectId); if (item) { setMode('move'); selectComponent(item); camera.lookAt(item.group.position); controls.target.copy(item.group.position); } }));
  }
}
function updateUI() { updateInspector(); updateStats(); }

// The scene stays animated: subtle lighting movement, component glows, and electron particles during a successful test.

function animate() {
  requestAnimationFrame(animate);

  const delta = Math.min(clock.getDelta(), 0.05);
  elapsed += delta;

  controls.update();

  cyanLight.position.x =
    -5 + Math.sin(elapsed * 0.24) * 1.2;

  blueLight.position.z =
    3 + Math.cos(elapsed * 0.2) * 1.0;

  components.forEach((item) => {
    if (item.selectionRing && item === selectedComponent) {
      item.selectionRing.material.opacity =
        0.5 + Math.sin(elapsed * 3) * 0.18;
    }

    const powered = Boolean(
      simulation?.ok &&
      simulation.partsOnPath?.some(
        (entry) => entry.item === item
      ) &&
      ["bulb", "led"].includes(item.type)
    );

    if (item.glowLight) {
      if (powered) {
        const baseIntensity =
          item.type === "bulb" ? 10 : 4.5;

        item.glowLight.intensity =
          baseIntensity *
          (0.96 + Math.sin(elapsed * 9) * 0.04);
      } else {
        item.glowLight.intensity = 0;
      }
    }

    if (item.type === "bulb" && item.glowMeshes?.[0]) {
  if (powered) {
    item.glowMeshes[0].emissiveIntensity =
      4.2 + Math.sin(elapsed * 10) * 0.25;
  } else {
    item.glowMeshes[0].emissiveIntensity = 0.08;
  }
}
  });

  if (simulation?.ok) {
    electronParticles.forEach((particle, index) => {
      const t =
        (elapsed * 0.32 + index * 0.21) % 1;

      particle.mesh.position.copy(
        particle.curve.getPointAt(t)
      );

      particle.mesh.scale.setScalar(
        0.8 + 0.25 * Math.sin(elapsed * 7 + index)
      );
    });
  }

  renderer.render(scene, camera);
}

const clock = new THREE.Clock();
function resizeRenderer() {
  const width = container.clientWidth || viewport.clientWidth;
  const height = container.clientHeight || viewport.clientHeight;
  if (!width || !height) return;
  camera.aspect = width / height; camera.updateProjectionMatrix(); renderer.setSize(width, height, false);
}
const resizeObserver = new ResizeObserver(resizeRenderer);
resizeObserver.observe(container);
window.addEventListener('resize', resizeRenderer);
setTimeout(() => { resizeRenderer(); loadingOverlay.classList.add('hidden'); }, 250);
updateUI();
updateHistoryButtons();
setMode('move');
// Add a starter circuit layout so the viewport is never an empty demo.
addComponent('battery'); addComponent('resistor'); addComponent('led');
selectComponent(components[0]);
animate();
