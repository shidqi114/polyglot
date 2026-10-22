# Setup: Firebase + Vercel + iPhone

The app works without any setup: progress is saved in the browser on each device.
Follow these steps to turn on **Google sign-in and cloud sync** so your iPhone and computer share progress.

Total time: about 15 minutes. Everything here fits in the free tiers of Firebase (Spark plan) and Vercel (Hobby plan).

---

## 1. Deploy to Vercel (first pass)

1. Go to <https://vercel.com/new> and import the `polyglot` GitHub repository.
2. Framework preset: **Next.js** (detected automatically). Keep the default build settings.
3. Click **Deploy**. When it finishes, note your domain, e.g. `polyglot-yourname.vercel.app`.
   You'll use it below as `YOUR_DOMAIN`.

At this point the app is fully usable in guest mode.

## 2. Create the Firebase project

1. Open <https://console.firebase.google.com> → **Create a project** (Google Analytics is not needed).
2. **Build → Authentication → Get started → Sign-in method → Google → Enable**. Choose a support email and save.
3. **Authentication → Settings → Authorized domains → Add domain** → add `YOUR_DOMAIN`.
4. **Build → Firestore Database → Create database** → choose a location close to you → **Start in production mode**.
5. **Project settings (gear icon) → General → Your apps → Web (`</>`)**. Register an app (no Hosting needed) and copy the `firebaseConfig` values.

## 3. Add environment variables in Vercel

In Vercel → your project → **Settings → Environment Variables**, add (for Production, Preview and Development):

| Name | Value |
| --- | --- |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `apiKey` from the config |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | **`YOUR_DOMAIN`** (not `…firebaseapp.com`, see below) |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `projectId` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `storageBucket` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `messagingSenderId` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `appId` |

**Treat these values as secrets.** Do not paste them into the repository, commit them, or share them in chat or screenshots.
They belong only in Vercel's environment variables and in your local `.env.local` file, which git ignores.
(Browsers still receive these values in the built app, which is normal for Firebase web apps. The Firestore security rules,
not keeping the config hidden, are what protect your data.)

> **Why the auth domain is your Vercel domain:** Safari (and especially the iPhone home-screen app)
> blocks the cross-site storage that Firebase's default `firebaseapp.com` sign-in page relies on.
> `next.config.ts` proxies `/__/auth/*` on your domain to Firebase, so sign-in stays same-site.

## 4. Allow the redirect URL for Google sign-in

1. Open <https://console.cloud.google.com/apis/credentials> and select the project Firebase created.
2. Under **OAuth 2.0 Client IDs**, open **Web client (auto created by Google Service)**.
3. Under **Authorized redirect URIs**, add `https://YOUR_DOMAIN/__/auth/handler` and **Save**.
   (It can take a few minutes to take effect.)

## 5. Deploy the Firestore security rules

From your computer, in the repository folder:

```bash
npm install
npx firebase login
npx firebase deploy --only firestore:rules --project YOUR_FIREBASE_PROJECT_ID
```

Alternatively paste the contents of [`firestore.rules`](../firestore.rules) into
**Firestore Database → Rules** in the Firebase console and click **Publish**.

## 6. Redeploy

In Vercel → **Deployments**, click **⋯ → Redeploy** on the latest deployment so the new environment variables are used.
Open the app → **Profile → Sign in with Google**.

## 7. Install on iPhone

1. Open `https://YOUR_DOMAIN` in **Safari**.
2. Tap **Share → Add to Home Screen → Add**.
3. Open Polyglot from the home screen and sign in on the **Profile** tab with the same Google account you use on your computer.

Tips
- Japanese audio uses iOS's built-in voices. For a nicer voice: **Settings → Accessibility → Spoken Content → Voices → Japanese** and download an enhanced voice (e.g. Kyoko Enhanced). Make sure the ring/silent switch isn't muting sound.
- Lessons work offline once the app has been opened online; progress syncs when you're back online.

---

## How data is stored

Lesson content (kana, ~8,000 JLPT words, ~2,200 kanji, grammar) is bundled with the app, so Firestore holds only your progress:

```
users/{uid}                     settings
users/{uid}/days/{YYYY-MM-DD}   xp, lessons, reviews   (counters, merged with increments)
users/{uid}/lessons/{lessonId}  done, best, times
users/{uid}/cards/{itemId}      FSRS spaced-repetition state
```

Progress is saved locally first and written to Firestore in small batches. When you sign in, any guest progress on that device is added to your account. Signing out clears the device's local copy (your account keeps everything).

## Local development

```bash
cp .env.example .env.local   # optional: fill in Firebase values to test sign-in
npm install
npm run dev                  # http://localhost:3000
```

For local sign-in, add `localhost` to Firebase **Authorized domains** (it's there by default) and set
`NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` to `YOUR_FIREBASE_PROJECT_ID.firebaseapp.com` in `.env.local`.

### Checks

```bash
npm run lint && npm run typecheck
npm test               # unit tests (answer checking, lesson generation, SRS, content integrity)
npm run test:rules     # Firestore security rules on the emulator (needs Java)
npm run build && npm run test:e2e   # browser tests at iPhone and desktop sizes
npm run test:sync      # sign-in + cross-device sync against the Firebase emulators (needs Java)
```

If Playwright can't download its browser, point it at an installed Chromium with `PW_CHROMIUM_PATH=/path/to/chromium`.

### Updating content

`npm run content` re-downloads the JLPT word and kanji lists and regenerates `src/content/generated/*.json`.
Grammar lessons are hand-written in `src/content/grammar.ts`.
