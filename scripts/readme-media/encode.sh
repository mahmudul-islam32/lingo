#!/usr/bin/env bash
# Turns each docs/media/*.webm recording into a README-friendly GIF (plays inline on
# GitHub) and an MP4 (full quality, linked), then deletes the .webm.
# Usage: scripts/readme-media/encode.sh [media-dir]
set -euo pipefail
dir="${1:-docs/media}"
shopt -s nullglob
for webm in "$dir"/*.webm; do
  base="${webm%.webm}"
  ffmpeg -loglevel error -y -i "$webm" -c:v libx264 -pix_fmt yuv420p -crf 26 \
    -movflags +faststart -an "$base.mp4"
  ffmpeg -loglevel error -y -i "$webm" \
    -vf "fps=8,scale=270:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=64[p];[b][p]paletteuse=dither=bayer:bayer_scale=4" \
    "$base.gif"
  rm "$webm"
  echo "encoded $(basename "$base")"
done
