---
name: product-video
description: Generate or revise a product marketing video with Remotion, render it, and deliver video and source artifacts.
---

# Product video

Work in `project/` under the task workspace. Read the sibling `remotion` skill.
The prompt contains the approved brief, storyboard, brand kit and conversation.
Respect that order of authority. Preserve scene order, supplied copy, timing,
aspect ratio and brand restrictions. Do not invent product claims.

## Prepare

Let `SKILL_DIR` refer to this SKILL.md's containing directory.

1. Run `npm ci --prefix "$SKILL_DIR"` to install the script dependencies.
2. For a new project run `node "$SKILL_DIR/scripts/scaffold.mjs" project`.
3. For a modification run `runner-tools input previous-code --output previous-code.zip`,
   then `node "$SKILL_DIR/scripts/archive.mjs" restore previous-code.zip project`.
   Read the existing project first; change only what the prompt requests.
4. Run `npm install --legacy-peer-deps --prefix project`.

## Generate and render

Create or update the composition and its registration under `project/src/`.
Use the approved render settings; absent overrides use 30 fps, 1920×1080 and
10–30 seconds. Install extra dependencies in the project, keeping Remotion
packages on the same version. Follow the Remotion reference rules.

Run `node "$SKILL_DIR/scripts/render.mjs" project`. It discovers composition IDs,
preferring ProductVideo, and writes `project/out/video.mp4`.

On a render failure, inspect the actual error, repair the code in this same
session and rerun. Do not start a nested agent. Allow at most three render attempts total. If all fail, stop
and report failure; never upload a partial video or invent a successful result.

## Deliver

1. Run `node "$SKILL_DIR/scripts/archive.mjs" pack project code.zip`.
2. Run `runner-tools put project/out/video.mp4 --name video --content-type video/mp4 > video-artifact.json`.
3. Run `runner-tools put code.zip --name code --content-type application/zip > code-artifact.json`.
4. Write a JSON file containing `{ "message": "...", "artifacts": [...] }`.
   Use the exact two `{name, artifactId}` objects returned by the upload commands.
5. Run `runner-tools result result.json` and finish the session successfully.

The message should summarize the user-visible changes and assumptions. Do not
include absolute paths, credentials, signed URLs, hostnames or internal logs.
The runner reports completion only after the session succeeds and the API
verifies the uploaded objects. This skill does not manage runner registration,
approval, leases, task retries or database records.
