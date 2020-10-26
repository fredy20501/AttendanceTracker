# AttendanceTracker
A web application for teachers used to track student attendance in classrooms.

---

# Proposed Workflow
Inspired by [mvitocruz/git-workflow.txt](https://gist.github.com/mvitocruz/946941/6055ae1be8d63c35d828c338ca9aef517c4784f1) and [
datagrok/git-workflow.md](https://gist.github.com/datagrok/d1650d85496cd509d42b8656d30410cf).

This is a somewhat specific workflow for our project. For people new to GitHub (or needing a refresher), you can read this general [GitHub Flow](https://guides.github.com/introduction/flow/) document first.
Note that you should have [cloned the repository](https://docs.github.com/en/free-pro-team@latest/github/creating-cloning-and-archiving-repositories/cloning-a-repository) onto your local machine first before starting work for the first time.

Aims:
 * have a common workflow to limit misunderstandings
 * provide a simple list of steps to follow
 * use pull requests for code reviews and discussions

## 1. Make a new feature branch
```
git fetch
git checkout -b <feature> origin/main
git push -u origin HEAD
```
- Replace <feature> with the name of your branch. Your branch name should be descriptive (e.g., `refactor-authentication`, `user-content-cache-key`, `make-retina-avatars`), so that others can see what is being worked on.
- `push -u` is an easy way to get the "upstream tracking" set up correctly.

## 2. Iterate

### a. Do work and commit
As usual when working with git, commit your work locally as you progress.
```
# edit files...
git add <file> <file> ...
git commit
# loop until complete
```

Once you have some commits ready, you can push them into the remote repository.
```
git push
```
- It's good to do push often since that means you have a remote backup in case of a disaster, and others can see and collaborate on your work.

If git complains, it's probably because someone else pushed to the branch (this can happen when multiple people are working on the same feature). Get their changes by doing the following:

### b. Pull collaborators' commits
This only needs to be done if someone else is also working on your branch (i.e. multiple people working on the same feature)
```
# first, commit (or stash) all your local changes. Then,
git pull --rebase
# resolve any conflicts
git push
# If git complains: repeat `git pull --rebase`
```
- This will cause any commits that have not been pushed to be rebased on the updated branch. Using --rebase is not strictly necessary here, but doing so will keep the feature branch history cleaner.
- Git will force you to take this step whenever someone else changes your branch, by forbidding you to push until you do. 
- If nobody else ever changes your branch, this command will not do anything. It's safe to run just out of habit.
- Don't forget to push at the end of this step! Otherwise you'll end up either re-resolving the same conflicts, or building a long chain of merge commits.

### c. Pull from *main* 
Do this at least once before creating the pull request to keep up with the new changes in *main* (if any).
```
git pull origin main
# resolve any conflicts
git push
# If git complains: repeat from `git pull origin main`
```

## Create pull request
Go to our repository page, select your branch, then select "Pull Request".
1. Make sure the base branch is `main` (this means your work will be merged into `main`).
2. Add a title (what feature did you work on?), and a description if you have details to add.
3. If your code is ready for review, click "Create Pull Request". If you are not done working on it, use the dropdown and select "Create Draft Pull Request" (once you are done, you can mark it as ready for review).

## Merge pull request
Once the pull request has been reviewed, someone (the reviewer or yourself) can click the accept pull request button to merge it.

After all of this, it should be safe to delete the branch <feature>.

## Final Notes:
When setting up your environment for the first time I recommend installing `npm-merge-driver`. This will auto-resolve any conflicts that happen in the package-lock.json file when merging with someone else's changes (those conflicts are a pain to do manually). Just run this command once you have installed `node.js` on your computer:
```
npx npm-merge-driver install --global
```
- The `--global` will install it globally for your computer so you will have it for all projects.
- Note: If there are also conflicts in `package.json`, you will have to solve those manually. Once you have fixed it, run `npm install --package-lock-only` to fix the `package-lock.json` accordingly.
- Source: https://npm.community/t/dealing-with-package-lock-json-conflicts/902/2

----

# To start the server:
-ssh onto google cloud 
-go to the folder containing the repository
-run
export PORT=3000
```
In your linux terminal, this sets up the port for the project to use.
-for a temporary hosting use 
npm run serve
```
-for a persistent hosting use
nohup npm run serve
```
This tells ubuntu not to kill the process when we log out.
-Then to kill the process: run 
ps ux
```
Look for the 2 processes labelled 'node home/.../vue-cli-...' and 'node home/.../nodemon server/index.js', get their IDs.
-Run '$Kill -9 ID' for both of them

# NPM Commands

### Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).


# Notes on modifications made to allow deployment

- in .eslintrc.js, I removed the following:
```
    "jest/globals": true
```
from just after ```env{ root:true```

- Added vue.config.js

- modified default port on index.js (though this is an env variable anyways, so it shouldnt matter too much.