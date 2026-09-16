import json,io,os,re,urllib.parse,subprocess,sys
sys.stdout.reconfigure(encoding='utf-8',errors='replace')
ROOT='C:/Users/AI TEAM/Desktop/Harsh_Projects/Front_end_website'
d=json.load(io.open(f'{ROOT}/docs/net-home.json',encoding='utf-8'))
urls=[]
for r in d:
    u=r['url']
    if re.search(r'\.(webp|avif|png|jpg|jpeg|svg|webm|mp4|woff2|json)($|\?)',u) and 'google' not in u and 'facebook' not in u and 'typekit.net/p.gif' not in u:
        if u not in urls: urls.append(u)

def clean(u):
    n=urllib.parse.unquote(u.split('/')[-1].split('?')[0])
    n=re.sub(r'^[0-9a-f]{20,}_','',n)          # webflow hash prefix
    n=re.sub(r'-p-\d+(?=\.)','',n)             # webflow responsive suffix
    n=n.replace('%20','-').replace(' ','-').replace('&','and').lower()
    n=re.sub(r'[^a-z0-9._-]','-',n)
    return n

RENAME={
 'img_cam_02.webp':'architecture-hero.webp',
 'img_cam_03.webp':'gallery-interior-01.webp',
 'img_cam_05_alpha.webp':'quote-pool.webp',
 'img_cam_07.webp':'gallery-interior-02.webp',
 'img_cam_09.webp':'gallery-interior-03.webp',
 'img_cta_1920.png':'cta-sea-views.png',
 'era-residence_gated-community_day.webp':'hero-day.webp',
 'era-residence_gated-community_night.webp':'hero-night.webp',
 'era-residence-master-plan.webp':'location-master-plan.webp',
 'era-residence-ground-floor-basement.webp':'apartment-ground-basement.webp',
 'era-residence-kitchen.webp':'gallery-kitchen.webp',
 'era-residence-terrace.webp':'terrace.webp',
 'era-residence-terrace.png':'interior-terrace.png',
 'era-residence-garden.webp':'benefit-garden.webp',
 'era-residence-garden-2.webp':'interior-garden.webp',
 'era-residence-gated-community.webp':'amenity-gated-community.webp',
 'era-residence-pool.webp':'amenity-pool.webp',
 'era-residence-parking.webp':'amenity-parking.webp',
 'era-residence-spa-and-gym.webp':'amenity-spa-gym.webp',
 'era-residence-landscaping.webp':'amenity-landscaping.webp',
 'unreal-logo.svg':'unreal-estate-logo.svg',
 'loc_path.svg':'location-path.svg',
 'loc_path_labels.svg':'location-path-labels.svg',
 'landscape.svg':'landscape.svg',
}
def bucket(n):
    e=n.rsplit('.',1)[-1]
    if e in ('webm','mp4'): return 'videos'
    if e=='woff2': return 'fonts'
    if e=='svg': return 'icons'
    if e=='json': return 'lottie'
    return 'images'

rows=[]
for u in urls:
    n=clean(u); n=RENAME.get(n,n)
    b=bucket(n)
    for base in ('public','reference-download'):
        os.makedirs(f'{ROOT}/{base}/{b}',exist_ok=True)
    dst=f'{ROOT}/public/{b}/{n}'
    if not os.path.exists(dst):
        subprocess.run(['curl','-sL','-A','Mozilla/5.0',u,'-o',dst])
    sz=os.path.getsize(dst) if os.path.exists(dst) else 0
    rows.append((u,f'{b}/{n}',sz))
    print(f'{sz:>9} {b}/{n}')
io.open(f'{ROOT}/docs/_assets.tsv','w',encoding='utf-8').write('\n'.join(f'{a}\t{b}\t{c}' for a,b,c in rows))
print('total',len(rows))
