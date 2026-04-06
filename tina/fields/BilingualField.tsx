import React, { useMemo, useState } from "react";

type Props = {
  input: {
    value: { zh?: string; en?: string };
    onChange: (value: { zh: string; en: string }) => void;
  };
  field: {
    label?: string;
    ui?: {
      multiline?: boolean;
    };
  };
};

export const BilingualField = ({ input, field }: Props) => {
  const [isTranslating, setIsTranslating] = useState(false);
  const value = useMemo(() => ({ zh: input.value?.zh || "", en: input.value?.en || "" }), [input.value]);

  const updateZh = (zh: string) => input.onChange({ ...value, zh });
  const updateEn = (en: string) => input.onChange({ ...value, en });

  const translate = async () => {
    if (!value.zh.trim()) {
      return;
    }

    setIsTranslating(true);
    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: value.zh, source: "zh-TW", target: "en" })
      });

      if (!response.ok) {
        throw new Error("Translate API error");
      }

      const payload = await response.json();
      updateEn(payload.translatedText || value.en);
    } catch (error) {
      console.error(error);
      window.alert("翻譯失敗，請稍後再試或手動填寫英文欄位。");
    } finally {
      setIsTranslating(false);
    }
  };

  const multiline = field.ui?.multiline;

  return (
    <div style={{ display: "grid", gap: "12px" }}>
      <label style={{ display: "grid", gap: "6px" }}>
        <span style={{ fontWeight: 700 }}>{field.label || "欄位"}（中文）</span>
        {multiline ? (
          <textarea value={value.zh} rows={4} onChange={(event) => updateZh(event.target.value)} />
        ) : (
          <input type="text" value={value.zh} onChange={(event) => updateZh(event.target.value)} />
        )}
      </label>

      <label style={{ display: "grid", gap: "6px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
          <span style={{ fontWeight: 700 }}>{field.label || "Field"}（English）</span>
          <button type="button" disabled={isTranslating} onClick={translate}>
            {isTranslating ? "Translating..." : "Google 翻譯"}
          </button>
        </div>
        {multiline ? (
          <textarea value={value.en} rows={4} onChange={(event) => updateEn(event.target.value)} />
        ) : (
          <input type="text" value={value.en} onChange={(event) => updateEn(event.target.value)} />
        )}
      </label>
    </div>
  );
};
