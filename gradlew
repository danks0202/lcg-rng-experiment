#!/usr/bin/env bash
if command -v gradle >/dev/null 2>&1; then
  gradle "$@"
else
  echo "Gradle not installed on runner. Please install gradle or rely on system gradle."; exit 1
fi
