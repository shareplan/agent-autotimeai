# AutoTime agent skills

Public skills and scripts for the AutoTime container runner. No credentials,
customer data or application source are stored here.

- `product-video`: generate or revise a Remotion video, render, upload and return artifacts.
- `remotion`: Remotion reference rules used by the product-video skill.

The API manifest selects repository, ref and skill directory. Runners synchronize
every 60 seconds and pin a commit snapshot for each task. Updating this repository
does not modify an already-running task.

Run script checks with `cd product-video && npm ci && npm test`.
