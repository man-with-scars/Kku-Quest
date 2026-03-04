# ⚙️ SETUP GUIDE — KKU'S QUEST

Complete this before giving Kku the link. Takes about 10 minutes.

---

## STEP 1 — Make the Repo Public (Required for Free GitHub Pages)

1. Go to your repo → **Settings** → scroll to bottom → **Danger Zone**
2. Click **"Change repository visibility"** → set to **Public**
3. Confirm

> If you want to keep it private, you need GitHub Pro ($4/month).  
> The game files don't contain spoilers — Kku can't guess levels just from filenames.

---

## STEP 2 — Enable GitHub Pages

1. Go to repo → **Settings** → **Pages** (left sidebar)
2. Under **Source**, select: `Deploy from a branch`
3. Branch: `main` | Folder: `/ (root)`
4. Click **Save**
5. Wait ~2 minutes, then your site is live at:
   ```
   https://man-with-scars.github.io/Kku-Quest/
   ```

---

## STEP 3 — Get a GitHub Personal Access Token

This lets the game upload files to your repo at runtime.

1. Go to: https://github.com/settings/tokens
2. Click **"Generate new token (classic)"**
3. Name: `kku-quest-game`
4. Expiration: `90 days` (covers March 13 with buffer)
5. Scopes: ✅ check **`repo`** (full control)
6. Click **Generate token**
7. **Copy it immediately** — GitHub shows it only once

---

## STEP 4 — Fill in `landing/config.js`

Open `C:\CUSTOM\WORKS\V02\landing\config.js` and fill in:

```javascript
const CONFIG = {
  GH_TOKEN:      'ghp_xxxxxxxxxxxxxxxxxxxx',   // ← paste your token here
  GH_REPO:       'man-with-scars/Kku-Quest',   // ← already correct
  ANTHROPIC_KEY: 'sk-ant-xxxxxxxxxxxxxxxxxxxx', // ← see Step 6 below
};
```

---

## STEP 5 — Fill in `game/config.js`

Open `C:\CUSTOM\WORKS\V02\game\config.js` and fill in:

```javascript
const CONFIG = {
  GH_TOKEN: 'ghp_xxxxxxxxxxxxxxxxxxxx',         // ← same token as above
  GH_REPO:  'man-with-scars/Kku-Quest',         // ← already correct
  GH_RAW:   'https://raw.githubusercontent.com/man-with-scars/Kku-Quest/main/levels/',
};
```

---

## STEP 6 — Get Anthropic API Key (for Camera Tile)

The camera tile uses Claude vision to verify Kku's two-finger pose.

1. Go to: https://console.anthropic.com/account/keys
2. Click **"Create Key"**
3. Name: `kku-landing-camera`
4. Copy the key (starts with `sk-ant-...`)
5. Paste into `landing/config.js` → `ANTHROPIC_KEY`

> **Cost:** ~$0.003 per camera verification call. Essentially free.

---

## STEP 7 — Set Your OTP Code

1. Go to your GitHub repo
2. Click on `otp.txt`
3. Click the ✏️ pencil (edit) icon
4. Replace `1234` with your chosen 4-digit code
5. Click **Commit changes**

> Pick something meaningful to you both — but don't make it too easy to guess.  
> You'll whisper it to Kku on the day. She needs it to unlock the game.

---

## STEP 8 — Create Required Folders in GitHub

You already have `uploads/`. Now add `levels/` and `vault/`:

1. In your repo, click **"Add file"** → **"Create new file"**
2. Type `levels/.gitkeep` → click **Commit new file**
3. Repeat for `vault/.gitkeep`

---

## STEP 9 — Upload All Files to GitHub

The easiest method is **GitHub Desktop** (free app):

1. Download: https://desktop.github.com
2. Clone your repo: **File** → **Clone Repository** → `man-with-scars/Kku-Quest`
3. Choose a local folder to clone into
4. Copy your entire `C:\CUSTOM\WORKS\V02\` contents into the cloned folder:
   - Copy `landing/` folder → paste into cloned repo
   - Copy `game/` folder → paste into cloned repo
   - Copy `otp.txt` → paste (overwrite existing)
5. In GitHub Desktop: you'll see all files listed as changes
6. Write commit message: `Add game files`
7. Click **Commit to main** → then **Push origin**

**Or if you prefer the command line (Git Bash / Terminal):**

```bash
# One-time setup
cd C:\CUSTOM\WORKS\V02
git init
git remote add origin https://github.com/man-with-scars/Kku-Quest.git
git pull origin main

# Copy your files in, then:
git add .
git commit -m "Add game files"
git push origin main
```

---

## STEP 10 — Verify Everything Works

Open these URLs in your browser after pushing:

| Check | URL |
|---|---|
| Landing page loads | `https://man-with-scars.github.io/Kku-Quest/landing/` |
| Game page loads | `https://man-with-scars.github.io/Kku-Quest/game/` |
| Level files accessible | `https://raw.githubusercontent.com/man-with-scars/Kku-Quest/main/levels/level-01.js` |
| OTP file accessible | `https://raw.githubusercontent.com/man-with-scars/Kku-Quest/main/otp.txt` |

> Allow 2–5 minutes after pushing for GitHub Pages to update.

---

## ✅ Final Checklist

- [ ] Repo is public
- [ ] GitHub Pages enabled (source: `main` / root)
- [ ] `landing/config.js` — GH_TOKEN filled in
- [ ] `landing/config.js` — ANTHROPIC_KEY filled in
- [ ] `game/config.js` — GH_TOKEN filled in
- [ ] `game/config.js` — GH_RAW points to correct URL
- [ ] `otp.txt` has your real 4-digit code (not `1234`)
- [ ] `levels/` and `vault/` folders exist in repo
- [ ] All files pushed to GitHub
- [ ] Landing page URL opens correctly in browser
- [ ] Level-01 raw URL returns JavaScript in browser

---

*You're ready. Give Kku the landing page link on March 13. 💕*
