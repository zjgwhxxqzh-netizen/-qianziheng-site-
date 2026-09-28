# 钱子恒网站：可视化编辑版

这个文件夹是网站的完整源码。`dist/` 是构建生成的网页；编辑内容请使用 Pages CMS，不要编辑 `dist/`。

## 第一次连接（只做一次）

1. 登录 GitHub，新建一个仓库（建议命名 `qianziheng-site`）。把本压缩包**解压后的所有文件和文件夹**上传到仓库根目录，包括 `.pages.yml`。GitHub 不会把单个 ZIP 当作网站源码来自动解压。
2. 回到**现有的** Netlify 网站项目，打开 **Project configuration → Developer settings → Continuous deployment → Repository → Link repository**，选择上一步的 GitHub 仓库。不要另外创建 Netlify 网站，否则现有域名需要重新迁移。
3. 检查 Netlify 的构建设置：Build command 为 `python3 build.py`，Publish directory 为 `dist`。仓库根目录的 `netlify.toml` 已填写这两项；若界面提示填写，请照此输入。等首次构建显示 Published。
4. 打开 https://app.pagescms.org ，用**同一个 GitHub 账户**登录，授权 Pages CMS 访问这个仓库，并选中 `qianziheng-site`。编辑菜单会出现「摄影作品」「课程教学」「学术成果」「首页与简介」。

## 以后怎样更新

- 摄影：点「摄影作品 → 新建」，填写标题、分类、照片和说明，然后保存。第一次上传真实照片后，首页的示意摄影卡片会被真实作品替换。
- 教学或学术：进入对应栏目，添加或修改卡片；链接可留空。
- 修改个人介绍：进入「首页与简介」。
- 保存后，Pages CMS 会写入 GitHub；Netlify 随即自动构建并发布。通常等部署完成后刷新 `https://qianziheng.me` 就能看见更新。

## 注意

- 原始摄影作品目前未提供，页面仍是分类示意。上传你自己的照片后才会出现真实图像。
- 图片直接存放在你的 GitHub 仓库，建议上传压缩过的 JPG/WebP，单张尽量控制在 2 MB 左右，避免网站变慢或仓库膨胀。
- GitHub 仓库如果设为公开，上传的图片和网站源码也会公开。不要上传个人证件、学生资料或未获授权的照片。
- “Python 小程序”目前保留原来的 IPO 计算演示。如果之后要放可运行的 Python 程序，需要针对各程序再接运行环境；纯静态网页不能执行服务器端 Python。
- `qianziheng.me` 和阿里云 DNS 不需要再次修改；仓库接入的是现有 Netlify 项目。

## 本地预览（可选）

安装 Python 3 后，在项目根目录执行 `python3 build.py`，打开 `dist/index.html` 即可预览。无需安装第三方 Python 包。
