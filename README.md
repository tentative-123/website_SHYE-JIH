# Astro + TinaCMS + Cloudinary + Cloudflare Pages

這份資料夾是你原網站的重構版本，目標架構如下：

- 前端框架：Astro（全靜態輸出）
- CMS：TinaCMS（Git-based）
- 圖片：Cloudinary（拖曳/點選上傳）
- 部署：Cloudflare Pages（接 GitHub 自動編譯）

## 已完成內容

1. 保留原版型（`styles.css` + 原 class 結構）並改為 Astro 路由
   - `src/pages/[lang]/index.astro`
   - `src/pages/[lang]/about.astro`
   - `src/pages/[lang]/products.astro`
   - `src/pages/[lang]/technology.astro`
   - `src/pages/[lang]/quality.astro`
   - `src/pages/[lang]/contact.astro`

2. 多語系內容模型（中/英）
   - `src/content/site-content.json`

3. TinaCMS Schema + 自訂欄位
   - `tina/config.ts`
   - `tina/fields/BilingualField.tsx`（中英雙欄 + Google 翻譯按鈕）
   - `tina/fields/CloudinaryImageField.tsx`（Drag & Drop / 檔案選擇 + 上傳 Cloudinary）

4. 預覽互動橋接（Contextual Editing 基礎）
   - 前台元素皆帶 `data-cms-field`
   - `public/site.js` 會在 `?cmsPreview=1` 模式下把點擊欄位回傳後台
   - `tina/config.ts` 的 `cmsCallback` 會嘗試聚焦對應欄位，並把輸入 patch 到預覽 iframe

5. 翻譯 API（Cloudflare Functions）
   - `functions/api/translate.ts`

6. 發布提示
   - Tina `beforeSubmit` 顯示防重複點擊提示訊息（發布後提醒等待 1~2 分鐘）

## 你要補的環境變數

請依 `.env.example` 填：

- `TINA_PUBLIC_CLIENT_ID`
- `TINA_TOKEN`
- `TINA_BRANCH`
- `PUBLIC_CLOUDINARY_CLOUD_NAME`
- `PUBLIC_CLOUDINARY_UPLOAD_PRESET`
- `GOOGLE_TRANSLATE_API_KEY`

## 本機開發

```bash
npm install
npm run tina:dev
```

## 建置

```bash
npm run build
```

## Cloudflare Pages 建議設定

- Build command: `npm run build`
- Build output directory: `dist`
- Functions directory: `functions`

## 說明

- 目前的發布行為是 Tina 的單次 Save/Commit 模式，符合「集中發布」流程。
- 右側預覽 + 左側編輯、點擊元素聚焦欄位邏輯已放入橋接機制；部署後若 Tina UI 版本 class/name 有差異，可能只需微調 `tina/config.ts` 裡 `cmsCallback` 的 selector。
