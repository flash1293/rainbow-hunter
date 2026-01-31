#!/bin/bash
# The Ralph Loop for DeepSeek
# Usage: ./ralph.sh 50 (to run 50 iterations)

for ((i=1; i<=$1; i++)); do
  echo "--- Ralph Iteration $i ---"

  # Replace 'goose' with your preferred CLI agent that supports DeepSeek
  output=$(goose run --instruction "
    Read @PRD.md and @progress.txt.
    1. Pick the highest priority incomplete task.
    2. Implement it.
    5. If you are totally finished, output 'DONE'.
    ONLY DO ONE TASK PER RUN.
  " 2>&1)

  echo "$output"

  # Check if the agent output 'DONE' to break the loop
  if [[ "$output" == *"DONE"* ]]; then
    break
  fi
done
