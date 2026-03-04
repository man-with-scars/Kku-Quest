# 💕 KKU'S QUEST — FIND CHU

> A romantic anniversary game. 13 levels. One phone number. One love story.  
> Built for **Kku** 👩‍⚕️ to find **Chu** 👨‍💻. March 13.

---

## 📁 Repository Structure

```
Kku-Quest/
├── landing/                  # Entry experience (hosted via GitHub Pages)
│   ├── index.html            # Main landing page
│   ├── config.js             # ⚠️ Fill in your keys here
│   ├── phase1.js
│   ├── phase2.js
│   ├── phase3.js
│   ├── phase4-shell.js
│   ├── phase4-eyes.js
│   ├── tile-camera.js
│   ├── tile-date.js
│   ├── tile-voice.js
│   ├── tile-screen.js
│   ├── tile-upload.js
│   ├── tile-otp.js
│   └── final-overlay.js
│
├── game/                     # Main game (loaded after OTP)
│   ├── index.html
│   ├── config.js             # ⚠️ Fill in your keys here
│   ├── engine.js
│   ├── map.js
│   ├── story.js
│   ├── sps.js
│   ├── notifications.js
│   ├── dev-mode.js
│   ├── ending.js
│   └── levels/
│       ├── level-01.js
│       ├── level-02.js
│       ├── level-03.js
│       ├── level-04.js
│       ├── level-05.js
│       ├── level-06.js
│       ├── level-07.js
│       ├── level-08.js
│       ├── level-09.js
│       ├── level-10.js
│       ├── level-10b.js
│       ├── level-keylock.js
│       └── level-marry.js
│
├── uploads/                  # Runtime file uploads from the game
├── vault/                    # Reserved (do not delete)
├── otp.txt                   # 4-digit OTP code Kku must enter
└── .gitignore
```

---

## 🚀 Hosting

This project is hosted for free using **GitHub Pages**.

- Landing page: `https://man-with-scars.github.io/Kku-Quest/landing/`
- Game: `https://man-with-scars.github.io/Kku-Quest/game/`

> ⚠️ **Important:** GitHub Pages only works on **public** repos for free accounts.  
> Either make the repo public, or upgrade to GitHub Pro for private Pages.

---

## ⚙️ Setup Checklist

See [`SETUP.md`](./SETUP.md) for the full step-by-step config guide.

---

## 🔒 Security Notes

- `otp.txt` contains the unlock code — change it anytime via GitHub web editor
- Never commit real API keys — use the config files only after reading `SETUP.md`
- The `uploads/` folder receives files from the game at runtime via GitHub API

---

*Built with love. For Kku. From Chu. 💕*  
*March 13 — The date that started everything.*
