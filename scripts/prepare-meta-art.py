"""Compose saved SAM masks and publish review candidates; no network or inference.

Run after generate-meta-art.mjs. Requires Pillow. Source artwork is preserved.
"""
import base64, hashlib, json
from pathlib import Path
from PIL import Image, ImageChops
root=Path(__file__).resolve().parent.parent
batch=root/'runtime/meta-art-batch-2026-10-28'
output=root/'public/meta-art';output.mkdir(exist_ok=True)
hash_file=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
assets=[]
order=['fox','wolf','deer','doe','fawn','rabbit','dog','cat','cat-standing','game-map','forest','clean-plate','fox-walk','fox-walk-wide','foreground-left','foreground-right']
for name in order:
    path=batch/f'{name}.json'
    if not path.exists():continue
    record=json.loads(path.read_text());source=batch/f'{name}.png'
    if not source.exists():continue
    image=Image.open(source).convert('RGBA')
    cutout=False
    maskpath=batch/f'{name}-masks.json'
    if record['status']=='candidate' and maskpath.exists():
        packet=json.loads(maskpath.read_text())
        if image.size!=(packet['width'],packet['height']):raise ValueError('Mask/source mismatch')
        union=Image.new('L',image.size)
        for mask in packet['masks']:
            b=mask['bounds'];raw=base64.b64decode(mask['data'])
            if len(raw)!=mask['width']*mask['height'] or set(raw)-{0,1}:raise ValueError('Invalid mask raster')
            bounds=(b['left'],b['top'],b['right'],b['bottom'])
            if bounds[0]<0 or bounds[1]<0 or bounds[2]>image.width or bounds[3]>image.height:raise ValueError('Mask out of bounds')
            raster=Image.frombytes('L',(mask['width'],mask['height']),bytes(v*255 for v in raw)).resize((bounds[2]-bounds[0],bounds[3]-bounds[1]),Image.Resampling.NEAREST)
            placed=Image.new('L',image.size);placed.paste(raster,bounds[:2]);union=ImageChops.lighter(union,placed)
        image.putalpha(ImageChops.multiply(image.getchannel('A'),union));cutout=True
    # Limit gallery payloads while retaining the saved, unmodified Muse originals.
    image.thumbnail((1920,1280),Image.Resampling.LANCZOS)
    destination=output/f'{name}.png';image.save(destination,optimize=True)
    original=record['sourceReferences'][0]['source']
    original='/meta-art/'+original[1:]+'.png' if original.startswith('@') else '/'+original.removeprefix('public/')
    review={'animal':'Illustration and cutout candidate. New rig geometry and movement have not been accepted.','map':'Visual candidate. Fixed stream, rock and tree alignment must be checked before game use.','landscape':'Watercolor composition candidate. Camera crops and registration still need review.','walk':'Eight-pose candidate. Foot registration and loop quality still need review.','layer':'SAM foreground candidate. Edge selection and compositing must be checked before parallax use.'}[record['kind']]
    if record['status']=='failed':review=record.get('error','Cutout requires review')+' Original generation retained; no automatic retry.'
    if name=='cat':review='The model returned a seated cat despite a standing request. Keep as a portrait candidate; compare the separate standing correction.'
    if name=='foreground-left':review='SAM selected both forest edges rather than isolating the left side. This needs a manual mask review before independent parallax.'
    if name=='fox-walk-wide':review='Eight SAM cutouts, locally registered for playback. Tail and body shape vary across the poses; review the loop before adopting it.'
    assets.append({'id':name,'label':record['label'],'kind':record['kind'],'preview':f'/meta-art/{name}.png','original':original,'state':'Mask needs review' if name=='foreground-left' else 'Portrait only' if name=='cat' else 'Cutout candidate' if cutout else 'Painting candidate' if record['status']=='candidate' else 'Needs review','review':review,'file':destination.name,'width':image.width,'height':image.height,'sha256':hash_file(destination),'origin':'Meta API reference edit' if record['imageCalls'] else 'SAM cutout from Meta-generated forest','imageModel':record['imageModel'],'segmentationModel':record['segmentationModel'],'imageCalls':record['imageCalls'],'samCalls':record['samCalls'],'sourceReferences':record['sourceReferences'],'prompt':record['prompt'],'segmentationTarget':record['segment'],'sourceImageSha256':record.get('imageSha256'),'processing':'Saved source colours, union of bounded SAM masks at their half-open source bounds where available, optional uniform downsize for gallery. Source originals preserved.','status':record['status']})
guide_source=root.parent/'microverse/app-art/meta-guide/manifest.json'
guide_meta=json.loads(guide_source.read_text())
guide=[]
for pose in ['attentive','blink','curious','speaking']:
    p=output/f'guide-{pose}.png'
    if p.exists():guide.append({'file':p.name,'sha256':hash_file(p),'width':400,'height':400})
derived=[]
for filename in ['fox-walk-atlas.png','fox-poster.png']:
    p=output/filename
    if p.exists():
        im=Image.open(p);derived.append({'file':filename,'sha256':hash_file(p),'width':im.width,'height':im.height,'source':'fox-walk-wide.png','processing':'Connected-alpha frame extraction, uniform scaling and shared foot/nose anchors with prepare-walk-sheet.py.'})
for name in ['dog','fawn']:
    p=output/f'{name}.png'
    if p.exists():
        im=Image.open(p);im.thumbnail((480,320),Image.Resampling.LANCZOS);dest=output/f'{name}-card.png';im.save(dest,optimize=True)
        derived.append({'file':dest.name,'sha256':hash_file(dest),'width':im.width,'height':im.height,'source':p.name,'processing':'Uniform local downsize for static landing/entry cards; original candidate retained.'})
attempts=[]
for p in sorted(batch.glob('*.json')):
    if p.name.endswith('-masks.json'):continue
    r=json.loads(p.read_text());attempts.append({k:r.get(k) for k in ['id','status','imageCalls','samCalls','error','width','height']})
manifest={'version':1,'derived':derived,'attempts':attempts,'assets':assets,'guide':{'imageModel':'muse-image-1.0','segmentationModel':'sam-3.1','referenceSha256':guide_meta['referenceSha256'],'prompt':guide_meta['prompt'],'processing':'SAM cutouts, local translation to common upper/right silhouette anchors, then 400px export. Decorative expression switching, not phoneme lip sync.','frames':guide,'atlas':{'file':'guide-atlas.png','sha256':hash_file(output/'guide-atlas.png'),'width':800,'height':800,'columns':2,'rows':2,'cellSize':400}},'billingNote':'Published-price estimates are not billing receipts or proof of individual credit debits.','reviewNote':'Gallery candidates are not automatically installed as game maps or articulated species.'}
(output/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(json.dumps({'roles':len(assets),'cutouts':sum(a['state']=='Cutout candidate' for a in assets),'guideFrames':len(guide)}))
