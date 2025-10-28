from PIL import Image, ImageDraw, ImageFont
import os

def create_icon(size):
    img = Image.new('RGB', (size, size), color='#4a9eff')
    draw = ImageDraw.Draw(img)
    
    rect_width = int(size * 0.2)
    rect_height = int(size * 0.4)
    x1 = int(size * 0.2)
    y1 = int(size * 0.3)
    draw.rectangle([x1, y1, x1 + rect_width, y1 + rect_height], fill='white')
    
    triangle = [
        (int(size * 0.45), int(size * 0.3)),
        (int(size * 0.45), int(size * 0.7)),
        (int(size * 0.75), int(size * 0.5))
    ]
    draw.polygon(triangle, fill='white')
    
    draw.ellipse([int(size * 0.55), int(size * 0.15), int(size * 0.7), int(size * 0.3)], fill='white')
    
    img.save(f'icons/icon{size}.png')
    print(f'Created icon{size}.png')

for size in [16, 48, 128]:
    create_icon(size)
