"""Build the editable portfolio using only Python's standard library."""
from pathlib import Path
from html import escape
from urllib.parse import urlparse
import json
import re
import shutil

ROOT = Path(__file__).resolve().parent
DIST = ROOT / "dist"


def clean(value):
    return escape(str(value or ""), quote=True)


def load_items(name):
    items = []
    for path in sorted((ROOT / "content" / name).glob("*.json")):
        data = json.loads(path.read_text(encoding="utf-8"))
        if isinstance(data, dict) and data.get("title"):
            items.append(data)
    return items


def safe_url(value, image=False):
    value = str(value or "").strip()
    if value.startswith("/media/") and not value.startswith("/media/../") and "\\" not in value:
        return clean(value)
    if not image:
        parsed = urlparse(value)
        if parsed.scheme == "https" and parsed.netloc:
            return clean(value)
    return ""


def replace_once(page, pattern, value):
    page, count = re.subn(pattern, lambda _: value, page, count=1, flags=re.S)
    if count != 1:
        raise ValueError(f"Template marker missing: {pattern[:55]}")
    return page


def build():
    site = json.loads((ROOT / "content/site.json").read_text(encoding="utf-8"))
    page = (ROOT / "template.html").read_text(encoding="utf-8")
    page = replace_once(page, r'<p class="intro">.*?</p>', '<p class="intro">' + clean(site.get("intro")) + '</p>')
    # Replace the about paragraph without interpreting user text as a regular expression.
    page = replace_once(page, r'(<section id="about">.*?<div><p>).*?(</p>)',
                        lambda_about(site.get("about"), page))

    photos = load_items("photos")
    if photos:
        blocks = []
        for item in photos:
            image = safe_url(item.get("image"), image=True)
            if not image:
                continue
            title = clean(item["title"])
            caption = clean(item.get("description"))
            category = clean(item.get("category"))
            blocks.append(f'<figure class="photo photo-real"><img src="{image}" alt="{title}" loading="lazy"><figcaption><strong>{title}</strong><span>{category}{" · " if category and caption else ""}{caption}</span></figcaption></figure>')
        photo_html = "".join(blocks) or '<p class="notice">摄影作品即将更新。</p>'
        note = ""
    else:
        photo_html = ''.join(f'<div class="photo"><strong>{clean(x)}</strong></div>' for x in ["人物肖像", "校园纪实", "城市观察", "商业拍摄", "影像日记"])
        note = '<p class="notice">当前为分类封面示意，尚未使用你的真实摄影作品。</p>'
    page = replace_once(page, r'<div class="photo-grid">.*?</div><p class="notice">当前为分类封面示意，尚未使用你的真实摄影作品。</p>',
                        '<div class="photo-grid">' + photo_html + '</div>' + note)

    courses = load_items("courses")
    course_html = ''.join(
        '<article class="card"><span class="num">COURSE %02d</span><h3>%s</h3><p>%s</p><div class="meta">%s</div>%s</article>' %
        (i, clean(x["title"]), clean(x.get("description")), clean(x.get("tag")),
         f'<a class="card-link" href="{safe_url(x.get("link"))}" target="_blank" rel="noopener noreferrer">查看课程资料 ↗</a>' if safe_url(x.get("link")) else "")
        for i, x in enumerate(courses, 1))
    page = replace_once(page, r'<div class="cards">.*?</div></div></section><section id="research">',
                        '<div class="cards">' + course_html + '</div></div></section><section id="research">')

    research = load_items("research")
    research_html = ''.join(
        f'<article class="research-box{" dark" if i % 2 else ""}"><small>{clean(x.get("category"))}</small><h3>{clean(x["title"])}</h3><p>{clean(x.get("description"))}</p>' +
        (f'<a class="research-link" href="{safe_url(x.get("link"))}" target="_blank" rel="noopener noreferrer">查看成果 ↗</a>' if safe_url(x.get("link")) else "") + '</article>'
        for i, x in enumerate(research))
    page = replace_once(page, r'<div class="research">.*?</div></div></section><section id="python">',
                        '<div class="research">' + research_html + '</div></div></section><section id="python">')
    page = page.replace('</style>', '.photo-real{padding:0;display:block;background:#26364a!important;margin:0}.photo-real:before{display:none}.photo-real img{display:block;width:100%;height:100%;object-fit:cover}.photo-real figcaption{position:absolute;left:0;right:0;bottom:0;padding:16px 20px;background:linear-gradient(transparent,#000b);display:flex;flex-direction:column;gap:5px}.photo-real figcaption span{position:relative;font-size:13px;color:#e7ecf2}.card-link,.research-link{display:inline-block;margin-top:12px;color:#8bc9f8;text-decoration:underline}.research-link{color:#2974ac}.research-box.dark .research-link{color:#8bc9f8}</style>')

    DIST.mkdir(exist_ok=True)
    (DIST / "index.html").write_text(page, encoding="utf-8")
    media = ROOT / "media"
    if media.exists():
        shutil.copytree(media, DIST / "media", dirs_exist_ok=True, ignore=shutil.ignore_patterns(".gitkeep"))
    print(f"Built {DIST / 'index.html'}: {len(photos)} photos, {len(courses)} courses, {len(research)} research entries")


def lambda_about(value, page):
    match = re.search(r'(<section id="about">.*?<div><p>).*?(</p>)', page, flags=re.S)
    if not match:
        raise ValueError("About paragraph missing")
    return match.group(1) + clean(value) + match.group(2)


if __name__ == "__main__":
    build()
