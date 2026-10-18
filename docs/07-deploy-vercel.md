# Deploying Dishcovery: GitHub, then Vercel

Total time: about 20 minutes the first time. After that, updating the live site is three commands.

## What gets deployed

One Vercel project, two parts, built by `npm run build:vercel` (`scripts/build-vercel.mjs`):

| Part | Where it ends up |
|---|---|
| The React site (Vite) | `.vercel/output/static`, served as static files |
| The API (Express) | `.vercel/output/functions/api.func`, one serverless function bundled into a single file, with its own copy of the `data/` files |

`/api/*` goes to the function; everything else is the static site. The page and the API share one address, so no CORS setup is needed.

**There is no database.** The function reads the same data files the local server does (venues, MUIS halal list, `data/upload/dishes.csv`, demo coupons). Changing any data file means **committing and pushing**, which makes Vercel redeploy. The MongoDB code is still in the repo for later but is not used on Vercel.

## 0. What you need

- A **GitHub** account (github.com) and a **Vercel** account. Easiest: sign up to Vercel with "Continue with GitHub".
- **Git** installed. Check in PowerShell: `git --version`. (It is installed on this machine.)
- Close `dishes.csv` in Excel before committing, so the saved version is the one that gets committed.

## 1. Check it works on your machine

```powershell
cd "C:\Users\Ethan\Documents\Personal Projects\Programming\AIL Hack Day"
npm.cmd install
npm.cmd test
npm.cmd run build:vercel
npm.cmd run smoke:vercel
```

The last command should end with `All smoke checks passed.` If any step fails, stop and fix it before going on. (Use `npm.cmd`, not `npm`, if PowerShell blocks scripts.)

## 2. Put it on GitHub

**a) Create an empty repository on the website.** github.com, then the **+** menu, **New repository**.

- Name: `dishcovery`
- Visibility: **Private** (recommended: the data files include names and details gathered from third-party sites, and we have not asked permission to republish them)
- Leave **all three boxes unticked**: no README, no .gitignore, no licence. The project already has them, and ticking them makes the first push fail.

**b) Tell git who you are** (once per computer; git needs this to commit):

```powershell
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

**c) Turn the folder into a repository and commit it:**

```powershell
cd "C:\Users\Ethan\Documents\Personal Projects\Programming\AIL Hack Day"
git init -b main
git add .
git status
```

Read the `git status` list before committing. It should show about **234 files and about 1 MB**: the `src`, `data`, `docs`, `scripts` folders and the config files. It must **not** show `node_modules`, `.env`, `.vercel`, `dist` or `data/raw`; the `.gitignore` already excludes them. If any appear, stop and tell me.

```powershell
git commit -m "Dishcovery: first version"
```

**d) Connect and push.** Copy the repository address from the GitHub page (it looks like `https://github.com/YOUR-NAME/dishcovery.git`):

```powershell
git remote add origin https://github.com/YOUR-NAME/dishcovery.git
git push -u origin main
```

A browser window opens the first time so you can sign in to GitHub. Refresh the repository page: your files should be there.

Things in the repo you may want to decide about: `.agents/` (68 files of design tooling), `FOR_OPENCODE_REF/` (a reference page), and `docs/Project-Kickoff-Questions.docx`. They are harmless, but add them to `.gitignore` before step c) if you would rather not publish them.

## 3. Deploy on Vercel from GitHub

1. Go to vercel.com, **Add New**, **Project**.
2. Find `dishcovery` in the list and press **Import**. (If it is missing, press "Adjust GitHub App Permissions" and allow that repository.)
3. On the configure screen:
   - **Framework Preset:** `Other`
   - **Root Directory:** leave as `./`
   - **Build Command:** it should fill in `npm run build:vercel` from `vercel.json`. If not, type it.
   - **Install Command:** `npm install`
   - **Output Directory:** leave **empty**
4. Open **Environment Variables** and add: name `DEMO_COUPONS`, value `true`. This turns on the coupons demo. Leave it out to keep the demo off.
5. Press **Deploy**. The first build takes 1 to 3 minutes.

When it finishes, Vercel shows your address (like `dishcovery-xyz.vercel.app`).

Optional, in the project's **Settings, General**: set **Node.js Version** to `22.x`. (`package.json` already asks for it.)

## 4. Check the live site

- The home page loads and the map shows tiles.
- `https://YOUR-ADDRESS/api/health` shows `{"ok":true}`.
- Choose a condition and press **Show places near me**: the SMU venues and dishes appear.
- Choose a place with a "Demo coupons" button: the coupons open. (`/#/coupons-demo` lists them all.)
- Your phone: open the same address. It is built for narrow screens.

## 5. Updating the site later

Every push to `main` redeploys automatically. After editing `data/upload/dishes.csv` (and saving and closing it in Excel):

```powershell
git add -A
git commit -m "Add HPB numbers for the five new dishes"
git push
```

Watch the **Deployments** tab on Vercel. A red build means a data row is wrong; the log names the row (see the table below).

Safer habit: work on a branch (`git switch -c more-numbers`), push it, and Vercel gives that branch its own **preview address** to check before you merge it into `main`.

## Deploying without GitHub (alternative)

```powershell
npx vercel login
npx vercel
npx vercel --prod
```

The first command signs you in, the second makes a preview deployment (answer the questions; accept the settings from `vercel.json`), the third publishes to your main address. Add `DEMO_COUPONS=true` with `npx vercel env add DEMO_COUPONS production`, then redeploy.

## If something goes wrong

| Symptom | Likely cause and fix |
|---|---|
| `git push` is rejected, says remote has commits | You ticked README/.gitignore/licence when creating the repository. Delete the repository on GitHub and create it again empty |
| `git push` asks for a password and fails | GitHub no longer accepts passwords. Sign in through the browser window that opens, or install Git Credential Manager (it comes with Git for Windows) |
| `git add .` lists thousands of files | `node_modules` is not being ignored. Confirm `.gitignore` is in the folder, then `git rm -r --cached node_modules` |
| Build fails: "Missing .../node_modules/vite" | The install did not run at the repository root. Check Root Directory is `./` and Install Command is `npm install` |
| Build fails naming a row of `dishes.csv` | A data row is wrong, for example HPB numbers with no `serving_g`, or more than 10 dishes. Fix the row, commit, push |
| `/api/...` shows the home page or 404 | The function was not picked up. Open the deployment, check **Functions** lists `api`, and send me the build log |
| `/api/...` returns 500 | Open **Logs** in Vercel. A data file problem stops the function on purpose and names the file |
| Page loads but says "Match request failed" | The API is failing; see the line above |
| Coupons demo says "switched off" | `DEMO_COUPONS` is not `true`, or you did not redeploy after adding it (Deployments, the latest one, **Redeploy**) |

## What I could and could not check

Checked on this machine: the tests, the production build, the bundled function and the data it ships with (`npm run smoke:vercel`), and the exact list of files that would go to GitHub (234 files, about 1 MB, no secrets found). Not checked: Vercel's own cloud build, since that needs your account. If the first deploy fails, paste the build log and I will fix it.
