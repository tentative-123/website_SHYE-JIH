import { defineConfig } from "tinacms";
import { BilingualField } from "./fields/BilingualField";
import { CloudinaryImageField } from "./fields/CloudinaryImageField";

const branch = process.env.TINA_BRANCH || process.env.VERCEL_GIT_COMMIT_REF || process.env.HEAD || "main";

const bilingualField = (name: string, label: string, multiline = false) => ({
  type: "object",
  name,
  label,
  fields: [
    { type: "string", name: "zh", label: "中文" },
    { type: "string", name: "en", label: "English" }
  ],
  ui: {
    component: "bilingual",
    multiline
  }
});

const imageField = (name: string, label: string) => ({
  type: "object",
  name,
  label,
  fields: [
    { type: "string", name: "url", label: "Image URL" },
    {
      type: "object",
      name: "alt",
      label: "Alt Text",
      fields: [
        { type: "string", name: "zh", label: "中文" },
        { type: "string", name: "en", label: "English" }
      ],
      ui: { component: "bilingual" }
    },
    {
      type: "object",
      name: "caption",
      label: "Caption",
      fields: [
        { type: "string", name: "zh", label: "中文" },
        { type: "string", name: "en", label: "English" }
      ],
      ui: { component: "bilingual", multiline: true }
    }
  ],
  ui: { component: "cloudinaryImage" }
});

export default defineConfig({
  branch,
  clientId: process.env.TINA_PUBLIC_CLIENT_ID || "",
  token: process.env.TINA_TOKEN || "",
  build: {
    outputFolder: "admin",
    publicFolder: "public"
  },
  ui: {
    components: {
      fields: {
        bilingual: BilingualField,
        cloudinaryImage: CloudinaryImageField
      }
    }
  },
  cmsCallback: (cms) => {
    if (typeof window === "undefined") {
      return;
    }

    const focusField = (fieldPath: string) => {
      const selector = `input[name*="${fieldPath}"], textarea[name*="${fieldPath}"]`;
      const target = document.querySelector(selector) as HTMLInputElement | HTMLTextAreaElement | null;
      if (!target) {
        return;
      }

      target.scrollIntoView({ behavior: "smooth", block: "center" });
      target.focus();
    };

    const syncPreview = (fieldPath: string, value: string) => {
      const previewFrame = document.querySelector('iframe[src*="cmsPreview=1"]') as HTMLIFrameElement | null;
      if (!previewFrame?.contentWindow) {
        return;
      }

      previewFrame.contentWindow.postMessage(
        {
          type: "cms-preview-patch",
          field: fieldPath,
          value
        },
        "*"
      );
    };

    window.addEventListener("message", (event) => {
      if (event.data?.type !== "cms-focus-field" || !event.data?.field) {
        return;
      }

      focusField(event.data.field);
    });

    document.addEventListener("input", (event) => {
      const target = event.target as HTMLInputElement | HTMLTextAreaElement | null;
      if (!target?.name) {
        return;
      }

      const path = target.name.replace(/^.*?(site|home|about|products|technology|quality|contact|navigation)\./, "$1.");
      const normalized = path.replace(/\.(zh|en)$/, "");

      if (normalized === path) {
        return;
      }

      syncPreview(normalized, target.value);
    });
  },
  schema: {
    collections: [
      {
        label: "Website Content",
        name: "siteContent",
        path: "src/content",
        format: "json",
        match: {
          include: "site-content"
        },
        ui: {
          allowedActions: {
            create: false,
            delete: false
          },
          router: () => "/zh/?cmsPreview=1",
          beforeSubmit: async ({ values }) => {
            if (typeof window !== "undefined") {
              window.alert("網站更新已送出，伺服器編譯約需 1~2 分鐘，請耐心等候，請勿重複點擊。");
            }
            return values;
          }
        },
        fields: [
          {
            type: "object",
            name: "site",
            label: "全站資訊",
            fields: [
              bilingualField("companyName", "公司簡稱"),
              bilingualField("companyNameFull", "公司全名"),
              bilingualField("englishName", "英文副標"),
              bilingualField("footerText", "頁尾文字", true),
              imageField("logo", "Logo")
            ]
          },
          {
            type: "object",
            name: "navigation",
            label: "導覽列",
            fields: [
              bilingualField("home", "首頁"),
              bilingualField("about", "服務項目"),
              bilingualField("products", "服務客戶"),
              bilingualField("technology", "機台設備"),
              bilingualField("quality", "品質認證"),
              bilingualField("contact", "聯絡我們")
            ]
          },
          {
            type: "object",
            name: "home",
            label: "首頁",
            fields: [
              bilingualField("metaTitle", "SEO 標題"),
              bilingualField("metaDescription", "SEO 描述", true),
              bilingualField("eyebrow", "小標"),
              bilingualField("heroTitle", "主標", true),
              bilingualField("heroDescription", "主敘述", true),
              bilingualField("primaryButton", "主按鈕"),
              bilingualField("secondaryButton", "次按鈕"),
              imageField("heroImage", "首頁主視覺圖"),
              {
                type: "object",
                name: "highlights",
                label: "三大亮點",
                list: true,
                fields: [
                  bilingualField("title", "標題"),
                  bilingualField("description", "敘述", true)
                ]
              },
              bilingualField("featuredSectionLabel", "精選區塊小標"),
              bilingualField("featuredSectionTitle", "精選區塊標題", true),
              {
                type: "object",
                name: "featuredCards",
                label: "精選卡片",
                list: true,
                fields: [
                  imageField("image", "卡片圖片"),
                  bilingualField("title", "卡片標題"),
                  bilingualField("description", "卡片敘述", true),
                  bilingualField("linkText", "連結文字"),
                  { type: "string", name: "linkHref", label: "連結 URL" }
                ]
              },
              bilingualField("aboutSectionLabel", "工程能力小標"),
              bilingualField("aboutSectionTitle", "工程能力標題", true),
              bilingualField("aboutSectionDescription", "工程能力敘述", true),
              bilingualField("aboutButton", "工程能力按鈕"),
              imageField("aboutImage", "工程能力圖片")
            ]
          },
          {
            type: "object",
            name: "about",
            label: "服務項目頁",
            fields: [
              bilingualField("metaTitle", "SEO 標題"),
              bilingualField("metaDescription", "SEO 描述", true),
              bilingualField("eyebrow", "小標"),
              bilingualField("pageTitle", "主標", true),
              bilingualField("pageDescription", "敘述", true),
              imageField("heroImage", "主視覺"),
              {
                type: "object",
                name: "serviceCards",
                label: "服務卡片",
                list: true,
                fields: [
                  bilingualField("title", "標題"),
                  bilingualField("description", "敘述", true)
                ]
              },
              imageField("factoryImage", "工廠圖片"),
              imageField("teamImage", "團隊圖片"),
              bilingualField("timelineLabel", "時間軸小標"),
              bilingualField("timelineTitle", "時間軸標題", true),
              {
                type: "object",
                name: "timeline",
                label: "時間軸項目",
                list: true,
                fields: [
                  { type: "string", name: "index", label: "序號" },
                  bilingualField("description", "內容", true)
                ]
              }
            ]
          },
          {
            type: "object",
            name: "products",
            label: "服務客戶頁",
            fields: [
              bilingualField("metaTitle", "SEO 標題"),
              bilingualField("metaDescription", "SEO 描述", true),
              bilingualField("eyebrow", "小標"),
              bilingualField("pageTitle", "主標", true),
              bilingualField("pageDescription", "敘述", true),
              imageField("heroImage", "主視覺"),
              {
                type: "object",
                name: "productCards",
                label: "客戶卡片",
                list: true,
                fields: [
                  imageField("image", "卡片圖片"),
                  bilingualField("title", "標題"),
                  bilingualField("description", "敘述", true),
                  bilingualField("subtitle", "補充文字", true)
                ]
              },
              bilingualField("detailTitle", "實績標題"),
              bilingualField("detailDescription", "實績敘述", true),
              bilingualField("cooperationTitle", "合作特色標題"),
              bilingualField("cooperationDescription", "合作特色敘述", true),
              imageField("detailImage", "實績圖片")
            ]
          },
          {
            type: "object",
            name: "technology",
            label: "機台設備頁",
            fields: [
              bilingualField("metaTitle", "SEO 標題"),
              bilingualField("metaDescription", "SEO 描述", true),
              bilingualField("eyebrow", "小標"),
              bilingualField("pageTitle", "主標", true),
              bilingualField("pageDescription", "敘述", true),
              imageField("heroImage", "主視覺"),
              bilingualField("equipmentTitle", "設備標題"),
              {
                type: "object",
                name: "equipmentList",
                label: "設備清單",
                list: true,
                fields: [
                  { type: "string", name: "zh", label: "中文" },
                  { type: "string", name: "en", label: "English" }
                ],
                ui: { component: "bilingual" }
              },
              imageField("equipmentImageA", "設備圖片 A"),
              imageField("equipmentImageB", "設備圖片 B"),
              bilingualField("toolingTitle", "刀具標題"),
              bilingualField("toolingDescription", "刀具敘述", true),
              bilingualField("measurementTitle", "量測標題"),
              bilingualField("measurementDescription", "量測敘述", true),
              imageField("processImage", "製程圖片")
            ]
          },
          {
            type: "object",
            name: "quality",
            label: "品質認證頁",
            fields: [
              bilingualField("metaTitle", "SEO 標題"),
              bilingualField("metaDescription", "SEO 描述", true),
              bilingualField("eyebrow", "小標"),
              bilingualField("pageTitle", "主標", true),
              bilingualField("pageDescription", "敘述", true),
              imageField("heroImage", "主視覺"),
              imageField("certImage", "證書圖片"),
              bilingualField("certTitle", "認證標題"),
              {
                type: "object",
                name: "certItems",
                label: "認證項目",
                list: true,
                fields: [
                  { type: "string", name: "zh", label: "中文" },
                  { type: "string", name: "en", label: "English" }
                ],
                ui: { component: "bilingual" }
              },
              bilingualField("inspectionTitle", "檢驗標題"),
              {
                type: "object",
                name: "inspectionItems",
                label: "檢驗項目",
                list: true,
                fields: [
                  { type: "string", name: "zh", label: "中文" },
                  { type: "string", name: "en", label: "English" }
                ],
                ui: { component: "bilingual" }
              },
              imageField("measureImage", "量測圖片"),
              bilingualField("measureTitle", "量測標題"),
              {
                type: "object",
                name: "measureItems",
                label: "量測項目",
                list: true,
                fields: [
                  { type: "string", name: "zh", label: "中文" },
                  { type: "string", name: "en", label: "English" }
                ],
                ui: { component: "bilingual" }
              }
            ]
          },
          {
            type: "object",
            name: "contact",
            label: "聯絡我們頁",
            fields: [
              bilingualField("metaTitle", "SEO 標題"),
              bilingualField("metaDescription", "SEO 描述", true),
              bilingualField("eyebrow", "小標"),
              bilingualField("pageTitle", "主標", true),
              bilingualField("pageDescription", "敘述", true),
              imageField("heroImage", "主視覺"),
              bilingualField("infoTitle", "聯絡區標題"),
              bilingualField("companyLabel", "公司標籤"),
              bilingualField("companyValue", "公司內容"),
              bilingualField("taxIdLabel", "統編標籤"),
              { type: "string", name: "taxIdValue", label: "統編內容" },
              bilingualField("contactPersonLabel", "聯絡人標籤"),
              bilingualField("contactPersonValue", "聯絡人內容"),
              bilingualField("phoneLabel", "電話標籤"),
              bilingualField("phoneValue", "電話內容"),
              bilingualField("faxLabel", "傳真標籤"),
              bilingualField("faxValue", "傳真內容"),
              bilingualField("addressLabel", "地址標籤"),
              bilingualField("addressValue", "地址內容"),
              bilingualField("emailLabel", "Email 標籤"),
              { type: "string", name: "emailValue", label: "Email 內容" },
              bilingualField("mapLabel", "地圖標籤"),
              bilingualField("mapText", "地圖連結文字"),
              { type: "string", name: "mapHref", label: "地圖 URL" },
              imageField("mapImage", "地圖圖片"),
              {
                type: "object",
                name: "form",
                label: "聯絡表單",
                fields: [
                  {
                    type: "object",
                    name: "company",
                    label: "公司欄位",
                    fields: [bilingualField("label", "標籤"), bilingualField("placeholder", "Placeholder")]
                  },
                  {
                    type: "object",
                    name: "name",
                    label: "姓名欄位",
                    fields: [bilingualField("label", "標籤"), bilingualField("placeholder", "Placeholder")]
                  },
                  {
                    type: "object",
                    name: "email",
                    label: "Email 欄位",
                    fields: [bilingualField("label", "標籤"), bilingualField("placeholder", "Placeholder")]
                  },
                  {
                    type: "object",
                    name: "product",
                    label: "需求欄位",
                    fields: [bilingualField("label", "標籤"), bilingualField("placeholder", "Placeholder")]
                  },
                  {
                    type: "object",
                    name: "volume",
                    label: "規格欄位",
                    fields: [bilingualField("label", "標籤"), bilingualField("placeholder", "Placeholder")]
                  },
                  {
                    type: "object",
                    name: "message",
                    label: "補充說明欄位",
                    fields: [
                      bilingualField("label", "標籤"),
                      bilingualField("placeholder", "Placeholder", true)
                    ]
                  },
                  bilingualField("submit", "送出按鈕"),
                  bilingualField("alert", "送出提醒", true)
                ]
              }
            ]
          }
        ]
      }
    ]
  }
});
