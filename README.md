# Goblin Horde — Class Wars

A browser-based 2D wave survival game. Pick a class, survive escalating waves of enemies, spend perk points to build your character.

---

## How to Run

copy project to local directory
```bash
cd <local directory>

python -m http.server 8001
```

Then open `http://localhost:8001` in your browser.

---

## File Structure

```
index.html      — layout, HUD, overlays (class select, perks)
style.css       — all styling
constants.js    — canvas setup, global constants (W, H, T, GV, RAMPS)
classes.js      — all 10 class definitions (abilities, perks, ultimates, draw functions)
engine.js       — game state, physics, enemy AI, particle system, perk/level logic
draw.js         — render loop (background, enemies, player, particles, effects)
```

**Load order matters** — `index.html` loads scripts in this sequence:
`constants.js` → `classes.js` → `engine.js` → `draw.js`

---

## Game Loop

```
requestAnimationFrame
        │
        ▼
   update()                         draw()
        │                               │
        ├─ tick enemies                 ├─ drawBg()
        ├─ move + collide player        ├─ drawProjs()
        ├─ update projectiles           ├─ drawTraps()
        ├─ update particles             ├─ drawEffects()
        ├─ update floats                ├─ draw enemies
        ├─ check wave completion        ├─ drawPlayer()
        └─ updateHUD()                  ├─ draw particles
                                        ├─ draw floats
                                        └─ draw HUD overlays
```

---

## Architecture Flowchart

```
┌─────────────────────────────────────────────────────┐
│                     index.html                      │
│         HUD · canvas · class select · perks         │
└──────────────────────┬──────────────────────────────┘
                       │ user clicks ENTER THE ARENA
                       ▼
              confirmClass()
                       │
                       ▼
            resetAndStart()  ◄──────────────────┐
            sets G state,                        │
            spawns player                        │ Restart
                       │                         │
                       ▼                         │
         ┌─────────────────────────┐             │
         │      Game Loop          │             │
         │  update() + draw()      │             │
         │  ~60fps via rAF         │             │
         └──────┬──────────────────┘             │
                │                                │
       ┌────────┴────────┐                       │
       ▼                 ▼                       │
   update()           draw()                     │
       │                 │                       │
   ┌───┴───┐         renders:                    │
   │ enemy │         background                  │
   │  AI   │         platforms                   │
   │ move  │         enemies                     │
   │ shoot │         player                      │
   └───┬───┘         particles                   │
       │             floats                      │
       ▼             HUD overlays                │
  collision                                      │
  with player                                    │
       │                                         │
       ▼                                         │
   hurtE() ──► killE() ──► score/XP update       │
                  │                              │
                  ▼                              │
            XP threshold?                        │
                  │                              │
                 YES                             │
                  │                              │
                  ▼                              │
          showLvlBanner()                        │
          G.running = false                      │
          emitP (magic burst)                    │
                  │                              │
                  ▼ (1000ms)                     │
          togglePerks()                          │
          player selects perk                    │
                  │                              │
                  ▼                              │
          buyPerk() / buyUlt()                   │
          G.running = true ───────────────────── ┘
                  │
                  ▼
          wave cleared?
                  │
                 YES
                  │
                  ▼
          next wave spawns
          enemies scale up
```

---

## Particle System

All particles live in `G.parts[]`. Each frame: move → apply physics → fade → remove when dead.

```
emitP(g, x, y, options)
        │
        ▼
  G.parts.push({
    x, y,
    vx, vy,        — velocity + vxBias/vyBias for directional effects
    life,          — 1.0 → 0.0
    fade,          — how fast life drops (lower = longer lived)
    col,           — fallback flat color
    ramp,          — optional color array (e.g. RAMPS.fire)
    sz             — birth size, shrinks with life
  })
        │
        ▼ each frame (engine.js)
  pt.x  += pt.vx
  pt.y  += pt.vy
  pt.vy += 0.18     — gravity
  pt.vx *= 0.91     — horizontal drag
  pt.vy *= 0.93     — vertical drag
  pt.life -= pt.fade
        │
        ▼ draw.js
  color = rampCol(pt.ramp, pt.life)  — interpolates through ramp
  alpha = clamp(pt.life, 0, 1)
  size  = pt.sz * clamp(pt.life, 0, 1)
  draw circle at pt.x, pt.y
```

### Available Ramps

| Name    | Colors                                    | Used for         |
|---------|-------------------------------------------|------------------|
| `fire`  | white → yellow → orange → red → dark red  | enemy death      |
| `magic` | white → lavender → purple → dark purple   | level up, spells |
| `blood` | pink → red → dark red → near black        | player hit       |
| `gold`  | white → pale yellow → gold → dark gold    | pickups, buffs   |
| `ice`   | white → light blue → blue → deep blue     | freeze effects   |

---

## Classes

| Class    | Resource  | Playstyle                        |
|----------|-----------|----------------------------------|
| Wizard   | Mana      | Ranged spells, freeze, teleport  |
| Knight   | Stamina   | Melee tank, warcry, shield bash  |
| Ranger   | Arrows    | Long range, traps, death mark    |
| Ninja    | Energy    | Fast melee, stealth, clones      |
| Cleric   | Faith     | Healing, holy smite, wards       |
| Cowboy   | Ammo      | Gunslinger, lasso, dogmeat       |
| Cyborg   | Power     | VATS system, plasma, stim pack   |
| Gorilla  | Rage      | Slam AoE, rampage, knockback     |
| Vault    | AP        — Fallout-themed, turrets, grenades |
| Jedi     | Force     | Deflect, force push, lightsaber  |

Each class has 4 abilities, 4 perk trees (4 perks each), and 2 unlockable ultimates.

---

## Enemy Waves

Enemies unlock progressively by wave:

| Wave | New enemies unlocked         |
|------|------------------------------|
| 1    | Goblins                      |
| 2    | Ranged (archers, shamans)    |
| 3    | Skeletons                    |
| 5    | Orcs                         |
| 7    | Mummies                      |
| 8    | Spiders                      |
| 9    | Werewolves                   |
| 10   | Vampires                     |
| 12   | Trolls                       |
| 14   | Golems                       |

---

## Dev Mode

In `engine.js`, set `const DEV = true` to skip the spawn delay and start on wave 5. Set to `false` before sharing.
