const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const field = (key, label, type = "text", extra = {}) => ({ key, label, type, ...extra });

const toneOptions = [["white", "纯白"], ["mist", "浅灰"], ["ink", "深色"]];
const commonSectionFields = [
  field("visible", "在网页显示", "boolean"),
  field("show_in_nav", "显示在顶部导航", "boolean"),
  field("nav_label", "导航文字"),
  field("number", "板块编号"),
  field("eyebrow", "英文小标题"),
  field("heading", "中文大标题", "textarea", { wide: true }),
  field("description", "板块介绍", "textarea", { wide: true }),
];

const SECTION_SCHEMAS = {
  hero: {
    label: "首屏主视觉",
    fields: [
      field("visible", "在网页显示", "boolean"), field("show_in_nav", "显示在顶部导航", "boolean"), field("nav_label", "导航文字"),
      field("kicker", "标题上方英文小字", "text", { wide: true }), field("heading", "首屏大标题", "textarea", { wide: true }),
      field("description", "首屏介绍", "textarea", { wide: true }), field("primary_label", "主按钮文字"), field("primary_target", "主按钮链接"),
      field("secondary_label", "次按钮文字"), field("secondary_target", "次按钮链接"),
      field("media_type", "首屏媒体", "select", { options: [["image", "照片"], ["video", "视频"]] }),
      field("image", "首屏照片", "media", { mediaKind: "image", wide: true }), field("image_alt", "照片说明"),
      field("image_position", "照片焦点", "select", { options: [["center", "居中"], ["top", "靠上"], ["bottom", "靠下"], ["left", "靠左"], ["right", "靠右"]] }),
      field("video_file", "上传的视频", "media", { mediaKind: "video", wide: true }), field("video_url", "视频外部链接", "text", { wide: true }),
      field("poster", "视频封面", "media", { mediaKind: "image", wide: true }), field("autoplay", "自动播放", "boolean"),
      field("muted", "默认静音", "boolean"), field("loop", "循环播放", "boolean"), field("controls", "显示播放控件", "boolean"),
      field("visual_note", "图片下方小字"), field("layout", "首屏排版", "select", { options: [["split", "左右图文"], ["full", "全屏影像"], ["minimal", "极简纯文字"]] }),
    ],
  },
  marquee: { label: "滚动关键词条", fields: [field("visible", "在网页显示", "boolean"), field("items", "滚动关键词", "string-list", { wide: true })] },
  photography: { label: "摄影作品板块", fields: [...commonSectionFields, field("layout", "照片排版", "select", { options: [["editorial", "杂志网格"], ["masonry", "瀑布流"], ["cinema", "宽银幕长卷"]] }), field("tone", "板块底色", "select", { options: toneOptions }), field("limit", "最多显示数量", "number"), field("link_label", "更多按钮文字"), field("link_url", "更多按钮链接")] },
  video: { label: "视频作品板块", fields: [...commonSectionFields, field("anchor", "页面锚点英文名"), field("layout", "视频排版", "select", { options: [["featured", "首条突出"], ["grid", "双列网格"], ["filmstrip", "电影长卷"]] }), field("tone", "板块底色", "select", { options: toneOptions }), field("limit", "最多显示数量", "number"), field("link_label", "更多按钮文字"), field("link_url", "更多按钮链接")] },
  stats: { label: "数据亮点板块", fields: [...commonSectionFields, field("tone", "板块底色", "select", { options: toneOptions }), field("items", "数据卡片", "object-list", { wide: true, itemFields: [field("value", "数字/短词"), field("label", "名称"), field("note", "补充说明")] })] },
  teaching: { label: "课程教学板块", fields: [...commonSectionFields, field("layout", "课程排版", "select", { options: [["spotlight", "首门课程突出"], ["cards", "等宽卡片"], ["compact", "紧凑列表"]] }), field("tone", "板块底色", "select", { options: toneOptions }), field("limit", "最多显示数量", "number")] },
  research: { label: "学术研究板块", fields: [...commonSectionFields, field("layout", "成果排版", "select", { options: [["timeline", "年份时间轴"], ["grid", "双列卡片"], ["list", "简洁列表"]] }), field("tone", "板块底色", "select", { options: toneOptions }), field("limit", "最多显示数量", "number")] },
  python: { label: "Python 项目板块", fields: [...commonSectionFields, field("layout", "项目排版", "select", { options: [["lab", "主项目突出"], ["cards", "等宽卡片"], ["compact", "单列紧凑"]] }), field("tone", "板块底色", "select", { options: toneOptions }), field("limit", "最多显示数量", "number")] },
  story: {
    label: "自由图文 / 视频介绍",
    fields: [...commonSectionFields, field("anchor", "页面锚点英文名"), field("body", "详细正文", "textarea", { wide: true }), field("quote", "强调引语", "textarea", { wide: true }),
      field("media_type", "媒体类型", "select", { options: [["image", "图片"], ["video", "视频"], ["none", "不使用媒体"]] }), field("image", "配图", "media", { mediaKind: "image", wide: true }),
      field("image_alt", "图片说明"), field("image_position", "图片焦点", "select", { options: [["center", "居中"], ["top", "靠上"], ["bottom", "靠下"], ["left", "靠左"], ["right", "靠右"]] }),
      field("video_file", "上传的视频", "media", { mediaKind: "video", wide: true }), field("video_url", "视频外部链接", "text", { wide: true }), field("poster", "视频封面", "media", { mediaKind: "image", wide: true }),
      field("autoplay", "自动播放", "boolean"), field("muted", "默认静音", "boolean"), field("loop", "循环播放", "boolean"), field("controls", "显示播放控件", "boolean"),
      field("layout", "图文排版", "select", { options: [["media-left", "媒体在左"], ["media-right", "媒体在右"], ["full", "上方宽幅媒体"]] }), field("tone", "板块底色", "select", { options: toneOptions }),
      field("primary_label", "主按钮文字"), field("primary_target", "主按钮链接"), field("secondary_label", "次按钮文字"), field("secondary_target", "次按钮链接")],
  },
  about: { label: "关于我板块", fields: [...commonSectionFields, field("tone", "板块底色", "select", { options: toneOptions }), field("image", "个人照片", "media", { mediaKind: "image", wide: true }), field("image_alt", "照片说明"), field("quote", "个人主张", "textarea", { wide: true }), field("body", "个人介绍正文", "textarea", { wide: true }), field("facts", "个人信息条目", "object-list", { wide: true, itemFields: [field("label", "名称"), field("value", "内容")] })] },
  contact: { label: "联系我板块", fields: [...commonSectionFields, field("tone", "板块底色", "select", { options: toneOptions })] },
};

const SITE_PANELS = [
  { key: "identity", title: "姓名与身份", fields: [field("name_zh", "中文姓名"), field("name_en", "英文姓名"), field("logo_text", "左上角标识"), field("email", "联系邮箱"), field("location", "所在地"), field("specialties", "首屏个人标签", "string-list", { wide: true })] },
  { key: "seo", title: "浏览器与分享信息", fields: [field("title", "网站标题", "text", { wide: true }), field("description", "网站摘要", "textarea", { wide: true }), field("share_image", "社交分享封面", "media", { mediaKind: "image", wide: true })] },
  { key: "appearance", title: "全站视觉", fields: [field("accent", "强调色", "select", { options: [["electric-blue", "电光蓝"], ["storm-orange", "飓风橙"], ["forest", "森林绿"], ["violet", "视觉紫"]] }), field("corners", "卡片圆角", "select", { options: [["sharp", "直角利落"], ["subtle", "轻微圆角"], ["soft", "柔和大圆角"]] }), field("spacing", "页面留白", "select", { options: [["compact", "紧凑"], ["balanced", "均衡"], ["airy", "大留白"]] }), field("width", "页面宽度", "select", { options: [["studio", "精致窄版"], ["wide", "宽版画廊"], ["cinema", "电影宽屏"]] }), field("header_style", "顶部导航", "select", { options: [["glass", "透明磨砂"], ["solid", "纯白实色"]] }), field("motion", "滚动动效", "boolean")] },
  { key: "ui_labels", title: "界面小文字", fields: [field("menu", "手机菜单"), field("scroll", "向下浏览提示"), field("filter_all", "摄影分类“全部”"), field("image_slot", "空照片英文提示"), field("image_placeholder", "空照片中文提示"), field("coming_soon", "即将上线提示")] },
  { key: "socials", title: "社交平台链接", rootList: true, itemFields: [field("label", "平台名称"), field("url", "完整链接")] },
  { key: "footer", title: "页脚", fields: [field("tagline", "页脚短句", "text", { wide: true }), field("copyright", "版权署名")] },
];

const COLLECTION_SCHEMAS = {
  photos: { label: "摄影作品", singular: "摄影作品", fields: [field("title", "作品名称"), field("category", "分类"), field("year", "拍摄年份"), field("image", "上传照片", "media", { mediaKind: "image", wide: true }), field("alt", "图片说明"), field("description", "拍摄说明", "textarea", { wide: true }), field("location", "拍摄地点"), field("credit", "模特 / 客户 / 署名"), field("link", "作品链接", "text", { wide: true }), field("link_label", "链接说明"), field("size", "照片占位大小", "select", { options: [["feature", "主视觉大图"], ["wide", "横幅"], ["tall", "竖图"], ["standard", "标准"]] }), field("image_position", "图片焦点", "select", { options: [["center", "居中"], ["top", "靠上"], ["bottom", "靠下"], ["left", "靠左"], ["right", "靠右"]] }), field("order", "排序数字", "number"), field("visible", "在网页显示", "boolean")] },
  videos: { label: "视频作品", singular: "视频作品", fields: [field("title", "视频名称"), field("category", "分类"), field("year", "发布年份"), field("duration", "视频时长"), field("description", "视频介绍", "textarea", { wide: true }), field("video_file", "上传视频", "media", { mediaKind: "video", wide: true }), field("video_url", "外部视频链接", "text", { wide: true }), field("poster", "视频封面", "media", { mediaKind: "image", wide: true }), field("autoplay", "自动播放", "boolean"), field("muted", "默认静音", "boolean"), field("loop", "循环播放", "boolean"), field("controls", "播放控件", "boolean"), field("size", "卡片大小", "select", { options: [["feature", "主视觉"], ["wide", "宽卡片"], ["standard", "标准"]] }), field("link", "延伸链接", "text", { wide: true }), field("link_label", "链接按钮文字"), field("order", "排序数字", "number"), field("visible", "在网页显示", "boolean")] },
  courses: { label: "课程教学", singular: "课程", fields: [field("title", "课程名称"), field("label", "英文编号"), field("status", "学时或性质"), field("description", "课程简介", "textarea", { wide: true }), field("tags", "课程标签", "string-list", { wide: true }), field("cover_image", "课程封面", "media", { mediaKind: "image", wide: true }), field("cover_alt", "封面说明"), field("link", "课程资料链接", "text", { wide: true }), field("link_label", "按钮文字"), field("order", "排序数字", "number"), field("visible", "在网页显示", "boolean")] },
  research: { label: "学术成果", singular: "学术成果", fields: [field("title", "成果名称"), field("category", "成果类别"), field("year", "年份"), field("publication", "期刊、会议或项目说明", "text", { wide: true }), field("description", "成果简介", "textarea", { wide: true }), field("link", "论文或项目链接", "text", { wide: true }), field("link_label", "按钮文字"), field("order", "排序数字", "number"), field("visible", "在网页显示", "boolean")] },
  apps: { label: "Python 小程序", singular: "Python 项目", fields: [field("title", "项目名称"), field("label", "英文编号"), field("app_type", "项目类型", "select", { options: [["project", "普通项目"], ["calculator", "IPO 计算器"]] }), field("symbol", "圆形标识"), field("description", "项目简介", "textarea", { wide: true }), field("tags", "技术标签", "string-list", { wide: true }), field("input_one_label", "第一个输入框"), field("input_two_label", "第二个输入框"), field("action_label", "计算按钮"), field("result_label", "结果名称"), field("link", "项目链接", "text", { wide: true }), field("link_label", "按钮文字"), field("order", "排序数字", "number"), field("visible", "在网页显示", "boolean")] },
};

const NAV_ITEMS = [
  ["overview", "网站设置"], ["sections", "页面板块"], ["photos", "摄影作品"], ["videos", "视频作品"],
  ["courses", "课程教学"], ["research", "学术成果"], ["apps", "Python 项目"],
];

let model = null;
let baseline = "";
let currentPage = "overview";
let dirty = false;
let deletedPaths = new Set();
let toastTimer = null;
let registry = new Map();
let registryCounter = 0;

const escapeHtml = (value) => String(value ?? "").replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[char]));
const register = (object) => { const id = `o${++registryCounter}`; registry.set(id, object); return id; };
const clone = (value) => JSON.parse(JSON.stringify(value));
const api = async (action, options = {}) => {
  const response = await fetch(`/api/admin/${action}`, { credentials: "same-origin", ...options, headers: { "content-type": "application/json", ...(options.headers || {}) } });
  const data = await response.json().catch(() => ({ error: "服务器返回了无法识别的内容" }));
  if (!response.ok) throw new Error(data.error || `请求失败（${response.status}）`);
  return data;
};

const toast = (message, error = false) => {
  const node = $("#toast");
  node.textContent = message;
  node.className = `toast is-visible${error ? " is-error" : ""}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { node.className = "toast"; }, 3600);
};

const setDirty = (value = true) => {
  dirty = value;
  const state = $("#save-state");
  state.textContent = value ? "有未保存修改" : "已同步";
  state.className = `save-state${value ? " is-dirty" : ""}`;
};

const optionHtml = (options, value) => options.map(([key, label]) => `<option value="${escapeHtml(key)}"${String(value) === key ? " selected" : ""}>${escapeHtml(label)}</option>`).join("");

const renderStringList = (object, config, objectId) => {
  const values = Array.isArray(object[config.key]) ? object[config.key] : [];
  const rows = values.map((value, index) => `<div class="repeat-row"><input value="${escapeHtml(value)}" data-list-object="${objectId}" data-list-key="${config.key}" data-list-index="${index}"><button class="icon-button danger" type="button" data-list-remove="${objectId}" data-list-key="${config.key}" data-list-index="${index}" aria-label="删除">×</button></div>`).join("");
  return `<div class="repeater">${rows}<button class="mini-button" type="button" data-list-add="${objectId}" data-list-key="${config.key}" data-list-type="string">＋ 添加一项</button></div>`;
};

const renderObjectList = (object, config, objectId) => {
  const values = Array.isArray(object[config.key]) ? object[config.key] : [];
  const rows = values.map((item, index) => {
    const itemId = register(item);
    const inputs = config.itemFields.map((itemField) => `<input placeholder="${escapeHtml(itemField.label)}" value="${escapeHtml(item[itemField.key])}" data-object="${itemId}" data-key="${itemField.key}">`).join("");
    return `<div class="repeat-row">${inputs}<button class="icon-button danger" type="button" data-list-remove="${objectId}" data-list-key="${config.key}" data-list-index="${index}" aria-label="删除">×</button></div>`;
  }).join("");
  return `<div class="repeater">${rows}<button class="mini-button" type="button" data-list-add="${objectId}" data-list-key="${config.key}" data-list-type="object" data-list-fields="${escapeHtml(config.itemFields.map((item) => item.key).join(","))}">＋ 添加一项</button></div>`;
};

const renderField = (object, config, objectId) => {
  const value = object[config.key] ?? (config.type === "boolean" ? false : "");
  const wide = config.wide || ["textarea", "media", "string-list", "object-list"].includes(config.type);
  let control = "";
  if (config.type === "boolean") {
    control = `<label class="toggle"><input type="checkbox" data-object="${objectId}" data-key="${config.key}"${value ? " checked" : ""}><span>${value ? "已开启" : "已关闭"}</span></label>`;
  } else if (config.type === "textarea") {
    control = `<textarea data-object="${objectId}" data-key="${config.key}">${escapeHtml(value)}</textarea>`;
  } else if (config.type === "select") {
    control = `<select data-object="${objectId}" data-key="${config.key}">${optionHtml(config.options || [], value)}</select>`;
  } else if (config.type === "number") {
    control = `<input type="number" data-object="${objectId}" data-key="${config.key}" value="${escapeHtml(value)}">`;
  } else if (config.type === "string-list") {
    control = renderStringList(object, config, objectId);
  } else if (config.type === "object-list") {
    control = renderObjectList(object, config, objectId);
  } else if (config.type === "media") {
    const isImage = config.mediaKind === "image";
    const preview = value && isImage ? `<img src="${escapeHtml(value)}" alt="">` : `<span>${value ? "已选择" : "暂无文件"}</span>`;
    const accept = isImage ? "image/*" : "video/mp4,video/webm,video/quicktime";
    control = `<div class="media-control"><div class="media-preview">${preview}</div><input data-object="${objectId}" data-key="${config.key}" value="${escapeHtml(value)}" placeholder="上传后自动填写，也可以粘贴 /media/ 路径"><button class="upload-button" type="button" data-upload-button="${objectId}" data-upload-key="${config.key}">上传${isImage ? "图片" : "视频"}</button><input class="file-input" type="file" accept="${accept}" data-upload-input="${objectId}" data-upload-key="${config.key}" hidden></div>`;
  } else {
    control = `<input type="text" data-object="${objectId}" data-key="${config.key}" value="${escapeHtml(value)}">`;
  }
  return `<div class="field${wide ? " is-wide" : ""}"><span>${escapeHtml(config.label)}</span>${control}${config.help ? `<small>${escapeHtml(config.help)}</small>` : ""}</div>`;
};

const renderFields = (object, fields) => {
  const objectId = register(object);
  return `<div class="field-grid">${fields.map((config) => renderField(object, config, objectId)).join("")}</div>`;
};

const renderOverview = () => {
  const panels = SITE_PANELS.map((panel) => {
    if (panel.rootList) {
      const wrapper = { items: model.site[panel.key] || [] };
      model.site[panel.key] = wrapper.items;
      return `<article class="panel"><div class="panel-head"><div><h3>${panel.title}</h3></div></div><div class="panel-body">${renderFields(wrapper, [field("items", panel.title, "object-list", { wide: true, itemFields: panel.itemFields })])}</div></article>`;
    }
    model.site[panel.key] ||= {};
    return `<article class="panel"><div class="panel-head"><div><h3>${panel.title}</h3></div></div><div class="panel-body">${renderFields(model.site[panel.key], panel.fields)}</div></article>`;
  }).join("");
  return `<div class="editor-intro"><div><h2>全站设置</h2><p>修改姓名、搜索摘要、颜色、宽度、社交链接和页脚。</p></div></div>${panels}`;
};

const renderSections = () => {
  const sections = Array.isArray(model.site.sections) ? model.site.sections : (model.site.sections = []);
  const cards = sections.map((section, index) => {
    const schema = SECTION_SCHEMAS[section.type] || { label: section.type || "未知板块", fields: commonSectionFields };
    return `<details class="entry"><summary><div class="entry-title"><strong>${escapeHtml(schema.label)}</strong><small>${escapeHtml(section.heading || section.nav_label || section.type)}</small></div><span class="entry-status${section.visible ? "" : " is-hidden"}">${section.visible ? "显示中" : "已隐藏"}</span></summary><div class="entry-body">${renderFields(section, schema.fields)}<div class="entry-actions"><div><button class="mini-button" type="button" data-move-section="${index}" data-direction="-1">↑ 上移</button><button class="mini-button" type="button" data-move-section="${index}" data-direction="1">↓ 下移</button></div><button class="mini-button" type="button" data-duplicate-section="${index}">复制板块</button></div></div></details>`;
  }).join("");
  const choices = Object.entries(SECTION_SCHEMAS).map(([key, schema]) => `<option value="${key}">${schema.label}</option>`).join("");
  return `<div class="editor-intro"><div><h2>页面板块与排版</h2><p>拖动逻辑用“上移/下移”完成；隐藏板块不会在前台显示。</p></div><div><select id="new-section-type" class="mini-button">${choices}</select> <button id="add-section" class="button button-dark" type="button">新增板块</button></div></div>${cards || '<div class="empty-box">还没有页面板块</div>'}`;
};

const defaultSection = (type) => {
  const defaults = {
    hero: { type, visible: true, show_in_nav: true, nav_label: "首页", heading: "新的首屏标题", description: "填写首屏介绍", media_type: "image", image: "", layout: "split" },
    marquee: { type, visible: true, show_in_nav: false, items: ["NEW STORY", "HENRY QIAN"] },
    story: { type, visible: false, show_in_nav: false, nav_label: "介绍", anchor: `story-${Date.now().toString().slice(-5)}`, heading: "新的介绍板块", description: "填写一段醒目的介绍", body: "填写详细正文", media_type: "image", image: "", layout: "media-left", tone: "mist" },
  };
  return defaults[type] || { type, visible: false, show_in_nav: false, nav_label: SECTION_SCHEMAS[type]?.label || type, number: "00", eyebrow: "NEW SECTION", heading: `新的${SECTION_SCHEMAS[type]?.label || "板块"}`, description: "填写板块介绍", tone: "white", limit: 6 };
};

const renderCollection = (name) => {
  const schema = COLLECTION_SCHEMAS[name];
  const items = model.collections[name] || (model.collections[name] = []);
  const cards = items.map((item, index) => `<details class="entry"><summary><div class="entry-title"><strong>${escapeHtml(item.title || `未命名${schema.singular}`)}</strong><small>${escapeHtml([item.category, item.year, item.status].filter(Boolean).join(" · ") || item._filename || "新项目")}</small></div><span class="entry-status${item.visible ? "" : " is-hidden"}">${item.visible ? "显示中" : "已隐藏"}</span></summary><div class="entry-body">${renderFields(item, schema.fields)}<div class="entry-actions"><div><button class="mini-button" type="button" data-move-item="${index}" data-collection="${name}" data-direction="-1">↑ 上移</button><button class="mini-button" type="button" data-move-item="${index}" data-collection="${name}" data-direction="1">↓ 下移</button></div><button class="mini-button" type="button" data-delete-item="${index}" data-collection="${name}">删除</button></div></div></details>`).join("");
  return `<div class="editor-intro"><div><h2>${schema.label}</h2><p>可以新增、删除、排序并控制是否在网页显示。</p></div><button class="button button-dark" type="button" data-add-item="${name}">＋ 新增${schema.singular}</button></div>${cards || `<div class="empty-box">还没有${schema.label}，点击右上角开始添加。</div>`}`;
};

const renderCurrent = () => {
  registry = new Map();
  registryCounter = 0;
  $("#page-title").textContent = NAV_ITEMS.find(([key]) => key === currentPage)?.[1] || "网站后台";
  $("#editor").innerHTML = currentPage === "overview" ? renderOverview() : currentPage === "sections" ? renderSections() : renderCollection(currentPage);
  bindEditorEvents();
};

const updateObjectValue = (input) => {
  const object = registry.get(input.dataset.object);
  if (!object) return;
  const key = input.dataset.key;
  object[key] = input.type === "checkbox" ? input.checked : input.type === "number" ? (input.value === "" ? "" : Number(input.value)) : input.value;
  if (input.type === "checkbox") {
    const label = input.closest(".toggle")?.querySelector("span");
    if (label) label.textContent = input.checked ? "已开启" : "已关闭";
  }
  setDirty();
};

const uploadFile = async (input) => {
  const file = input.files?.[0];
  if (!file) return;
  if (file.size > 4 * 1024 * 1024) return toast("单个文件不能超过 4 MB；大视频请填写外部链接。", true);
  const object = registry.get(input.dataset.uploadInput);
  const key = input.dataset.uploadKey;
  if (!object) return;
  toast("正在上传文件……");
  try {
    const dataUrl = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(file); });
    const contentBase64 = String(dataUrl).split(",")[1];
    const result = await api("upload", { method: "POST", body: JSON.stringify({ filename: file.name, mimeType: file.type, contentBase64 }) });
    object[key] = result.path;
    setDirty();
    renderCurrent();
    toast("上传完成。请点击“保存并发布”把图片用于当前内容。 ");
  } catch (error) { toast(error.message, true); }
};

const bindEditorEvents = () => {
  $$('[data-object][data-key]', $("#editor")).forEach((input) => input.addEventListener(input.type === "checkbox" || input.tagName === "SELECT" ? "change" : "input", () => updateObjectValue(input)));
  $$('[data-list-object]', $("#editor")).forEach((input) => input.addEventListener("input", () => {
    const object = registry.get(input.dataset.listObject); if (!object) return;
    object[input.dataset.listKey][Number(input.dataset.listIndex)] = input.value; setDirty();
  }));
  $$('[data-list-add]', $("#editor")).forEach((button) => button.addEventListener("click", () => {
    const object = registry.get(button.dataset.listAdd); if (!object) return;
    const key = button.dataset.listKey; object[key] ||= [];
    const fields = (button.dataset.listFields || "").split(",").filter(Boolean);
    object[key].push(button.dataset.listType === "object" ? Object.fromEntries(fields.map((name) => [name, ""])) : "");
    setDirty(); renderCurrent();
  }));
  $$('[data-list-remove]', $("#editor")).forEach((button) => button.addEventListener("click", () => {
    const object = registry.get(button.dataset.listRemove); if (!object) return;
    object[button.dataset.listKey].splice(Number(button.dataset.listIndex), 1); setDirty(); renderCurrent();
  }));
  $$('[data-upload-button]', $("#editor")).forEach((button) => button.addEventListener("click", () => $(`[data-upload-input="${button.dataset.uploadButton}"][data-upload-key="${button.dataset.uploadKey}"]`, $("#editor"))?.click()));
  $$('[data-upload-input]', $("#editor")).forEach((input) => input.addEventListener("change", () => uploadFile(input)));
  $$('[data-move-section]', $("#editor")).forEach((button) => button.addEventListener("click", () => {
    const from = Number(button.dataset.moveSection); const to = from + Number(button.dataset.direction);
    if (to < 0 || to >= model.site.sections.length) return;
    [model.site.sections[from], model.site.sections[to]] = [model.site.sections[to], model.site.sections[from]]; setDirty(); renderCurrent();
  }));
  $$('[data-duplicate-section]', $("#editor")).forEach((button) => button.addEventListener("click", () => {
    const index = Number(button.dataset.duplicateSection); const duplicate = clone(model.site.sections[index]);
    if (duplicate.anchor) duplicate.anchor = `${duplicate.anchor}-${Date.now().toString().slice(-4)}`;
    duplicate.visible = false; model.site.sections.splice(index + 1, 0, duplicate); setDirty(); renderCurrent();
  }));
  $("#add-section")?.addEventListener("click", () => { const type = $("#new-section-type").value; model.site.sections.push(defaultSection(type)); setDirty(); renderCurrent(); });
  $$('[data-add-item]', $("#editor")).forEach((button) => button.addEventListener("click", () => {
    const name = button.dataset.addItem; const schema = COLLECTION_SCHEMAS[name];
    model.collections[name].push({ title: `新的${schema.singular}`, order: model.collections[name].length + 1, visible: false, _path: `content/${name}/item-${Date.now()}.json`, _filename: `item-${Date.now()}.json` });
    setDirty(); renderCurrent();
  }));
  $$('[data-move-item]', $("#editor")).forEach((button) => button.addEventListener("click", () => {
    const list = model.collections[button.dataset.collection]; const from = Number(button.dataset.moveItem); const to = from + Number(button.dataset.direction);
    if (to < 0 || to >= list.length) return; [list[from], list[to]] = [list[to], list[from]];
    list.forEach((item, index) => { item.order = index + 1; }); setDirty(); renderCurrent();
  }));
  $$('[data-delete-item]', $("#editor")).forEach((button) => button.addEventListener("click", () => {
    const name = button.dataset.collection; const index = Number(button.dataset.deleteItem); const item = model.collections[name][index];
    if (!confirm(`确定删除“${item.title || "这个项目"}”吗？保存后将从 GitHub 删除。`)) return;
    if (item._path) deletedPaths.add(item._path); model.collections[name].splice(index, 1); setDirty(); renderCurrent();
  }));
};

const stripMeta = (item) => Object.fromEntries(Object.entries(item).filter(([key]) => !key.startsWith("_")));
const serializableFiles = () => {
  const files = { "content/site.json": `${JSON.stringify(model.site, null, 2)}\n` };
  Object.entries(model.collections).forEach(([name, items]) => items.forEach((item) => { files[item._path] = `${JSON.stringify(stripMeta(item), null, 2)}\n`; }));
  return files;
};

const snapshot = () => JSON.stringify({ files: serializableFiles(), deleted: [...deletedPaths].sort() });

const save = async () => {
  if (!dirty) return toast("当前没有需要保存的修改。");
  const button = $("#save-button"); const state = $("#save-state");
  button.disabled = true; state.textContent = "正在保存…"; state.className = "save-state is-saving";
  try {
    const files = serializableFiles();
    const result = await api("save", { method: "POST", body: JSON.stringify({ files, deletePaths: [...deletedPaths], message: "通过自建后台更新网站内容" }) });
    deletedPaths.clear(); baseline = snapshot(); setDirty(false);
    toast(`保存成功，Netlify 正在自动发布。版本 ${result.sha.slice(0, 7)}`);
  } catch (error) {
    setDirty(true); toast(error.message, true);
  } finally { button.disabled = false; }
};

const renderNav = () => {
  $("#admin-nav").innerHTML = NAV_ITEMS.map(([key, label], index) => `<button class="nav-button${key === currentPage ? " is-active" : ""}" type="button" data-page="${key}"><span>${label}</span><small>${String(index + 1).padStart(2, "0")}</small></button>`).join("");
  $$('[data-page]', $("#admin-nav")).forEach((button) => button.addEventListener("click", () => { currentPage = button.dataset.page; renderNav(); renderCurrent(); window.scrollTo({ top: 0, behavior: "smooth" }); }));
};

const show = (name) => ["login-view", "setup-view", "admin-view"].forEach((id) => { $(`#${id}`).hidden = id !== name; });

const loadContent = async () => {
  $("#editor").innerHTML = '<div class="empty-box">正在读取 GitHub 内容……</div>';
  try {
    model = await api("content");
    $("#repo-label").textContent = `${model.repository} · ${model.branch}`;
    deletedPaths.clear(); baseline = snapshot(); setDirty(false); renderNav(); renderCurrent();
  } catch (error) { $("#editor").innerHTML = `<div class="empty-box">${escapeHtml(error.message)}</div>`; toast(error.message, true); }
};

$("#login-form").addEventListener("submit", async (event) => {
  event.preventDefault(); const message = $("#login-message"); message.textContent = "正在登录……";
  try { await api("login", { method: "POST", body: JSON.stringify({ password: $("#password").value }) }); show("admin-view"); await loadContent(); }
  catch (error) { message.textContent = error.message; }
});

$("#logout-button").addEventListener("click", async () => { try { await api("logout", { method: "POST", body: "{}" }); } finally { model = null; show("login-view"); } });
$("#save-button").addEventListener("click", save);
window.addEventListener("beforeunload", (event) => { if (!dirty) return; event.preventDefault(); event.returnValue = ""; });

(async () => {
  try {
    const status = await api("status");
    if (!status.configured) return show("setup-view");
    if (!status.authenticated) return show("login-view");
    show("admin-view"); await loadContent();
  } catch (error) { show("login-view"); $("#login-message").textContent = `后台接口暂时不可用：${error.message}`; }
})();
