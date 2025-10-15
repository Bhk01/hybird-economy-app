# Hybrid Economy App
This repository contains the Work & Invest hybrid economy demo app (React + TypeScript + Vite).
Quick start
```bash
# install
npm install

# dev
npm run dev

# build
npm run build

# tests
npm test
```

Notes

- The project uses a localStorage-backed mock API located at `src/utils/api.tsx` for offline/manual testing.
- The app is built with Vite; code-splitting is applied for large route components.

Tests and CI

- Unit tests use Vitest and run in a `jsdom` environment. Tests are placed in the `tests/` folder.
- A GitHub Actions workflow is included at `.github/workflows/ci.yml` to run `npm ci`, `npm run build`, and `npm test` on PRs and pushes to `main`.

Run tests locally with:

```bash
npm test
```

If you add tests, avoid relying on wall-clock timing. The mock backend uses `localStorage`, so tests run deterministically in jsdom.

Publishing

- Build the app and deploy the `build/` directory to a static host (Vercel, Netlify, or static S3+CloudFront).
- Ensure environment-specific secrets are not committed. The mock backend uses namespaced localStorage keys (prefix `work_invest_mock_`).

  # Hybrid Economy App

  This is a code bundle for Hybrid Economy App. The original project is available at https://www.figma.com/design/3wo4k2UWSxc9hHid1cII6e/Hybrid-Economy-App.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.
  