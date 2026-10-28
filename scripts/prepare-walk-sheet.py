"""Cut the owner's eight separated poses into a registered atlas; no inference.

Usage: python3 scripts/prepare-walk-sheet.py SOURCE.png OUTPUT.png METADATA.json
Requires Pillow. Original artwork is never overwritten.
"""
import hashlib
import json
import sys
from pathlib import Path
from PIL import Image, ImageChops, ImageFilter

source, output, metadata = map(Path, sys.argv[1:])
if source.resolve() in (output.resolve(), metadata.resolve()):
    raise SystemExit('Keep the original sheet separate from its outputs.')
image = Image.open(source).convert('RGBA')
width, height = image.size
if width * height > 16_000_000:
    raise SystemExit('Use a sheet below sixteen megapixels.')
alpha = image.getchannel('A').tobytes()
seen = bytearray(width * height)
components = []
for index in range(width * height):
    if seen[index] or alpha[index] <= 40:
        continue
    seen[index] = 1
    stack, points = [index], []
    x0, y0, x1, y1 = width, height, 0, 0
    while stack:
        pixel = stack.pop()
        y, x = divmod(pixel, width)
        points.append((x, y))
        x0, y0, x1, y1 = min(x0, x), min(y0, y), max(x1, x), max(y1, y)
        neighbours = ([pixel-1] if x else []) + ([pixel+1] if x < width-1 else [])
        neighbours += ([pixel-width] if y else []) + ([pixel+width] if y < height-1 else [])
        for adjacent in neighbours:
            if not seen[adjacent] and alpha[adjacent] > 40:
                seen[adjacent] = 1
                stack.append(adjacent)
    if len(points) > 3000:
        components.append({'bounds': (x0, y0, x1+1, y1+1), 'points': points})
if len(components) != 8:
    raise SystemExit(f'Expected eight separate animal silhouettes; found {len(components)}.')
components.sort(key=lambda c: c['bounds'][1])
components = sorted(components[:4], key=lambda c: c['bounds'][0]) + sorted(components[4:], key=lambda c: c['bounds'][0])
atlas = Image.new('RGBA', (2048, 1024))
frames = []
scale, baseline, nose = .95, 425, 460
for index, component in enumerate(components):
    x0, y0, x1, y1 = component['bounds']
    bounds = (max(0,x0-6), max(0,y0-6), min(width,x1+6), min(height,y1+6))
    crop = image.crop(bounds)
    mask_bytes = bytearray(crop.width * crop.height)
    for x, y in component['points']:
        mask_bytes[(y-bounds[1])*crop.width+x-bounds[0]] = 255
    # Keep the original antialiasing around this silhouette, excluding neighbouring poses.
    mask = Image.frombytes('L', crop.size, bytes(mask_bytes)).filter(ImageFilter.MaxFilter(11))
    crop.putalpha(ImageChops.multiply(crop.getchannel('A'), mask))
    crop = crop.resize((round(crop.width*scale), round(crop.height*scale)), Image.Resampling.LANCZOS)
    target_x = nose-round((x1-1-bounds[0])*scale)
    target_y = baseline-round((y1-1-bounds[1])*scale)
    if min(target_x,target_y) < 0 or target_x+crop.width > 512 or target_y+crop.height > 512:
        raise SystemExit('A pose would be clipped; review this sheet before exporting.')
    frame = Image.new('RGBA', (512,512))
    frame.alpha_composite(crop, (target_x,target_y))
    occupied = frame.getchannel('A').point(lambda a: 255 if a>40 else 0).getbbox()
    atlas.alpha_composite(frame, ((index%4)*512,(index//4)*512))
    frames.append({'index':index,'sourceBounds':list(component['bounds']),'occupiedBounds':list(occupied),'baseline':occupied[3]-1})
output.parent.mkdir(parents=True,exist_ok=True)
atlas.save(output)
poster = Image.new('RGBA', (900,620))
poster.alpha_composite(atlas.crop((512,0,1024,512)).resize((720,720),Image.Resampling.LANCZOS),(90,500-round(baseline*720/512)))
poster_path = output.with_name('fox-poster.png')
poster.save(poster_path)
metadata.write_text(json.dumps({'version':1,'sourceFile':source.name,'sourceSha256':hashlib.sha256(source.read_bytes()).hexdigest(),'sourceSize':[width,height],'atlasSha256':hashlib.sha256(output.read_bytes()).hexdigest(),'atlasSize':[2048,1024],'columns':4,'rows':2,'cellSize':512,'scale':scale,'anchorRight':nose,'targetBaseline':baseline,'frames':frames,'processing':'Connected alpha silhouettes, edge-preserving local cutout, uniform scale and foot/nose registration. No generated or reconstructed poses.'},indent=2)+'\n')
print(json.dumps({'frames':len(frames),'baselines':[f['baseline'] for f in frames],'atlasBytes':output.stat().st_size}))
