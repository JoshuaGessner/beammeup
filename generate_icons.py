#!/usr/bin/env python3
"""
Generate PWA icons for BeamMeUp with the B logo design.
Creates both standard and maskable icons for different sizes.
"""

from PIL import Image, ImageDraw, ImageFont
import os

# Create output directory
output_dir = "frontend/public"
os.makedirs(output_dir, exist_ok=True)

def create_icon(size, is_maskable=False):
    """Create a BeamMeUp icon with B logo and orange accent."""
    # Create image with transparent background
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Background circle (darker for standard, lighter for maskable safe area)
    if is_maskable:
        # For maskable icons, use solid background within safe area
        bg_color = (11, 15, 20, 255)  # #0b0f14
        draw.rectangle([(0, 0), (size, size)], fill=bg_color)
    else:
        # Standard icon with rounded feel
        bg_color = (11, 15, 20, 255)  # #0b0f14
        draw.rectangle([(0, 0), (size, size)], fill=bg_color)
    
    # Orange accent circle in top-right
    accent_size = int(size * 0.3)
    accent_x = int(size * 0.7)
    accent_y = int(size * 0.1)
    draw.ellipse(
        [(accent_x, accent_y), (accent_x + accent_size, accent_y + accent_size)],
        fill=(234, 88, 12, 255)  # Orange #ea580c
    )
    
    # Draw "B" letter in center
    # For smaller icons, use simpler approach
    if size >= 128:
        try:
            # Try to use a bold font if available
            font_size = int(size * 0.5)
            font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", font_size)
        except:
            font = ImageFont.load_default()
    else:
        font = ImageFont.load_default()
    
    # Draw B in white
    text = "B"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    text_x = (size - text_width) // 2
    text_y = (size - text_height) // 2 - int(size * 0.05)
    
    draw.text((text_x, text_y), text, fill=(255, 255, 255, 255), font=font)
    
    return img

def create_screenshot(width, height, label="Dashboard"):
    """Create a screenshot mockup."""
    img = Image.new('RGBA', (width, height), (11, 15, 20, 255))
    draw = ImageDraw.Draw(img)
    
    # Add header
    draw.rectangle([(0, 0), (width, 80)], fill=(17, 24, 39, 255))
    
    # Add sidebar for wide screenshots
    if width > height:
        draw.rectangle([(0, 80), (250, height)], fill=(23, 32, 44, 255))
        content_x = 280
    else:
        content_x = 40
    
    # Add some content blocks to simulate dashboard
    block_y = 120
    for i in range(3):
        draw.rectangle(
            [(content_x, block_y + i * 120), (content_x + 200, block_y + i * 120 + 100)],
            fill=(44, 55, 71, 255),
            outline=(234, 88, 12, 100)
        )
    
    return img

# Generate standard icons
print("Generating PWA icons...")

# 192x192 icon
icon_192 = create_icon(192)
icon_192.save(f"{output_dir}/icon-192.png")
print(f"✓ Created icon-192.png")

# 512x512 icon
icon_512 = create_icon(512)
icon_512.save(f"{output_dir}/icon-512.png")
print(f"✓ Created icon-512.png")

# Maskable icons (with transparent corners for adaptive display)
icon_maskable_192 = create_icon(192, is_maskable=True)
icon_maskable_192.save(f"{output_dir}/icon-maskable-192.png")
print(f"✓ Created icon-maskable-192.png")

icon_maskable_512 = create_icon(512, is_maskable=True)
icon_maskable_512.save(f"{output_dir}/icon-maskable-512.png")
print(f"✓ Created icon-maskable-512.png")

# Generate screenshots
print("\nGenerating screenshots...")

screenshot_540 = create_screenshot(540, 720, "Dashboard View")
screenshot_540.save(f"{output_dir}/screenshot-540.png")
print(f"✓ Created screenshot-540.png (540x720)")

screenshot_1280 = create_screenshot(1280, 720, "Configuration Panel")
screenshot_1280.save(f"{output_dir}/screenshot-1280.png")
print(f"✓ Created screenshot-1280.png (1280x720)")

print("\n✅ All PWA assets generated successfully!")
print("\nFiles created:")
print("  - icon-192.png")
print("  - icon-512.png")
print("  - icon-maskable-192.png")
print("  - icon-maskable-512.png")
print("  - screenshot-540.png")
print("  - screenshot-1280.png")
