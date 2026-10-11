# ⚽ Club Empire — Football Manager Online

A polished, mobile-responsive football management simulator built with vanilla HTML, CSS and JavaScript, now integrated with Club Empire online leagues.

## Included in this final build

- 5 football countries and their league ecosystems
- League seasons, fixtures, tables, promotion/relegation and cups
- Champions League and Europa League paths
- Minute-by-minute match engine
- Match statistics, player ratings, goals, cards, injuries and substitutions
- Half-time tactical management for league matches
- Manual starting XI and player instructions
- Advanced formations, mentality, pressing, tempo and defensive setup
- Transfers, loans, free agents, AI bids and contracts
- Player development and position-specific training
- GK-specific attributes and OVR calculation
- Player traits, morale, form and development
- Staff: assistant, fitness, physio, youth coach, scout and set-piece coach
- Youth academy and youth development
- Stadium, training-ground and academy infrastructure
- Sponsorship and marketing systems
- Dynamic news and manager/club reputation systems
- Awards, career history and Hall of Fame
- Local save/load career persistence
- Responsive premium Football OS interface for desktop and mobile
- No external npm dependencies and no build step required

## Run on Termux / Android

```bash
cd ~/YOUR_FOLDER_NAME
bash run-termux.sh
```

Then open Chrome and visit:

`http://localhost:8088`

Or run directly:

```bash
node server.mjs
```

## Run on desktop

Any current Node.js version with ES module support works:

```bash
node server.mjs
```

Then open `http://localhost:8088`.

## Online multiplayer

This ZIP also includes a real persistent multiplayer backend under `backend/`. It provides authentication, room codes, PostgreSQL shared worlds, server-side action validation, conflict protection, live events and an action audit log. It does **not** fake multiplayer by copying LocalStorage between browsers.

### Termux

1. Create `backend/.env` from `backend/.env.example` and add your PostgreSQL `DATABASE_URL`.
2. Initialize the database: `psql "$DATABASE_URL" -f backend/schema.sql`
3. Run `bash run-online-termux.sh`.
4. Open `http://localhost:8088`.

See `ONLINE_SETUP.md` for production deployment and Vercel/Node hosting instructions.

## Save system

The career is stored in the browser's LocalStorage. Use the **Save** button in the game hub before leaving or changing browser data.


## Career Lab & Legends
- New careers open with **Career Lab** before club selection.
- Starting budget, budget multiplier, wage budget, AI strength, transfer activity, youth quality, injury rate and economy inflation are customizable.
- **Legends & Retired Icons** can be enabled per career.
- Legend modes: Transfer Market, Free Agents, Mixed World and Legend Draft.
- Legend density controls how many historical players enter the world.
- Legends appear in a dedicated transfer tab and use the normal club budget.
- Every career stores its setup in the save so worlds remain independent.


## Club Empire integration
See `CLUB_EMPIRE_INTEGRATION.md` for the merged architecture, local Termux setup, hosted database setup, deployment split and current multiplayer scope.

## Mobile app-style experience (Club Empire update)
- Phone-first fixed bottom navigation for Dashboard, Squad, Game Plan, Market and More.
- The More sheet opens every major management area without cramming all navigation buttons into the page.
- Random player/dressing-room storylines appear in the dashboard with three choices each. Decisions can affect squad morale, manager reputation and transfer funds where those fields exist in the career state.
- Story decisions are included in the local career state and trigger the existing save flow.

The storylines are generated from bundled templates and are a gameplay feature, not live news about real players.
