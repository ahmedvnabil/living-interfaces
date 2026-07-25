# Contributing

Thank you for helping Living Interfaces become a dependable home for
framework-free generative visuals.

## Set up

```bash
npm install
npm test
npm run typecheck
npm run serve
```

Open `http://localhost:4173`. Source lives in `src/`; generated ES modules live
in `assets/`. Do not edit generated files directly.

## Add an asset

1. Add a focused module under `src/simulations/`.
2. Extend `Canvas2DAsset`, `ThreeAsset`, or `AssetBase`.
3. Add metadata and bounded parameters to `src/core/catalog.ts`.
4. Implement the full lifecycle: `init`, `destroy`, `pause`, `resume`, `resize`,
   `setTheme`, and `setData`.
5. Make random behavior deterministic through the provided seeded RNG.
6. Honor reduced motion and clean up RAFs, observers, workers, listeners, and
   WebGL resources.
7. Add or update tests and run `npm run check`.

Assets should work at arbitrary container sizes, remain readable in dark and
light themes, and avoid network requests or tracking.

## Pull requests

Keep changes focused and use Conventional Commits (`feat:`, `fix:`,
`refactor:`, `docs:`, `test:`). Explain the user impact and include a preview
for visual changes. By contributing, you agree that your contribution is
licensed under the repository license.
