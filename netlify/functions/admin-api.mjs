import crypto from "node:crypto";

const OWNER = process.env.GITHUB_OWNER || "zjgwhxxqzh-netizen";
const REPO = process.env.GITHUB_REPO || "-qianziheng-site-";
const BRANCH = process.env.GITHUB_BRANCH || "main";
const TOKEN = process.env.GITHUB_TOKEN || "";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || "";
const COOKIE_NAME = "henry_admin_session";
const COLLECTIONS = ["photos", "videos", "courses", "research", "apps"];
const ALLOWED_MEDIA = new Set(["jpg", "jpeg", "png", "webp", "gif", "svg", "mp4", "webm", "mov", "ogv", "pdf"]);

const json = (data, status = 200, extraHeaders = {}) => new Response(JSON.stringify(data), {
  status,
  headers: {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
    ...extraHeaders,
  },
});

const safeEqual = (left, right) => {
  const a = Buffer.from(String(left));
  const b = Buffer.from(String(right));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};

const sign = (value) => crypto.createHmac("sha256", SESSION_SECRET).update(value).digest("base64url");

const createSession = () => {
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + 12 * 60 * 60 * 1000 })).toString("base64url");
  return `${payload}.${sign(payload)}`;
};

const parseCookies = (request) => Object.fromEntries(
  (request.headers.get("cookie") || "")
    .split(";")
    .map((item) => item.trim().split(/=(.*)/s).slice(0, 2))
    .filter(([key]) => key),
);

const hasSession = (request) => {
  if (!SESSION_SECRET) return false;
  const token = parseCookies(request)[COOKIE_NAME] || "";
  const [payload, signature] = token.split(".");
  if (!payload || !signature || !safeEqual(sign(payload), signature)) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return Number(data.exp) > Date.now();
  } catch {
    return false;
  }
};

const sameOrigin = (request) => {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
};

const github = async (path, options = {}) => {
  if (!TOKEN) throw new Error("服务器尚未配置 GITHUB_TOKEN");
  const response = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}${path}`, {
    ...options,
    headers: {
      accept: "application/vnd.github+json",
      authorization: `Bearer ${TOKEN}`,
      "x-github-api-version": "2022-11-28",
      "user-agent": "henry-qian-site-admin",
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  let body = {};
  try { body = text ? JSON.parse(text) : {}; } catch { body = { message: text }; }
  if (!response.ok) throw new Error(body.message || `GitHub 请求失败（${response.status}）`);
  return body;
};

const decodeGithubContent = (file) => Buffer.from(String(file.content || "").replace(/\n/g, ""), "base64").toString("utf8");

const readJsonFile = async (path) => {
  const file = await github(`/contents/${encodeURIComponent(path).replace(/%2F/g, "/")}?ref=${encodeURIComponent(BRANCH)}`);
  return { value: JSON.parse(decodeGithubContent(file)), raw: decodeGithubContent(file), sha: file.sha };
};

const readCollection = async (name) => {
  const folder = `content/${name}`;
  let entries = [];
  try {
    entries = await github(`/contents/${folder}?ref=${encodeURIComponent(BRANCH)}`);
  } catch (error) {
    if (String(error.message).includes("Not Found")) return [];
    throw error;
  }
  const files = entries.filter((entry) => entry.type === "file" && entry.name.endsWith(".json"));
  return Promise.all(files.map(async (entry) => {
    const detail = await github(`/contents/${entry.path}?ref=${encodeURIComponent(BRANCH)}`);
    return { ...JSON.parse(decodeGithubContent(detail)), _path: entry.path, _filename: entry.name };
  }));
};

const validContentPath = (path) => {
  if (path === "content/site.json") return true;
  return /^content\/(photos|videos|courses|research|apps)\/[a-zA-Z0-9._-]+\.json$/.test(path);
};

const commitTree = async ({ files = {}, deletePaths = [], message }) => {
  const paths = Object.keys(files);
  if (!paths.length && !deletePaths.length) throw new Error("没有需要保存的修改");
  if (![...paths, ...deletePaths].every(validContentPath)) throw new Error("包含不允许修改的文件路径");
  const ref = await github(`/git/ref/heads/${encodeURIComponent(BRANCH)}`);
  const parentSha = ref.object.sha;
  const parent = await github(`/git/commits/${parentSha}`);
  const blobs = await Promise.all(paths.map(async (path) => {
    const value = files[path];
    if (typeof value !== "string") throw new Error(`${path} 的内容格式不正确`);
    JSON.parse(value);
    const blob = await github("/git/blobs", {
      method: "POST",
      body: JSON.stringify({ content: value, encoding: "utf-8" }),
    });
    return { path, mode: "100644", type: "blob", sha: blob.sha };
  }));
  const treeEntries = [...blobs, ...deletePaths.map((path) => ({ path, mode: "100644", type: "blob", sha: null }))];
  const tree = await github("/git/trees", {
    method: "POST",
    body: JSON.stringify({ base_tree: parent.tree.sha, tree: treeEntries }),
  });
  const commit = await github("/git/commits", {
    method: "POST",
    body: JSON.stringify({
      message: String(message || "通过网站后台更新内容").slice(0, 120),
      tree: tree.sha,
      parents: [parentSha],
    }),
  });
  await github(`/git/refs/heads/${encodeURIComponent(BRANCH)}`, {
    method: "PATCH",
    body: JSON.stringify({ sha: commit.sha, force: false }),
  });
  return commit.sha;
};

const uploadMedia = async ({ filename, mimeType, contentBase64 }) => {
  const extension = String(filename || "").split(".").pop().toLowerCase();
  if (!ALLOWED_MEDIA.has(extension)) throw new Error("不支持该文件格式");
  const content = String(contentBase64 || "");
  const size = Buffer.byteLength(content, "base64");
  if (!content || size < 1 || size > 4 * 1024 * 1024) throw new Error("单个上传文件需小于 4 MB");
  if (mimeType && !/^(image|video|application)\//.test(String(mimeType))) throw new Error("文件类型不正确");
  const basename = String(filename || "upload")
    .replace(/\.[^.]+$/, "")
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "upload";
  const stamp = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
  const path = `media/${stamp}-${basename}.${extension}`;
  const ref = await github(`/git/ref/heads/${encodeURIComponent(BRANCH)}`);
  const parentSha = ref.object.sha;
  const parent = await github(`/git/commits/${parentSha}`);
  const blob = await github("/git/blobs", {
    method: "POST",
    body: JSON.stringify({ content, encoding: "base64" }),
  });
  const tree = await github("/git/trees", {
    method: "POST",
    body: JSON.stringify({ base_tree: parent.tree.sha, tree: [{ path, mode: "100644", type: "blob", sha: blob.sha }] }),
  });
  const commit = await github("/git/commits", {
    method: "POST",
    body: JSON.stringify({ message: `后台上传媒体：${filename}`, tree: tree.sha, parents: [parentSha] }),
  });
  await github(`/git/refs/heads/${encodeURIComponent(BRANCH)}`, {
    method: "PATCH",
    body: JSON.stringify({ sha: commit.sha, force: false }),
  });
  return { path: `/${path}`, sha: commit.sha };
};

export default async (request) => {
  try {
    const requestUrl = new URL(request.url);
    const action = requestUrl.searchParams.get("action")
      || requestUrl.pathname.split("/").filter(Boolean).pop()
      || "status";
    if (request.method !== "GET" && !sameOrigin(request)) return json({ error: "请求来源不正确" }, 403);

    if (action === "login" && request.method === "POST") {
      if (!ADMIN_PASSWORD || !SESSION_SECRET || !TOKEN) {
        return json({ error: "后台尚未完成服务器密钥配置" }, 503);
      }
      const body = await request.json();
      if (!safeEqual(body.password || "", ADMIN_PASSWORD)) return json({ error: "后台密码不正确" }, 401);
      const cookie = `${COOKIE_NAME}=${createSession()}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=43200`;
      return json({ ok: true }, 200, { "set-cookie": cookie });
    }

    if (action === "logout" && request.method === "POST") {
      return json({ ok: true }, 200, { "set-cookie": `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0` });
    }

    if (action === "status" && request.method === "GET") {
      return json({ authenticated: hasSession(request), configured: Boolean(ADMIN_PASSWORD && SESSION_SECRET && TOKEN) });
    }

    if (!hasSession(request)) return json({ error: "请先登录后台" }, 401);

    if (action === "content" && request.method === "GET") {
      const [site, ...collections] = await Promise.all([readJsonFile("content/site.json"), ...COLLECTIONS.map(readCollection)]);
      return json({
        site: site.value,
        collections: Object.fromEntries(COLLECTIONS.map((name, index) => [name, collections[index]])),
        repository: `${OWNER}/${REPO}`,
        branch: BRANCH,
      });
    }

    if (action === "save" && request.method === "POST") {
      const body = await request.json();
      const sha = await commitTree({ files: body.files, deletePaths: body.deletePaths, message: body.message });
      return json({ ok: true, sha });
    }

    if (action === "upload" && request.method === "POST") {
      const result = await uploadMedia(await request.json());
      return json({ ok: true, ...result });
    }

    return json({ error: "接口不存在" }, 404);
  } catch (error) {
    console.error(error);
    return json({ error: error instanceof Error ? error.message : "服务器发生未知错误" }, 500);
  }
};
