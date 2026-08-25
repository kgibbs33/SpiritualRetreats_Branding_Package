#!/bin/bash
# Download spirituality/wellness images from Unsplash
# All images from Unsplash License (free for commercial use)

IMAGES_DIR="$(dirname "$0")/../public/images"
mkdir -p "$IMAGES_DIR"

# Unsplash direct image URLs (format: photo-timestamp-id)
# Using high-quality downloads (w=1200, q=80)
download() {
  local url="$1"
  local out="$2"
  echo "Downloading $out..."
  curl -sL "$url" -o "$IMAGES_DIR/$out" || echo "Failed: $out"
}

# Meditation, yoga, wellness, nature - spirituality themed
download "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&q=80" "hero-meditation.jpg"
download "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200&q=80" "yoga-retreat.jpg"
download "https://images.unsplash.com/photo-1507048331197-7d4ac70811cf?w=1200&q=80" "meditation-nature.jpg"
download "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1200&q=80" "spa-wellness.jpg"
download "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=1200&q=80" "beach-wellness.jpg"
download "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=1200&q=80" "nature-immersion.jpg"
download "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=1200&q=80" "mindfulness-retreat.jpg"
download "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80" "sacred-valley.jpg"

echo "Done. Images saved to $IMAGES_DIR"
