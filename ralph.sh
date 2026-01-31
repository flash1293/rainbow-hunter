#!/bin/bash
# The Ralph Loop for DeepSeek R1 using aider
# Usage: ./ralph.sh [iterations] (default: 50)

# Default iterations if not provided
ITERATIONS=${1:-50}



for ((i=1; i<=ITERATIONS; i++)); do
  echo "--- Ralph Iteration $i ---"

  # Create the instruction for aider
  INSTRUCTION="Read PRD.md and progress.txt.
1. Pick the highest priority incomplete task.
2. Implement it in the working copy (no git commits).
3. Append completed task to progress.txt.
4. If all tasks are finished, output 'DONE'.
ONLY DO ONE TASK PER RUN."

  # Run aider with DeepSeek R1 model, stream output and capture to temp file
  tempfile=$(mktemp) || { echo "Failed to create temp file"; exit 1; }
  aider --model deepseek/deepseek-reasoner --yes --message "$INSTRUCTION" PRD.md progress.txt js/main.js js/config.js 2>&1 | tee "$tempfile"

  # Check if the agent output 'DONE' to break the loop
  if grep -q "DONE" "$tempfile"; then
    echo "All tasks completed. Exiting."
    rm -f "$tempfile"
    break
  fi

  # Clean up temp file
  rm -f "$tempfile"

  # Optional: small delay between iterations
  sleep 2
done

echo "Ralph loop finished."
