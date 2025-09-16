# Project_Tahunan

Simple static birthday page.

How to deploy to GitHub Pages (automatic via GitHub Actions)

1. Create a GitHub repository and push this project to the `main` branch. You already did this.
2. Add the GitHub Actions workflow included in `.github/workflows/deploy.yml` (this repo already has it if present).
3. On each push to `main`, the workflow will build and deploy the repository root to the `gh-pages` branch and publish it via GitHub Pages.

Manual steps (if you prefer manual publishing):

- From repository Settings → Pages → Source, choose `gh-pages` branch (if the action created it) and `/ (root)` folder.

Notes:
- Put your optional assets (`photo.jpg`, `happy-birthday-254480.mp3`) in the repository root or update paths accordingly.
- If you want a custom domain, configure it in repository Settings → Pages.

If you'd like, I can add the GitHub Actions workflow file to this repo now.
