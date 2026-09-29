"""Build Henry Qian's editable portfolio with Python's standard library only."""
from pathlib import Path
from html import escape
from urllib.parse import parse_qs, urlparse
import json
import re
import shutil


ROOT = Path(__file__).resolve().parent
DIST = ROOT / "dist"


ACCENTS = {
    "electric-blue": ("#145cff", "#eaf0ff", "#0b3da9"),
    "storm-orange": ("#f05a32", "#fff0eb", "#a62c0d"),
    "forest": ("#087c61", "#e5f5f0", "#04523f"),
    "violet": ("#6c52e5", "#f0edff", "#3c299c"),
}
SECTION_IDS = {
    "hero": "home",
    "marquee": "marquee",
    "photography": "photography",
    "video": "video",
    "stats": "highlights",
    "teaching": "teaching",
    "research": "research",
    "python": "python",
    "story": "story",
    "about": "about",
    "contact": "contact",
}


def clean(value):
    """Escape editable text before inserting it into HTML."""
    return escape(str(value or ""), quote=True)


def clean_multiline(value):
    """Escape editable text while preserving intentional line breaks."""
    return clean(value).replace("\r\n", "\n").replace("\r", "\n").replace("\n", "<br>")


def truthy(value, default=False):
    if value is None:
        return default
    return bool(value)


def clamp_number(value, minimum, maximum, default):
    try:
        return max(minimum, min(maximum, int(value)))
    except (TypeError, ValueError):
        return default


def choice(value, allowed, default):
    return value if value in allowed else default


def safe_url(value, anchors=True, email=False):
    """Allow only safe public links and local page anchors."""
    value = str(value or "").strip()
    if anchors and re.fullmatch(r"#[a-z][a-z0-9-]*", value):
        return clean(value)
    if email and re.fullmatch(r"mailto:[^\s@]+@[^\s@]+\.[^\s@]+", value):
        return clean(value)
    parsed = urlparse(value)
    if parsed.scheme == "https" and parsed.netloc:
        return clean(value)
    return ""


def safe_media(value):
    """Allow Pages CMS media paths and HTTPS-hosted media."""
    value = str(value or "").strip()
    if value.startswith("/media/") and ".." not in value and "\\" not in value:
        return clean(value.lstrip("/"))
    return safe_url(value, anchors=False)


def safe_anchor(value, fallback):
    """Return a stable, editable in-page anchor without allowing HTML injection."""
    value = str(value or "").strip().lower()
    if re.fullmatch(r"[a-z][a-z0-9-]{0,48}", value):
        return value
    return fallback


def section_dom_id(section, kind, index=0):
    fallback = SECTION_IDS.get(kind, f"section-{index}")
    if kind in {"story", "video"}:
        return safe_anchor(section.get("anchor"), fallback)
    return fallback


def video_embed_url(value, autoplay=False, muted=True, loop=False, controls=True):
    """Convert common YouTube/Bilibili links to privacy-conscious embed URLs."""
    value = str(value or "").strip()
    parsed = urlparse(value)
    if parsed.scheme != "https" or not parsed.netloc:
        return ""
    host = parsed.netloc.lower().split(":", 1)[0]
    video_id = ""
    if host in {"youtu.be", "www.youtu.be"}:
        video_id = parsed.path.strip("/").split("/")[0]
    elif host in {"youtube.com", "www.youtube.com", "m.youtube.com", "youtube-nocookie.com", "www.youtube-nocookie.com"}:
        if parsed.path == "/watch":
            video_id = parse_qs(parsed.query).get("v", [""])[0]
        elif parsed.path.startswith(("/embed/", "/shorts/")):
            video_id = parsed.path.strip("/").split("/")[1]
    if re.fullmatch(r"[A-Za-z0-9_-]{6,20}", video_id):
        params = [f"autoplay={1 if autoplay else 0}", f"mute={1 if muted else 0}", f"controls={1 if controls else 0}", "rel=0"]
        if loop:
            params.extend(("loop=1", f"playlist={video_id}"))
        return f"https://www.youtube-nocookie.com/embed/{video_id}?{'&'.join(params)}"
    if host in {"bilibili.com", "www.bilibili.com", "m.bilibili.com"}:
        match = re.search(r"/(BV[A-Za-z0-9]+)", parsed.path, re.IGNORECASE)
        if match:
            bvid = match.group(1)
            return f"https://player.bilibili.com/player.html?bvid={bvid}&autoplay={1 if autoplay else 0}&high_quality=1"
    if host == "player.bilibili.com" and parsed.path == "/player.html":
        return safe_url(value, anchors=False)
    return ""


def render_video_media(data, class_name="video-media", eager=False):
    """Render uploaded/direct video, a supported embed, a poster, or a placeholder."""
    video_file = safe_media(data.get("video_file"))
    video_url_raw = str(data.get("video_url") or "").strip()
    video_url = safe_url(video_url_raw, anchors=False)
    poster = safe_media(data.get("poster") or data.get("cover_image"))
    title = clean(data.get("title") or data.get("heading") or "视频作品")
    autoplay = truthy(data.get("autoplay"), False)
    muted = truthy(data.get("muted"), True)
    loop = truthy(data.get("loop"), False)
    controls = truthy(data.get("controls"), True)
    embed = video_embed_url(video_url_raw, autoplay=autoplay, muted=muted, loop=loop, controls=controls)
    if embed:
        allow = "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share"
        return (
            f'<div class="{class_name} is-embed"><iframe src="{clean(embed)}" title="{title}" '
            f'loading="{"eager" if eager else "lazy"}" allow="{allow}" allowfullscreen></iframe></div>'
        )
    source = video_file or video_url
    if source:
        attrs = ["playsinline", f'aria-label="{title}"']
        if poster:
            attrs.append(f'poster="{poster}"')
        if controls:
            attrs.append("controls")
        if autoplay:
            attrs.append("autoplay")
        if muted or autoplay:
            attrs.append("muted")
        if loop:
            attrs.append("loop")
        if not eager:
            attrs.append('preload="metadata"')
        return f'<div class="{class_name}"><video src="{source}" {" ".join(attrs)}></video></div>'
    if poster:
        return f'<div class="{class_name} is-poster"><img src="{poster}" alt="{title}" loading="{"eager" if eager else "lazy"}"></div>'
    return (
        f'<div class="{class_name} video-placeholder" aria-label="{title}">'
        '<span class="video-play" aria-hidden="true">▶</span><strong>VIDEO SLOT</strong><small>在后台上传视频或粘贴链接</small></div>'
    )


def load_json(path, fallback):
    if not path.exists():
        return fallback
    return json.loads(path.read_text(encoding="utf-8"))


def load_items(name):
    items = []
    folder = ROOT / "content" / name
    if not folder.exists():
        return items
    for path in sorted(folder.glob("*.json")):
        data = load_json(path, {})
        if isinstance(data, dict) and data.get("title") and truthy(data.get("visible"), True):
            data["_filename"] = path.name
            items.append(data)
    return sorted(items, key=lambda item: (clamp_number(item.get("order"), -9999, 9999, 999), item["_filename"]))


def render_tags(tags):
    if isinstance(tags, str):
        tags = [part.strip() for part in tags.split("·") if part.strip()]
    if not isinstance(tags, list):
        return ""
    return "".join(f'<span class="tag">{clean(tag)}</span>' for tag in tags if tag)


def render_section_head(section, index):
    number = clean(section.get("number") or f"{index:02d}")
    eyebrow = clean(section.get("eyebrow"))
    heading = clean_multiline(section.get("heading"))
    intro = clean_multiline(section.get("description"))
    return (
        '<header class="section-head" data-reveal>'
        f'<div class="section-mark"><span>{number}</span><span>{eyebrow}</span></div>'
        f'<h2>{heading}</h2>'
        f'<p>{intro}</p>'
        '</header>'
    )


def render_button(label, target, kind="primary"):
    url = safe_url(target, anchors=True, email=True)
    if not label or not url:
        return ""
    external = url.startswith("https://")
    attrs = ' target="_blank" rel="noopener noreferrer"' if external else ""
    arrow = "↗" if external else "→"
    return f'<a class="button button-{kind}" href="{url}"{attrs}><span>{clean(label)}</span><span aria-hidden="true">{arrow}</span></a>'


def render_hero(section, identity, ui_labels):
    layout = choice(section.get("layout"), {"split", "full", "minimal"}, "split")
    media_type = choice(section.get("media_type"), {"image", "video"}, "image")
    image = safe_media(section.get("image"))
    focal = choice(section.get("image_position"), {"center", "top", "bottom", "left", "right"}, "center")
    if media_type == "video" and (section.get("video_file") or section.get("video_url") or section.get("poster")):
        visual = render_video_media(section, class_name="hero-video", eager=True)
    else:
        visual = (
            f'<img src="{image}" alt="{clean(section.get("image_alt"))}" style="object-position:{focal}" fetchpriority="high">'
            if image else
            '<div class="hero-placeholder" aria-label="等待上传首屏照片"><span class="orbit orbit-one"></span>'
            '<span class="orbit orbit-two"></span><strong>Q / H</strong><small>FRAME · STUDY · CREATE</small></div>'
        )
    specialties = identity.get("specialties", []) if isinstance(identity, dict) else []
    chips = "".join(f'<span>{clean(item)}</span>' for item in specialties if item)
    buttons = render_button(section.get("primary_label"), section.get("primary_target"), "primary")
    buttons += render_button(section.get("secondary_label"), section.get("secondary_target"), "ghost")
    note = clean(section.get("visual_note"))
    return (
        f'<section id="home" class="hero hero-{layout}">'
        '<div class="hero-copy" data-reveal>'
        f'<p class="hero-kicker">{clean(section.get("kicker"))}</p>'
        f'<h1>{clean_multiline(section.get("heading"))}</h1>'
        f'<p class="hero-intro">{clean_multiline(section.get("description"))}</p>'
        f'<div class="hero-actions">{buttons}</div>'
        f'<div class="hero-specialties">{chips}</div>'
        '</div>'
        f'<div class="hero-media" data-reveal><div class="hero-frame">{visual}</div>'
        f'<div class="hero-media-caption"><span>{note}</span><span>{clean(ui_labels.get("scroll") or "SCROLL ↓")}</span></div></div>'
        '</section>'
    )


def render_marquee(section):
    items = section.get("items", [])
    if not isinstance(items, list) or not items:
        return ""
    unit = "".join(f'<span>{clean(item)}</span><i aria-hidden="true">✦</i>' for item in items if item)
    return (
        '<section class="marquee" aria-label="创作领域"><div class="marquee-track">'
        f'<div>{unit}</div><div aria-hidden="true">{unit}</div></div></section>'
    )


def render_photography(section, photos, index, ui_labels):
    layout = choice(section.get("layout"), {"editorial", "masonry", "cinema"}, "editorial")
    limit = clamp_number(section.get("limit"), 1, 30, 9)
    selected = photos[:limit]
    categories = []
    for item in selected:
        category = str(item.get("category") or "未分类")
        if category not in categories:
            categories.append(category)
    filters = f'<button class="filter is-active" type="button" data-filter="all">{clean(ui_labels.get("filter_all") or "全部")}</button>'
    filters += "".join(
        f'<button class="filter" type="button" data-filter="{clean(category)}">{clean(category)}</button>'
        for category in categories
    )
    cards = []
    for card_index, item in enumerate(selected, 1):
        size = choice(item.get("size"), {"standard", "wide", "tall", "feature"}, "standard")
        image = safe_media(item.get("image"))
        focal = choice(item.get("image_position"), {"center", "top", "bottom", "left", "right"}, "center")
        title = clean(item.get("title"))
        category = clean(item.get("category") or "未分类")
        year = clean(item.get("year"))
        description = clean(item.get("description"))
        details = " · ".join(str(value) for value in (item.get("location"), item.get("credit")) if value)
        detail_html = f'<small class="shot-detail">{clean(details)}</small>' if details else ""
        if image:
            media = f'<img src="{image}" alt="{clean(item.get("alt") or item.get("title"))}" loading="lazy" style="object-position:{focal}">'
        else:
            media = (
                f'<div class="shot-placeholder placeholder-{(card_index - 1) % 6 + 1}">'
                f'<span>{clean(ui_labels.get("image_slot") or "IMAGE SLOT")}</span><strong>{clean(ui_labels.get("image_placeholder") or "上传你的作品")}</strong></div>'
            )
        media_link = safe_url(item.get("link"), anchors=False)
        if media_link:
            media_label = clean(item.get("link_label") or f'查看{item.get("title") or "作品"}')
            media = (
                f'<a href="{media_link}" target="_blank" rel="noopener noreferrer" '
                f'aria-label="{media_label}">{media}</a>'
            )
        cards.append(
            f'<article class="shot shot-{size}" data-category="{category}" data-reveal>'
            f'<div class="shot-media">{media}</div>'
            '<div class="shot-caption">'
            f'<div><span>{category}{" · " + year if year else ""}</span><h3>{title}</h3></div>'
            f'<p>{description}{detail_html}</p>'
            '</div></article>'
        )
    empty = '<p class="empty-state">后台添加摄影作品后，它们会自动出现在这里。</p>'
    return (
        f'<section id="photography" class="section section-{clean(section.get("tone") or "white")}">'
        f'<div class="shell">{render_section_head(section, index)}'
        f'<div class="photo-toolbar" data-reveal>{filters}</div>'
        f'<div class="photo-grid photo-grid-{layout}">{"".join(cards) if cards else empty}</div>'
        f'{render_button(section.get("link_label"), section.get("link_url"), "text")}'
        '</div></section>'
    )


def render_videos(section, videos, index):
    layout = choice(section.get("layout"), {"featured", "grid", "filmstrip"}, "featured")
    limit = clamp_number(section.get("limit"), 1, 20, 6)
    selected = videos[:limit]
    cards = []
    for card_index, item in enumerate(selected, 1):
        size = choice(item.get("size"), {"standard", "wide", "feature"}, "standard")
        media = render_video_media(item, class_name="video-card-media")
        meta = " · ".join(str(value) for value in (item.get("category"), item.get("year"), item.get("duration")) if value)
        link = render_button(item.get("link_label"), item.get("link"), "text")
        cards.append(
            f'<article class="video-card video-card-{size}" data-reveal>'
            f'{media}<div class="video-card-copy"><span>{clean(meta or f"FILM {card_index:02d}")}</span>'
            f'<h3>{clean(item.get("title"))}</h3><p>{clean_multiline(item.get("description"))}</p>{link}</div></article>'
        )
    empty = '<p class="empty-state">在后台“视频作品”中添加内容，再打开本板块的显示开关。</p>'
    section_id = section_dom_id(section, "video", index)
    return (
        f'<section id="{section_id}" class="section section-{clean(section.get("tone") or "white")}">'
        f'<div class="shell">{render_section_head(section, index)}'
        f'<div class="video-grid video-grid-{layout}">{"".join(cards) if cards else empty}</div>'
        f'{render_button(section.get("link_label"), section.get("link_url"), "text")}</div></section>'
    )


def render_story(section, index):
    layout = choice(section.get("layout"), {"media-left", "media-right", "full"}, "media-left")
    media_type = choice(section.get("media_type"), {"image", "video", "none"}, "image")
    section_id = section_dom_id(section, "story", index)
    if media_type == "video":
        media = render_video_media(section, class_name="story-visual")
    elif media_type == "image":
        image = safe_media(section.get("image"))
        focal = choice(section.get("image_position"), {"center", "top", "bottom", "left", "right"}, "center")
        media = (
            f'<div class="story-visual"><img src="{image}" alt="{clean(section.get("image_alt") or section.get("heading"))}" '
            f'loading="lazy" style="object-position:{focal}"></div>'
            if image else '<div class="story-visual story-placeholder"><span>STORY / IMAGE</span></div>'
        )
    else:
        media = ""
    number = clean(section.get("number") or f"{index:02d}")
    copy = (
        '<div class="story-copy" data-reveal>'
        f'<div class="section-mark"><span>{number}</span><span>{clean(section.get("eyebrow"))}</span></div>'
        f'<h2>{clean_multiline(section.get("heading"))}</h2>'
        f'<p class="story-lead">{clean_multiline(section.get("description"))}</p>'
        f'<div class="story-body">{clean_multiline(section.get("body"))}</div>'
        f'<blockquote>{clean_multiline(section.get("quote"))}</blockquote>'
        f'<div class="hero-actions">{render_button(section.get("primary_label"), section.get("primary_target"), "primary")}'
        f'{render_button(section.get("secondary_label"), section.get("secondary_target"), "ghost")}</div></div>'
    )
    media_html = f'<div data-reveal>{media}</div>' if media else ""
    no_media_class = " story-no-media" if not media else ""
    return (
        f'<section id="{section_id}" class="section section-{clean(section.get("tone") or "white")}">'
        f'<div class="shell story story-{layout}{no_media_class}">{media_html}{copy}</div></section>'
    )


def render_stats(section, index):
    items = section.get("items", [])
    if not isinstance(items, list):
        items = []
    cards = "".join(
        '<article class="stat" data-reveal>'
        f'<strong>{clean(item.get("value"))}</strong><span>{clean(item.get("label"))}</span>'
        f'<p>{clean(item.get("note"))}</p></article>'
        for item in items if isinstance(item, dict)
    )
    return (
        f'<section id="highlights" class="section section-{clean(section.get("tone") or "white")}">'
        f'<div class="shell">{render_section_head(section, index)}<div class="stats-grid">{cards}</div></div></section>'
    )


def render_teaching(section, courses, index):
    layout = choice(section.get("layout"), {"cards", "spotlight", "compact"}, "spotlight")
    limit = clamp_number(section.get("limit"), 1, 20, 6)
    cards = []
    for card_index, item in enumerate(courses[:limit], 1):
        cover = safe_media(item.get("cover_image"))
        cover_html = (
            f'<div class="course-cover"><img src="{cover}" alt="{clean(item.get("cover_alt") or item.get("title"))}" loading="lazy"></div>'
            if cover else f'<div class="course-cover course-placeholder"><span>{card_index:02d}</span><b>{clean(item.get("label") or "COURSE")}</b></div>'
        )
        link = safe_url(item.get("link"), anchors=False)
        link_html = (
            f'<a class="card-link" href="{link}" target="_blank" rel="noopener noreferrer">{clean(item.get("link_label") or "查看课程资料")} ↗</a>'
            if link else ""
        )
        cards.append(
            '<article class="course-card" data-reveal>'
            f'{cover_html}<div class="course-body"><div class="card-top"><span>{clean(item.get("label") or f"COURSE {card_index:02d}")}</span>'
            f'<span>{clean(item.get("status"))}</span></div><h3>{clean(item.get("title"))}</h3>'
            f'<p>{clean(item.get("description"))}</p><div class="tags">{render_tags(item.get("tags") or item.get("tag"))}</div>{link_html}</div>'
            '</article>'
        )
    return (
        f'<section id="teaching" class="section section-{clean(section.get("tone") or "white")}">'
        f'<div class="shell">{render_section_head(section, index)}<div class="course-grid course-grid-{layout}">{"".join(cards)}</div></div></section>'
    )


def render_research(section, research, index):
    layout = choice(section.get("layout"), {"timeline", "grid", "list"}, "timeline")
    limit = clamp_number(section.get("limit"), 1, 30, 8)
    items = []
    for item in research[:limit]:
        link = safe_url(item.get("link"), anchors=False)
        link_html = f'<a href="{link}" target="_blank" rel="noopener noreferrer">{clean(item.get("link_label") or "查看成果")} ↗</a>' if link else ""
        items.append(
            '<article class="research-item" data-reveal>'
            f'<div class="research-year">{clean(item.get("year") or "NOW")}</div>'
            f'<div class="research-type">{clean(item.get("category"))}</div>'
            f'<div class="research-copy"><h3>{clean(item.get("title"))}</h3><p>{clean(item.get("description"))}</p>'
            f'<div class="research-meta">{clean(item.get("publication"))}</div>{link_html}</div>'
            '</article>'
        )
    return (
        f'<section id="research" class="section section-{clean(section.get("tone") or "white")}">'
        f'<div class="shell">{render_section_head(section, index)}<div class="research-list research-layout-{layout}">{"".join(items)}</div></div></section>'
    )


def render_calculator(item):
    return (
        '<article class="app-card app-calculator" data-app="ipo-calculator" data-reveal>'
        f'<div class="app-copy"><span class="app-index">{clean(item.get("label") or "INTERACTIVE / FINANCE")}</span>'
        f'<h3>{clean(item.get("title"))}</h3><p>{clean(item.get("description"))}</p>'
        f'<div class="tags">{render_tags(item.get("tags"))}</div></div>'
        '<form class="calculator" novalidate>'
        f'<label>{clean(item.get("input_one_label") or "发行价（元）")}<input name="issue" type="number" min="0.01" step="0.01" placeholder="10.00" required></label>'
        f'<label>{clean(item.get("input_two_label") or "首日收盘价（元）")}<input name="close" type="number" min="0" step="0.01" placeholder="15.00" required></label>'
        f'<button type="submit">{clean(item.get("action_label") or "开始计算")} <span>→</span></button>'
        f'<output aria-live="polite" data-label="{clean(item.get("result_label") or "首日抑价率")}">等待输入</output>'
        '</form></article>'
    )


def render_python(section, apps, index, ui_labels):
    layout = choice(section.get("layout"), {"lab", "cards", "compact"}, "lab")
    limit = clamp_number(section.get("limit"), 1, 20, 6)
    cards = []
    for card_index, item in enumerate(apps[:limit], 1):
        if item.get("app_type") == "calculator":
            cards.append(render_calculator(item))
            continue
        link = safe_url(item.get("link"), anchors=False)
        link_html = (
            f'<a class="card-link" href="{link}" target="_blank" rel="noopener noreferrer">{clean(item.get("link_label") or "查看项目")} ↗</a>'
            if link else f'<span class="coming-soon">{clean(ui_labels.get("coming_soon") or "COMING SOON")}</span>'
        )
        cards.append(
            '<article class="app-card app-project" data-reveal>'
            f'<div class="app-symbol">{clean(item.get("symbol") or f"{card_index:02d}")}</div>'
            f'<span class="app-index">{clean(item.get("label") or f"PROJECT {card_index:02d}")}</span><h3>{clean(item.get("title"))}</h3>'
            f'<p>{clean(item.get("description"))}</p><div class="tags">{render_tags(item.get("tags"))}</div>{link_html}</article>'
        )
    return (
        f'<section id="python" class="section section-{clean(section.get("tone") or "white")}">'
        f'<div class="shell">{render_section_head(section, index)}<div class="app-grid app-grid-{layout}">{"".join(cards)}</div></div></section>'
    )


def render_about(section, index):
    image = safe_media(section.get("image"))
    portrait = (
        f'<img src="{image}" alt="{clean(section.get("image_alt") or "钱子恒个人照片")}" loading="lazy">'
        if image else '<div class="about-placeholder"><span>HENRY QIAN</span><strong>观察<br>连接<br>表达</strong></div>'
    )
    facts = section.get("facts", [])
    if not isinstance(facts, list):
        facts = []
    fact_html = "".join(
        f'<li><span>{clean(item.get("label"))}</span><strong>{clean(item.get("value"))}</strong></li>'
        for item in facts if isinstance(item, dict)
    )
    return (
        f'<section id="about" class="section section-{clean(section.get("tone") or "white")}">'
        f'<div class="shell">{render_section_head(section, index)}<div class="about-grid">'
        f'<div class="about-portrait" data-reveal>{portrait}</div><div class="about-copy" data-reveal>'
        f'<blockquote>{clean_multiline(section.get("quote"))}</blockquote><p>{clean_multiline(section.get("body"))}</p>'
        f'<ul>{fact_html}</ul></div></div></div></section>'
    )


def render_contact(section, identity, socials, index):
    email = str(identity.get("email") or "").strip() if isinstance(identity, dict) else ""
    email_link = safe_url(f"mailto:{email}", email=True) if email else ""
    social_html = "".join(
        f'<a href="{safe_url(item.get("url"), anchors=False)}" target="_blank" rel="noopener noreferrer">{clean(item.get("label"))} ↗</a>'
        for item in socials if isinstance(item, dict) and safe_url(item.get("url"), anchors=False)
    )
    email_html = f'<a class="contact-email" href="{email_link}">{clean(email)} ↗</a>' if email_link else ""
    return (
        f'<section id="contact" class="section contact-section section-{clean(section.get("tone") or "white")}">'
        '<div class="shell contact-grid">'
        f'<div data-reveal><div class="section-mark"><span>{clean(section.get("number") or f"{index:02d}")}</span>'
        f'<span>{clean(section.get("eyebrow"))}</span></div><h2>{clean_multiline(section.get("heading"))}</h2></div>'
        f'<div class="contact-copy" data-reveal><p>{clean_multiline(section.get("description"))}</p>{email_html}'
        f'<div class="social-links">{social_html}</div></div></div></section>'
    )


def render_sections(site, collections):
    sections = site.get("sections", [])
    if not isinstance(sections, list):
        sections = []
    output = []
    ui_labels = site.get("ui_labels", {}) if isinstance(site.get("ui_labels"), dict) else {}
    visible_index = 0
    for section in sections:
        if not isinstance(section, dict) or not truthy(section.get("visible"), True):
            continue
        kind = section.get("type")
        if kind not in SECTION_IDS:
            continue
        if kind not in {"hero", "marquee"}:
            visible_index += 1
        if kind == "hero":
            output.append(render_hero(section, site.get("identity", {}), ui_labels))
        elif kind == "marquee":
            output.append(render_marquee(section))
        elif kind == "photography":
            output.append(render_photography(section, collections["photos"], visible_index, ui_labels))
        elif kind == "video":
            output.append(render_videos(section, collections["videos"], visible_index))
        elif kind == "stats":
            output.append(render_stats(section, visible_index))
        elif kind == "teaching":
            output.append(render_teaching(section, collections["courses"], visible_index))
        elif kind == "research":
            output.append(render_research(section, collections["research"], visible_index))
        elif kind == "python":
            output.append(render_python(section, collections["apps"], visible_index, ui_labels))
        elif kind == "story":
            output.append(render_story(section, visible_index))
        elif kind == "about":
            output.append(render_about(section, visible_index))
        elif kind == "contact":
            output.append(render_contact(section, site.get("identity", {}), site.get("socials", []), visible_index))
    return "".join(output)


def render_navigation(site):
    identity = site.get("identity", {}) if isinstance(site.get("identity"), dict) else {}
    sections = site.get("sections", []) if isinstance(site.get("sections"), list) else []
    ui_labels = site.get("ui_labels", {}) if isinstance(site.get("ui_labels"), dict) else {}
    links = []
    for section_index, section in enumerate(sections, 1):
        if not isinstance(section, dict) or not truthy(section.get("visible"), True) or not truthy(section.get("show_in_nav"), False):
            continue
        kind = section.get("type")
        if kind in SECTION_IDS and section.get("nav_label"):
            links.append(f'<a href="#{section_dom_id(section, kind, section_index)}">{clean(section.get("nav_label"))}</a>')
    return (
        '<header class="site-header"><div class="nav-shell">'
        f'<a class="brand" href="#home"><span>{clean(identity.get("logo_text") or "QZH")}</span>'
        f'<span class="brand-name">{clean(identity.get("name_zh") or "钱子恒")}<small>{clean(identity.get("name_en") or "HENRY QIAN")}</small></span></a>'
        f'<button class="menu-button" type="button" aria-expanded="false" aria-controls="main-nav"><span></span><span></span><span></span><b>{clean(ui_labels.get("menu") or "菜单")}</b></button>'
        f'<nav id="main-nav" aria-label="主导航">{"".join(links)}</nav></div></header>'
    )


def render_footer(site):
    identity = site.get("identity", {}) if isinstance(site.get("identity"), dict) else {}
    footer = site.get("footer", {}) if isinstance(site.get("footer"), dict) else {}
    return (
        '<footer class="site-footer"><div class="shell footer-grid">'
        f'<div><strong>{clean(identity.get("name_zh") or "钱子恒")} / {clean(identity.get("name_en") or "HENRY QIAN")}</strong>'
        f'<p>{clean(footer.get("tagline"))}</p></div>'
        f'<div><span>{clean(identity.get("location"))}</span><span>© <b id="current-year">2026</b> {clean(footer.get("copyright") or identity.get("name_en"))}</span></div>'
        '</div></footer>'
    )


def build():
    site = load_json(ROOT / "content" / "site.json", {})
    collections = {name: load_items(name) for name in ("photos", "videos", "courses", "research", "apps")}
    identity = site.get("identity", {}) if isinstance(site.get("identity"), dict) else {}
    seo = site.get("seo", {}) if isinstance(site.get("seo"), dict) else {}
    appearance = site.get("appearance", {}) if isinstance(site.get("appearance"), dict) else {}
    accent_name = choice(appearance.get("accent"), set(ACCENTS), "electric-blue")
    accent, accent_soft, accent_deep = ACCENTS[accent_name]
    corners = {"sharp": "2px", "subtle": "14px", "soft": "26px"}.get(appearance.get("corners"), "14px")
    spacing = {"compact": "88px", "balanced": "112px", "airy": "144px"}.get(appearance.get("spacing"), "112px")
    shell_max = {"studio": "1240px", "wide": "1440px", "cinema": "1680px"}.get(appearance.get("width"), "1440px")
    header_style = choice(appearance.get("header_style"), {"glass", "solid"}, "glass")
    body_class = "motion-on" if truthy(appearance.get("motion"), True) else "motion-off"
    body_class += f" header-{header_style}"
    title = clean(seo.get("title") or f'{identity.get("name_zh", "钱子恒")} {identity.get("name_en", "Henry Qian")}｜个人网站')
    description = clean(seo.get("description") or "钱子恒的摄影、教学、学术研究与 Python 项目作品集。")
    share_image = safe_media(seo.get("share_image"))
    share_image_meta = f'\n  <meta property="og:image" content="{share_image}">' if share_image else ""
    html = f'''<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#ffffff">
  <meta name="description" content="{description}">
  <meta property="og:title" content="{title}">
  <meta property="og:description" content="{description}">{share_image_meta}
  <title>{title}</title>
  <link rel="stylesheet" href="assets/styles.css">
  <style>:root{{--accent:{accent};--accent-soft:{accent_soft};--accent-deep:{accent_deep};--radius:{corners};--section-space:{spacing};--shell-max:{shell_max}}}</style>
</head>
<body class="{body_class}">
  <a class="skip-link" href="#main">跳到主要内容</a>
  {render_navigation(site)}
  <main id="main">{render_sections(site, collections)}</main>
  {render_footer(site)}
  <script src="assets/app.js" defer></script>
</body>
</html>
'''
    DIST.mkdir(exist_ok=True)
    (DIST / "index.html").write_text(html, encoding="utf-8")
    for folder in ("assets", "media"):
        source = ROOT / folder
        if source.exists():
            shutil.copytree(source, DIST / folder, dirs_exist_ok=True, ignore=shutil.ignore_patterns(".gitkeep"))
    counts = ", ".join(f"{name}={len(items)}" for name, items in collections.items())
    print(f"Built {DIST / 'index.html'} ({counts})")


if __name__ == "__main__":
    build()
