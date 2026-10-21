from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
root=Path('astro/dist/client');missing=[];count=0
class Check(HTMLParser):
 def handle_starttag(self,tag,attrs):
  global count
  d=dict(attrs);refs=[]
  if tag in ['img','script','source','video','link']:
   for key in ['src','poster','href']:
    if key in d:refs.append(d[key])
   if 'srcset' in d:
    # Image filenames can contain spaces; component URLs encode them.
    refs.extend(x.strip().rsplit(' ',1)[0] for x in d['srcset'].split(','))
  for ref in refs:
   if ref.startswith('/') and not ref.startswith('//'):
    count+=1;path=root/unquote(urlsplit(ref).path).lstrip('/')
    if not path.exists():missing.append((str(current),ref))
for current in root.rglob('*.html'):
 Check().feed(current.read_text())
print('Local asset references checked:',count,'Missing:',len(missing))
for x in missing[:20]:print(x)
if missing:raise SystemExit(1)
