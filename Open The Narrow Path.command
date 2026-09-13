#!/bin/zsh
set -eu
cd -- "${0:A:h}"
if command -v node >/dev/null 2>&1; then
  runner_node="$(command -v node)"
else
  runner_nodes=("$HOME"/.nvm/versions/node/*/bin/node(N))
  if (( ${#runner_nodes[@]} == 0 )); then
    print 'Node.js is needed to open this game. Install Node.js, then open this file again.'
    read -r '?Press Return to close.'
    exit 1
  fi
  runner_node="${runner_nodes[-1]}"
fi
"$runner_node" scripts/start-local.mjs
open 'http://localhost:5173'
