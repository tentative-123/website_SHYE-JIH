import React, { useRef, useState } from "react";

type ImageValue = {
  url?: string;
  alt?: {
    zh?: string;
    en?: string;
  };
  caption?: {
    zh?: string;
    en?: string;
  };
};

type Props = {
  input: {
    value: ImageValue;
    onChange: (value: ImageValue) => void;
  };
  field: {
    label?: string;
  };
};

const cloudName = import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME || "";
const uploadPreset = import.meta.env.PUBLIC_CLOUDINARY_UPLOAD_PRESET || "";

export const CloudinaryImageField = ({ input, field }: Props) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const value = input.value || {};

  const uploadFile = async (file: File) => {
    if (!cloudName || !uploadPreset) {
      window.alert("請先設定 PUBLIC_CLOUDINARY_CLOUD_NAME 與 PUBLIC_CLOUDINARY_UPLOAD_PRESET");
      return;
    }

    setUploading(true);
    try {
      const payload = new FormData();
      payload.append("file", file);
      payload.append("upload_preset", uploadPreset);

      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: payload
      });

      if (!response.ok) {
        throw new Error("Cloudinary upload failed");
      }

      const data = await response.json();
      input.onChange({ ...value, url: data.secure_url });
    } catch (error) {
      console.error(error);
      window.alert("圖片上傳失敗，請檢查 Cloudinary 設定後再試。");
    } finally {
      setUploading(false);
    }
  };

  const onDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      await uploadFile(file);
    }
  };

  const onPick = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await uploadFile(file);
    }
  };

  return (
    <div style={{ display: "grid", gap: "12px" }}>
      <span style={{ fontWeight: 700 }}>{field.label || "Image"}</span>

      <div
        onDragOver={(event) => event.preventDefault()}
        onDrop={onDrop}
        style={{
          border: "1px dashed #9aa4b2",
          borderRadius: "12px",
          padding: "16px",
          textAlign: "center",
          background: "#f8fafc"
        }}
      >
        <p style={{ margin: 0 }}>拖曳圖片到這裡，或點擊下方按鈕選擇檔案</p>
        <button type="button" onClick={() => fileInputRef.current?.click()} style={{ marginTop: "8px" }}>
          選擇圖片
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={onPick} />
      </div>

      <label style={{ display: "grid", gap: "6px" }}>
        <span>圖片 URL</span>
        <input
          type="text"
          value={value.url || ""}
          onChange={(event) => input.onChange({ ...value, url: event.target.value })}
          placeholder="https://res.cloudinary.com/..."
        />
      </label>

      {value.url ? (
        <img src={value.url} alt="Cloudinary preview" style={{ width: "100%", borderRadius: "8px", border: "1px solid #e2e8f0" }} />
      ) : null}

      <div style={{ fontSize: "12px", color: "#475569" }}>{uploading ? "圖片上傳中..." : "上傳成功後會自動回填 URL，右側預覽將同步更新。"}</div>
    </div>
  );
};
