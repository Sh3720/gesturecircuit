# GestureCircuit 3D

**A 3D Gesture-Controlled Virtual Electronics Laboratory**

GestureCircuit is an interactive, browser-based virtual electronics workbench that allows users to build and simulate basic electronic circuits in a 3D environment.

Built using **Three.js, JavaScript and MediaPipe**, the project combines 3D visualization with real-time hand tracking to make circuit building more interactive and accessible.

Users can interact with electronic components using traditional mouse controls or hand gestures through a webcam.

## Live Demo

🚀 **Try GestureCircuit:** https://gesturecircuit.netlify.app/

Open the application in Chrome, allow webcam access, and experience interactive 3D circuit building using hand gestures.

**No installation required!**

## Features

### 3D Virtual Electronics Workbench
- Interactive 3D electronics workspace.
- Three-dimensional electronic component models.
- Realistic lighting, materials and visual effects.
- Camera rotation and zoom controls.

### Electronic Components
- Battery
- Resistor
- LED
- Mini Bulb
- Switch

### Hand Gesture Recognition
- Real-time hand tracking using MediaPipe.
- Index fingertip tracking for on-screen interaction.
- Pinch gestures to select and move components.
- Gesture-based terminal selection and wire connections.

### Circuit Building
- Interactive component placement and movement.
- Connect electronic components through virtual terminals.
- Red and black 3D connection wires.
- Visual representation of circuit connections.

### Circuit Simulation
- Simplified DC circuit testing.
- Basic circuit continuity validation.
- LED polarity checking.
- Simplified current-limit checking.
- Visual glow effects for powered LEDs and bulbs.

### Workbench Controls
- Move Mode
- Wire Mode
- Orbit Mode
- Undo and Redo wire connections.
- Clear Board functionality.

### Component Inspector
- Adjust battery supply voltage.
- Change resistor resistance.
- Open and close the circuit switch.

## Technology Stack

| Technology | Purpose |
|---|---|
| JavaScript | Core application logic |
| Three.js | 3D graphics and visualization |
| MediaPipe | Real-time hand tracking |
| Vite | Development server and build tool |
| HTML5 | Application structure |
| CSS3 | Interface styling |

## Getting Started

### Prerequisites

- Windows, macOS or Linux
- Node.js and npm
- Visual Studio Code (recommended)
- Google Chrome or another modern browser
- Webcam for hand gesture interaction

### Installation on Windows

**1. Clone the repository**

```bash
git clone https://github.com/Sh3720/gesturecircuit.git
```

**2. Open the project folder**

Open the cloned `gesturecircuit` folder in Visual Studio Code.

**3. Install dependencies**

```bash
npm install
```

**4. Start the development server**

```bash
npm run dev
```

**5. Open the application**

Open the local URL provided by Vite, usually:

```text
http://localhost:5173/
```

Allow webcam access when prompted to use hand gesture controls.

### Production Build

To generate the production build, run:

```bash
npm run build
```

Vite generates the production-ready files inside the `dist` directory.

## How to Use

1. Open GestureCircuit in your browser.
2. Allow webcam access for hand tracking.
3. Select an electronic component from the component panel.
4. Use Move Mode to position components on the workbench.
5. Use Wire Mode to connect component terminals.
6. Use hand gestures or mouse interactions to build circuits.
7. Adjust component properties using the inspector.
8. Run the circuit test to check the basic electrical connections.
9. Use Undo and Redo to manage wire connections.

## Project Limitations

GestureCircuit is an educational prototype designed for interactive learning and demonstrations.

The current simulation engine uses simplified DC circuit validation. It is not an engineering-grade circuit simulator and does not replace professional tools such as SPICE.

Advanced electrical analysis, parallel network simulation, transient response, component tolerances and thermal modelling are not currently implemented.

## Future Development Roadmap

- [ ] Capacitors and inductors
- [ ] RC and RL circuit simulation
- [ ] RLC circuit simulation and resonance
- [ ] Series and parallel circuit analysis
- [ ] Real-time voltage and current graphs
- [ ] Advanced circuit validation and debugging
- [ ] AI-powered circuit explanations
- [ ] Additional electronic components and experiments

## Project Status

**Version 1.0 — Initial Working Release**

GestureCircuit is an evolving project. The current version focuses on interactive 3D circuit construction, gesture-based controls and basic DC circuit simulation.

Future releases will introduce more advanced electronic components, simulation capabilities and intelligent learning features.

## Author

**Shreyansu Mahesh**

B.Tech — Computer Science and Business Systems

GitHub: [@Sh3720](https://github.com/Sh3720)

---

*GestureCircuit — Bringing electronics learning into an interactive 3D world.*