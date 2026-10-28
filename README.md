# Las Vegas Ballpark Revenue Planner

An opening-season revenue model for a 33,000-seat domed ballpark on the Las Vegas Strip. Independent concept by Cole Mellone, built from public information. Not affiliated with the A's or MLB.

Built with React, Vite, Tailwind CSS and Recharts.

## Where things live

- `src/model.ts` – every input (with scenario values, tier, source and rationale), the sources list, and the `compute()` function that drives every page. Change a default here.
- `src/pages/` – one file per page (Overview, Revenue, Premium, Events, Risk, Model, Method).
- `src/components/Shell.tsx` – sidebar, top bar and scenario switch.
- `tailwind.config.js` – colors and fonts.

Edits a visitor makes on the Model page are saved only in their own browser, so nobody can change what another visitor sees.

## Run it locally (optional)

```
npm install
npm run dev
```

## Deploy

Vercel detects the project as Vite automatically. Build command `npm run build`, output folder `dist`.
