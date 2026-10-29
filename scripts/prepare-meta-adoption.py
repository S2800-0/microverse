"""Prepare reviewed art candidates locally. No inference. Requires Pillow."""
import hashlib,json
from pathlib import Path
from PIL import Image,ImageChops,ImageDraw
root=Path(__file__).resolve().parent.parent
folder=root/'public/meta-art'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
records=[]
def record(file,sources,processing,**extra):
 p=folder/file;im=Image.open(p);records.append({'file':file,'sha256':sha(p),'width':im.width,'height':im.height,'sources':[{'file':s,'sha256':sha(folder/s)} for s in sources],'processing':processing,**extra})
for name in ['fox','wolf','deer','doe','fawn','rabbit','dog','cat-standing']:
 source=Image.open(folder/f'{name}.png').convert('RGBA')
 bounds=source.getchannel('A').point(lambda a:255 if a>40 else 0).getbbox()
 crop=source.crop(bounds);scale=min(560/crop.width,530/crop.height)
 crop=crop.resize((round(crop.width*scale),round(crop.height*scale)),Image.Resampling.LANCZOS)
 target=Image.new('RGBA',(640,640));target.alpha_composite(crop,((640-crop.width)//2,570-crop.height))
 file=f'game-{name}.png';target.save(folder/file,optimize=True)
 record(file,[f'{name}.png'],'Opaque bounds, uniform scale, 640-square canvas with common foot baseline. Source colour and alpha retained.',occupiedBounds=target.getchannel('A').point(lambda a:255 if a>40 else 0).getbbox(),baseline=569)
poster=Image.new('RGBA',(900,620));poster.alpha_composite(Image.open(folder/'game-fox.png').resize((720,720),Image.Resampling.LANCZOS),(90,-142));poster.save(folder/'entrance-fox-poster.png',optimize=True)
record('entrance-fox-poster.png',['game-fox.png'],'Static poster in the same presentation canvas and anchor as the local rig.')
game_map=Image.open(folder/'game-map.png').convert('RGBA').resize((1672,941),Image.Resampling.LANCZOS)
game_map.save(folder/'game-map-live.png',optimize=True)
record('game-map-live.png',['game-map.png'],'Uniform export to existing canvas dimensions. Fixed terrain remains unchanged; manually inspected against its overlay.')
original=Image.open(folder/'forest.png').convert('RGBA')
left=Image.open(folder/'foreground-left.png').getchannel('A').point(lambda a:255 if a>127 else 0)
right=Image.open(folder/'foreground-right.png').getchannel('A').point(lambda a:255 if a>127 else 0)
if left.size!=original.size or right.size!=original.size:raise ValueError('Layer registration differs')
left=ImageChops.subtract(left,right)
# Retain only mask components connected to the actual left edge, not distant
# disconnected parts returned by the broad text-segmentation request.
w,h=left.size;raw=left.tobytes();seen=bytearray(w*h);stack=[y*w for y in range(h) if raw[y*w]]
for i in stack:seen[i]=255
while stack:
 i=stack.pop();y,x=divmod(i,w)
 for j in ([i-1] if x else [])+([i+1] if x<w-1 else [])+([i-w] if y else [])+([i+w] if y<h-1 else []):
  if raw[j] and not seen[j]:seen[j]=255;stack.append(j)
left=Image.frombytes('L',(w,h),bytes(seen))
size=(1672,941);paint=original.resize(size,Image.Resampling.LANCZOS)
left=left.resize(size,Image.Resampling.NEAREST);right=right.resize(size,Image.Resampling.NEAREST)
# Near scenery only: exclude midground/path fragments that would slice the fox.
left_outline=[(0,0),(.19,0),(.17,.18),(.21,.3),(.20,.5),(.30,.68),(.36,.88),(.34,1),(0,1)]
right_outline=[(1,0),(.83,0),(.81,.22),(.81,.48),(.79,.62),(.75,.77),(.74,1),(1,1)]
for mask,outline in [(left,left_outline),(right,right_outline)]:
    roi=Image.new('L',size);ImageDraw.Draw(roi).polygon([(round(x*size[0]),round(y*size[1])) for x,y in outline],fill=255)
    mask.paste(ImageChops.multiply(mask,roi))
union=ImageChops.lighter(left,right)
if union.crop((round(.4*size[0]),round(.5*size[1]),round(.7*size[0]),size[1])).getbbox():raise ValueError('Foreground obstructs the central walking corridor')
fill=Image.open(folder/'clean-plate.png').convert('RGBA').resize(size,Image.Resampling.LANCZOS)
# Keep original centre/distant pixels. Only hidden foreground-mask regions use
# the generated fill, so recomposition at rest is pixel-identical to the master.
background=Image.composite(fill,paint,union)
layer_left=paint.copy();layer_left.putalpha(left)
layer_right=paint.copy();layer_right.putalpha(right)
for name,im in [('entrance-background',background),('entrance-left',layer_left),('entrance-right',layer_right)]:
 im.save(folder/f'{name}.png',optimize=True)
 record(f'{name}.png',['forest.png','clean-plate.png','foreground-left.png','foreground-right.png'],'Subtract right SAM mask from combined mask, retain left-edge connected regions and manually reviewed edge-tree polygons excluding the central walking corridor; place source-painting pixels over generated fill only inside removed foreground regions. All exports share the same canvas.')
check=background.copy();check.alpha_composite(layer_left);check.alpha_composite(layer_right)
difference=ImageChops.difference(check.convert('RGB'),paint.convert('RGB'))
if difference.getbbox() is not None:raise ValueError('Rest composite differs from master')
active=[{'id':name,'image':f'/meta-art/game-{name}.png','mode':'whole-image' if name in ['cat-standing','rabbit'] else 'articulated'} for name in ['fox','wolf','deer','doe','fawn','rabbit','dog','cat-standing']]
active.append({'id':'game-map','image':'/meta-art/game-map-live.png','mode':'fixed-terrain'})
result={'version':1,'active':active,'assets':records,'forest':{'size':size,'restCompositeExact':True,'leftBounds':left.getbbox(),'rightBounds':right.getbbox(),'changedCentrePixels':0,'walkCorridorClear':True,'leftOutline':left_outline,'rightOutline':right_outline,'note':'Exact rest composition does not establish natural-looking disocclusion during motion; browser motion review still required.'}}
(folder/'adoption.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps({'sprites':8,'restCompositeExact':True,'leftBounds':left.getbbox(),'rightBounds':right.getbbox()}))
