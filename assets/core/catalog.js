const p = (key, label, min, max, step, value) => ({ key, label, min, max, step, value });
const CATALOG = [
  {
    id: "flow-field",
    name: "Flow Field",
    subtitle: "Advectio particularum \xB7 curl noise",
    description: "Particles advected through a divergence-free velocity field derived from the curl of gradient noise. Streamline density reveals the underlying vector topology.",
    tags: ["field", "particles"],
    renderer: "canvas2d",
    svgExport: false,
    params: [p("count", "Particles", 200, 4e3, 50, 1400), p("scale", "Field scale", 0.5, 6, 0.1, 2.2), p("speed", "Speed", 0.2, 3, 0.05, 1), p("drift", "Temporal drift", 0, 1, 0.01, 0.15)],
    path: "simulations/flow-field.js"
  },
  {
    id: "particle-system",
    name: "Particle System",
    subtitle: "Systema corpusculorum \xB7 forces",
    description: "A general emitter under gravity, drag and pointer attraction. Each particle integrates Newtonian forces with semi-implicit Euler stepping.",
    tags: ["particles", "physics"],
    renderer: "canvas2d",
    svgExport: false,
    params: [p("rate", "Emission rate", 5, 300, 5, 90), p("gravity", "Gravity", -1, 1, 0.02, 0.12), p("drag", "Drag", 0.8, 1, 5e-3, 0.985), p("life", "Lifetime s", 1, 8, 0.5, 3.5)],
    path: "simulations/particle-system.js"
  },
  {
    id: "slime-mold",
    name: "Slime Mold",
    subtitle: "Physarum polycephalum \xB7 network formation",
    description: "Transport-network formation between nutrient sites, modeled as agents reinforcing efficient paths. The emergent graph approximates Steiner-like minimal networks.",
    tags: ["biology", "agents"],
    renderer: "canvas2d",
    svgExport: false,
    params: [p("foods", "Nutrient sites", 3, 14, 1, 7), p("agents", "Agents", 200, 3e3, 100, 1200), p("decay", "Trail decay", 0.9, 0.999, 1e-3, 0.975), p("sense", "Sensor angle", 0.1, 1.2, 0.05, 0.5)],
    path: "simulations/slime-mold.js"
  },
  {
    id: "physarum",
    name: "Physarum",
    subtitle: "Chemotaxis simulata \xB7 trail following",
    description: "Classic agent-based physarum: sense, rotate, deposit, diffuse, decay. Millions of micro-decisions condense into vascular patterns.",
    tags: ["biology", "agents"],
    renderer: "canvas2d",
    svgExport: false,
    params: [p("agents", "Agents", 500, 8e3, 100, 3e3), p("turn", "Turn rate", 0.05, 1, 0.01, 0.35), p("sensorDist", "Sensor distance", 2, 20, 1, 9), p("decay", "Decay", 0.85, 0.99, 5e-3, 0.93)],
    path: "simulations/physarum.js"
  },
  {
    id: "voronoi",
    name: "Voronoi Tessellation",
    subtitle: "Tessellatio Voronoi \xB7 proximity partition",
    description: "The plane partitioned by nearest-seed proximity. Cells are computed by exact half-plane intersection and drift under Lloyd-like relaxation.",
    tags: ["geometry"],
    renderer: "canvas2d",
    svgExport: true,
    params: [p("seeds", "Seeds", 8, 80, 1, 28), p("jitter", "Drift", 0, 2, 0.05, 0.6), p("relax", "Relaxation", 0, 1, 0.02, 0.2)],
    path: "simulations/voronoi.js"
  },
  {
    id: "reaction-diffusion",
    name: "Reaction\u2013Diffusion",
    subtitle: "Gray\u2013Scott \xB7 morphogenesis",
    description: "Two virtual chemicals feed, kill and diffuse across a lattice. Turing instability produces spots, stripes and labyrinths from uniform noise.",
    tags: ["chemistry", "pde"],
    renderer: "worker",
    svgExport: false,
    params: [p("feed", "Feed rate", 0.02, 0.08, 1e-3, 0.037), p("kill", "Kill rate", 0.045, 0.07, 1e-3, 0.06), p("steps", "Steps / frame", 1, 16, 1, 8)],
    path: "simulations/reaction-diffusion.js"
  },
  {
    id: "cellular-automata",
    name: "Cellular Automata",
    subtitle: "Automata cellularia \xB7 discrete dynamics",
    description: "A toroidal lattice evolving under local birth/survival rules. Life-like rulesets are explored live; gliders and still lifes emerge unprompted.",
    tags: ["discrete", "emergence"],
    renderer: "canvas2d",
    svgExport: false,
    params: [p("cell", "Cell size", 3, 14, 1, 6), p("fill", "Initial density", 0.05, 0.6, 0.01, 0.22), p("rate", "Generations /s", 2, 30, 1, 12)],
    path: "simulations/cellular-automata.js"
  },
  {
    id: "boids",
    name: "Boids",
    subtitle: "Grex simulatus \xB7 Reynolds flocking",
    description: "Separation, alignment and cohesion \u2014 three local rules integrated over a spatial hash. Global flocking order emerges without a leader.",
    tags: ["agents", "emergence"],
    renderer: "canvas2d",
    svgExport: false,
    params: [p("count", "Boids", 40, 600, 10, 220), p("cohesion", "Cohesion", 0, 2, 0.05, 0.9), p("separation", "Separation", 0, 2, 0.05, 1.1), p("speed", "Max speed", 0.5, 4, 0.1, 1.8)],
    path: "simulations/boids.js"
  },
  {
    id: "wind-map",
    name: "Wind Map",
    subtitle: "Charta ventorum \xB7 streamline advection",
    description: "Meteorological streamlines traced through a slowly rotating synoptic field. Particle age maps to opacity, reading as wind intensity.",
    tags: ["field", "geo"],
    renderer: "canvas2d",
    svgExport: false,
    params: [p("lines", "Streamlines", 200, 3e3, 50, 1100), p("scale", "Synoptic scale", 0.5, 4, 0.1, 1.4), p("speed", "Wind speed", 0.2, 3, 0.05, 1.1)],
    path: "simulations/wind-map.js"
  },
  {
    id: "noise-field",
    name: "Noise Field",
    subtitle: "Campus perturbationis \xB7 fBm scalar field",
    description: "A fractal Brownian motion scalar field sampled on a lattice and rendered as a displaced dot matrix \u2014 the raw material of procedural worlds.",
    tags: ["field", "noise"],
    renderer: "canvas2d",
    svgExport: false,
    params: [p("grid", "Grid pitch", 6, 30, 1, 14), p("octaves", "Octaves", 1, 7, 1, 4), p("amp", "Displacement", 0, 30, 1, 10), p("flow", "Evolution", 0, 1, 0.01, 0.2)],
    path: "simulations/noise-field.js"
  },
  {
    id: "magnetic-field",
    name: "Magnetic Field",
    subtitle: "Campus magneticus \xB7 dipole lines",
    description: "Field lines integrated from superposed magnetic dipoles. Poles are draggable; the pointer itself carries a weak charge.",
    tags: ["physics", "field"],
    renderer: "canvas2d",
    svgExport: true,
    params: [p("poles", "Dipoles", 1, 6, 1, 2), p("lines", "Lines / pole", 8, 48, 2, 22), p("strength", "Strength", 0.2, 3, 0.1, 1)],
    path: "simulations/magnetic-field.js"
  },
  {
    id: "fluid-simulation",
    name: "Fluid Simulation",
    subtitle: "Navier\u2013Stokes \xB7 stable fluids",
    description: "Jos Stam's unconditionally stable solver: advect, diffuse, project. The pointer injects momentum and dye into an incompressible field.",
    tags: ["physics", "pde"],
    renderer: "canvas2d",
    svgExport: false,
    params: [p("res", "Grid resolution", 48, 128, 8, 80), p("visc", "Viscosity", 0, 1e-3, 5e-5, 2e-4), p("dye", "Dye amount", 10, 200, 5, 80)],
    path: "simulations/fluid-simulation.js"
  },
  {
    id: "wave-simulation",
    name: "Wave Simulation",
    subtitle: "Aequatio undarum \xB7 2-D wave equation",
    description: "The discrete wave equation on a height lattice with damped boundaries. Pointer impacts radiate, interfere and reflect.",
    tags: ["physics", "pde"],
    renderer: "canvas2d",
    svgExport: false,
    params: [p("res", "Lattice", 64, 200, 8, 120), p("damping", "Damping", 0.95, 0.999, 1e-3, 0.992), p("impulse", "Impulse", 50, 800, 10, 300)],
    path: "simulations/wave-simulation.js"
  },
  {
    id: "contour-map",
    name: "Contour Map",
    subtitle: "Isohypsae \xB7 marching squares",
    description: "Elevation isolines extracted by marching squares from an evolving fBm terrain. Index contours are weighted like survey sheets.",
    tags: ["geo", "field"],
    renderer: "canvas2d",
    svgExport: true,
    params: [p("levels", "Contour levels", 4, 24, 1, 12), p("scale", "Terrain scale", 0.5, 4, 0.1, 1.6), p("drift", "Drift", 0, 0.5, 0.01, 0.06)],
    path: "simulations/contour-map.js"
  },
  {
    id: "heat-map",
    name: "Heat Map",
    subtitle: "Diffusio caloris \xB7 Fourier lattice",
    description: "Heat sources diffusing across a conductive plate under the discrete heat equation. The pointer is a moving thermode.",
    tags: ["physics", "field"],
    renderer: "canvas2d",
    svgExport: false,
    params: [p("sources", "Sources", 1, 8, 1, 3), p("conduct", "Conductivity", 0.05, 0.3, 0.01, 0.16), p("cool", "Cooling", 0.9, 0.999, 1e-3, 0.985)],
    path: "simulations/heat-map.js"
  },
  {
    id: "terrain-generator",
    name: "Terrain Generator",
    subtitle: "Orogenesis proceduralis \xB7 fBm displacement",
    description: "A displaced wireframe lattice under multi-octave noise, lit as an orbiting survey model. Regeneration re-seeds the mountain range.",
    tags: ["3d", "geo"],
    renderer: "webgl",
    svgExport: false,
    params: [p("relief", "Relief", 0.2, 3, 0.05, 1.1), p("scale", "Feature scale", 0.5, 4, 0.1, 1.5), p("detail", "Octaves", 1, 7, 1, 5)],
    path: "simulations/terrain-generator.js"
  },
  {
    id: "hex-grid",
    name: "Hex Grid",
    subtitle: "Reticulum hexagonale \xB7 axial lattice",
    description: "An axial-coordinate hexagonal lattice with propagating activity waves. Cell state renders as fill weight, not glow.",
    tags: ["geometry", "grid"],
    renderer: "canvas2d",
    svgExport: true,
    params: [p("size", "Cell radius", 8, 36, 1, 18), p("waves", "Wave rate", 0.1, 2, 0.05, 0.6), p("falloff", "Falloff", 0.5, 4, 0.1, 1.6)],
    path: "simulations/hex-grid.js"
  },
  {
    id: "neural-network-graph",
    name: "Neural Network Graph",
    subtitle: "Rete neurale \xB7 feed-forward activations",
    description: "A layered perceptron with live activations pulsing along weighted edges. Edge weight maps to stroke width; sign maps to tone.",
    tags: ["network", "ml"],
    renderer: "canvas2d",
    svgExport: true,
    params: [p("layers", "Hidden layers", 1, 5, 1, 3), p("width", "Neurons / layer", 3, 12, 1, 6), p("rate", "Signal rate", 0.2, 3, 0.1, 1)],
    path: "simulations/neural-network-graph.js"
  },
  {
    id: "knowledge-graph",
    name: "Knowledge Graph",
    subtitle: "Graphus notionum \xB7 force-directed embedding",
    description: "Entities and relations settling under spring\u2013charge equilibrium. Clusters betray latent taxonomy; the pointer perturbs the manifold.",
    tags: ["network", "data"],
    renderer: "canvas2d",
    svgExport: true,
    params: [p("nodes", "Entities", 12, 120, 2, 46), p("charge", "Repulsion", 200, 3e3, 50, 1200), p("spring", "Spring K", 5e-3, 0.1, 5e-3, 0.03)],
    path: "simulations/knowledge-graph.js"
  },
  {
    id: "animated-nodes",
    name: "Animated Nodes",
    subtitle: "Constellatio nodorum \xB7 proximity linking",
    description: "Drifting nodes linked when nearer than a threshold radius. Link opacity encodes proximity \u2014 the quiet ambient classic, done with restraint.",
    tags: ["network", "ambient"],
    renderer: "canvas2d",
    svgExport: false,
    params: [p("count", "Nodes", 20, 200, 5, 70), p("radius", "Link radius", 40, 220, 5, 120), p("speed", "Drift speed", 0.05, 1.5, 0.05, 0.4)],
    path: "simulations/animated-nodes.js"
  },
  {
    id: "signal-propagation",
    name: "Signal Propagation",
    subtitle: "Propagatio signalis \xB7 graph traversal",
    description: "Impulses released from source nodes travel edge-by-edge with per-hop latency and decay, visualizing information spread through a network.",
    tags: ["network", "dynamics"],
    renderer: "canvas2d",
    svgExport: false,
    params: [p("nodes", "Nodes", 16, 120, 2, 54), p("rate", "Emission rate", 0.1, 3, 0.1, 0.8), p("decay", "Hop decay", 0.5, 1, 0.02, 0.86)],
    path: "simulations/signal-propagation.js"
  },
  {
    id: "path-finding",
    name: "Path Finding",
    subtitle: "Inventio itineris \xB7 A* search",
    description: "A* exploring a weighted grid maze: open set, closed set and the final geodesic rendered as archaeology of the search.",
    tags: ["algorithm", "grid"],
    renderer: "canvas2d",
    svgExport: false,
    params: [p("cell", "Cell size", 8, 26, 1, 14), p("walls", "Obstacle density", 0.1, 0.45, 0.01, 0.28), p("speed", "Search speed", 1, 40, 1, 12)],
    path: "simulations/path-finding.js"
  },
  {
    id: "swarm-intelligence",
    name: "Swarm Intelligence",
    subtitle: "Intelligentia gregis \xB7 particle swarm optimization",
    description: "A particle swarm minimizing a moving objective landscape. Personal and global bests pull the population toward consensus.",
    tags: ["agents", "optimization"],
    renderer: "canvas2d",
    svgExport: false,
    params: [p("count", "Particles", 20, 300, 10, 90), p("inertia", "Inertia", 0.5, 1, 0.01, 0.86), p("social", "Social pull", 0, 2, 0.05, 0.9)],
    path: "simulations/swarm-intelligence.js"
  },
  {
    id: "organic-growth",
    name: "Organic Growth",
    subtitle: "Crescentia differentialis \xB7 curve buckling",
    description: "A closed curve that resamples, repels and relaxes each step. Differential growth buckles it into coral-like folds.",
    tags: ["biology", "geometry"],
    renderer: "canvas2d",
    svgExport: true,
    params: [p("growth", "Growth rate", 0.1, 2, 0.05, 0.7), p("repulsion", "Repulsion", 2, 20, 0.5, 8), p("smooth", "Smoothing", 0, 1, 0.02, 0.4)],
    path: "simulations/organic-growth.js"
  },
  {
    id: "root-growth",
    name: "Root Growth",
    subtitle: "Rhizogenesis \xB7 gravitropic branching",
    description: "Root apices advancing under gravitropism with stochastic branching and nutrient-seeking curvature \u2014 a subterranean search algorithm.",
    tags: ["biology", "branching"],
    renderer: "canvas2d",
    svgExport: true,
    params: [p("tips", "Initial apices", 1, 8, 1, 3), p("branch", "Branch probability", 0, 0.08, 2e-3, 0.02), p("wander", "Wander", 0, 1, 0.02, 0.3)],
    path: "simulations/root-growth.js"
  },
  {
    id: "crystal-growth",
    name: "Crystal Growth",
    subtitle: "Crystallisatio \xB7 diffusion-limited aggregation",
    description: "Random walkers freezing on contact with the aggregate. Fractal dendrites grow with dimension \u2248 1.71 \u2014 matter organizing itself.",
    tags: ["physics", "fractal"],
    renderer: "canvas2d",
    svgExport: false,
    params: [p("walkers", "Walkers", 100, 2e3, 50, 700), p("stick", "Stick probability", 0.1, 1, 0.02, 0.7), p("sym", "Symmetry", 1, 8, 1, 1)],
    path: "simulations/crystal-growth.js"
  },
  {
    id: "l-system-trees",
    name: "L-System Trees",
    subtitle: "Systema Lindenmayer \xB7 grammar rewriting",
    description: "Bracketed L-system strings rewritten and interpreted as turtle graphics. Each seed is a new species; growth animates generation depth.",
    tags: ["biology", "grammar"],
    renderer: "canvas2d",
    svgExport: true,
    params: [p("depth", "Generations", 2, 7, 1, 5), p("angle", "Branch angle", 10, 45, 1, 24), p("decay", "Length decay", 0.5, 0.85, 0.01, 0.7)],
    path: "simulations/l-system-trees.js"
  },
  {
    id: "data-rivers",
    name: "Data Rivers",
    subtitle: "Flumina datorum \xB7 stacked stream series",
    description: "Time-series layers flowing as a braided stream. Band thickness encodes magnitude; setData() feeds live series into the river.",
    tags: ["data", "flow"],
    renderer: "canvas2d",
    svgExport: true,
    params: [p("series", "Series", 3, 10, 1, 5), p("speed", "Flow speed", 0.2, 3, 0.1, 1), p("turbulence", "Turbulence", 0, 1, 0.02, 0.3)],
    path: "simulations/data-rivers.js"
  },
  {
    id: "ribbon-trails",
    name: "Ribbon Trails",
    subtitle: "Taeniae sequentes \xB7 spring-chain kinematics",
    description: "Ribbons of chained springs pursuing attractors (or the pointer). Width tapers along arclength like a pen with momentum.",
    tags: ["motion", "interaction"],
    renderer: "canvas2d",
    svgExport: false,
    params: [p("ribbons", "Ribbons", 1, 12, 1, 5), p("segments", "Segments", 10, 80, 2, 36), p("stiffness", "Stiffness", 0.05, 0.6, 0.01, 0.22)],
    path: "simulations/ribbon-trails.js"
  },
  {
    id: "energy-streams",
    name: "Energy Streams",
    subtitle: "Flumina energiae \xB7 B\xE9zier transport",
    description: "Quanta transported along curved conduits between terminals. Throughput, direction and congestion are readable at a glance.",
    tags: ["flow", "network"],
    renderer: "canvas2d",
    svgExport: false,
    params: [p("conduits", "Conduits", 2, 12, 1, 6), p("quanta", "Quanta / conduit", 4, 40, 2, 16), p("speed", "Transport speed", 0.2, 3, 0.1, 1)],
    path: "simulations/energy-streams.js"
  },
  {
    id: "procedural-clouds",
    name: "Procedural Clouds",
    subtitle: "Nubes procedurales \xB7 volumetric fBm",
    description: "Ray-marched pseudo-volumetric cloud strata in a fragment shader \u2014 four octaves of drifting fBm density with height falloff.",
    tags: ["3d", "atmosphere"],
    renderer: "webgl",
    svgExport: false,
    params: [p("coverage", "Coverage", 0.2, 0.8, 0.02, 0.5), p("speed", "Wind", 0, 2, 0.05, 0.4), p("detail", "Detail", 1, 6, 1, 4)],
    path: "simulations/procedural-clouds.js"
  },
  {
    id: "distance-fields",
    name: "Distance Fields",
    subtitle: "Campi distantiae \xB7 signed distance functions",
    description: "A scene described purely as signed distance to primitives, visualized as banded isolines. Smooth-minimum blending merges bodies like mercury.",
    tags: ["geometry", "sdf"],
    renderer: "canvas2d",
    svgExport: false,
    params: [p("shapes", "Primitives", 2, 8, 1, 4), p("bands", "Iso bands", 4, 30, 1, 14), p("blend", "Smooth-min k", 5, 80, 1, 40)],
    path: "simulations/distance-fields.js"
  },
  {
    id: "vector-fields",
    name: "Vector Fields",
    subtitle: "Campus vectorius \xB7 quiver plot",
    description: "A quiver lattice sampling a time-varying analytic field. Arrow length and weight encode magnitude \u2014 the textbook figure, alive.",
    tags: ["field", "math"],
    renderer: "canvas2d",
    svgExport: true,
    params: [p("pitch", "Lattice pitch", 14, 48, 2, 26), p("scale", "Field scale", 0.5, 4, 0.1, 1.5), p("evolve", "Evolution", 0, 1, 0.02, 0.25)],
    path: "simulations/vector-fields.js"
  },
  {
    id: "network-topology",
    name: "Network Topology",
    subtitle: "Topologia retis \xB7 hierarchical infrastructure",
    description: "Core, aggregation and edge tiers with live health states and traffic pulses. An operations diagram drawn as an engineering document.",
    tags: ["network", "infra"],
    renderer: "canvas2d",
    svgExport: true,
    params: [p("edge", "Edge nodes", 4, 24, 1, 12), p("traffic", "Traffic rate", 0.1, 3, 0.1, 1), p("fail", "Fault probability", 0, 0.02, 1e-3, 4e-3)],
    path: "simulations/network-topology.js"
  },
  {
    id: "mesh-morphing",
    name: "Mesh Morphing",
    subtitle: "Metamorphosis polygonalis \xB7 vertex displacement",
    description: "An icosphere whose vertices ride layered noise between geometric archetypes. Wireframe over depth-toned faces, rotating like a specimen.",
    tags: ["3d", "geometry"],
    renderer: "webgl",
    svgExport: false,
    params: [p("amp", "Displacement", 0, 1.2, 0.02, 0.45), p("freq", "Noise frequency", 0.5, 5, 0.1, 1.8), p("speed", "Morph speed", 0, 2, 0.05, 0.5)],
    path: "simulations/mesh-morphing.js"
  },
  {
    id: "generative-typography",
    name: "Generative Typography",
    subtitle: "Typographia generativa \xB7 glyph particle sampling",
    description: "Glyph outlines sampled to a particle lattice that scatters and reassembles. Text remains data; setData() retypes the specimen.",
    tags: ["typography", "particles"],
    renderer: "canvas2d",
    svgExport: false,
    params: [p("density", "Sample density", 2, 10, 1, 5), p("scatter", "Scatter", 0, 200, 5, 60), p("return", "Return spring", 0.01, 0.3, 0.01, 0.08)],
    path: "simulations/generative-typography.js"
  },
  {
    id: "dynamic-grid",
    name: "Dynamic Grid",
    subtitle: "Reticulum reactivum \xB7 cursor field response",
    description: "A typographic lattice whose weight, scale and tone respond to pointer distance \u2014 the interface itself as a field instrument.",
    tags: ["grid", "interaction"],
    renderer: "canvas2d",
    svgExport: false,
    params: [p("pitch", "Pitch", 16, 60, 2, 32), p("radius", "Influence radius", 60, 300, 10, 150), p("gain", "Response gain", 0.2, 3, 0.1, 1.2)],
    path: "simulations/dynamic-grid.js"
  },
  {
    id: "living-background",
    name: "Living Background",
    subtitle: "Fundus vivens \xB7 ambient field layer",
    description: "A full-bleed ambient layer: sparse drifting motes over a breathing gradient field. Designed to sit behind content at near-zero cognitive cost.",
    tags: ["ambient", "background"],
    renderer: "canvas2d",
    svgExport: false,
    params: [p("motes", "Motes", 20, 200, 5, 70), p("breathe", "Breathing rate", 0.02, 0.4, 0.01, 0.08), p("presence", "Presence", 0.05, 0.6, 0.01, 0.2)],
    path: "simulations/living-background.js"
  },
  {
    id: "ai-thinking",
    name: "AI Thinking",
    subtitle: "Cogitatio machinae \xB7 attention dynamics",
    description: "A particle nucleus in query\u2013key oscillation: focus contracts, associations orbit, resolution releases. An honest visual for model latency.",
    tags: ["ambient", "ml"],
    renderer: "canvas2d",
    svgExport: false,
    params: [p("tokens", "Tokens", 20, 160, 5, 64), p("tempo", "Thinking tempo", 0.2, 2, 0.05, 0.7), p("focus", "Focus", 0.2, 1, 0.02, 0.6)],
    path: "simulations/ai-thinking.js"
  },
  {
    id: "cursor-physics",
    name: "Cursor Physics",
    subtitle: "Physica cursoris \xB7 spring-mass follower",
    description: "A mass-spring entourage trailing the pointer with critically-damped lag. Interface furniture that obeys F = ma.",
    tags: ["interaction", "physics"],
    renderer: "canvas2d",
    svgExport: false,
    params: [p("bodies", "Bodies", 3, 30, 1, 12), p("stiffness", "Stiffness", 0.02, 0.4, 0.01, 0.12), p("damping", "Damping", 0.5, 0.95, 0.01, 0.8)],
    path: "simulations/cursor-physics.js"
  }
];
function getMeta(id) {
  const m = CATALOG.find((x) => x.id === id);
  if (!m) throw new Error(`Unknown module: ${id}`);
  return m;
}
export {
  CATALOG,
  getMeta
};
