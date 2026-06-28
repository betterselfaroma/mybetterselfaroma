import { useEffect, useState } from "react";
import { fetchMobileCmsOverview, saveMobileCmsSectionText, saveMobileSiteSetting } from "../lib/admin";
import { describeError, logError } from "../lib/errors";
import type { CmsSection, OperatorProfile, SiteSetting } from "../lib/types";

function settingValue(settings: SiteSetting[], key: string, nestedKey = "value") {
  const value = settings.find((setting) => setting.setting_key === key)?.setting_value;
  const nested = value?.[nestedKey];
  return typeof nested === "string" ? nested : "";
}

function whatsappValue(settings: SiteSetting[], key: "yaning" | "wenshan") {
  const value = settings.find((setting) => setting.setting_key === "whatsapp_number")?.setting_value;
  const nested = value?.[key];
  return typeof nested === "string" ? nested : "";
}

export default function Settings({ profile }: { profile: OperatorProfile }) {
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [sections, setSections] = useState<CmsSection[]>([]);
  const [yaning, setYaning] = useState("");
  const [wenshan, setWenshan] = useState("");
  const [email, setEmail] = useState("");
  const [hours, setHours] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await fetchMobileCmsOverview();
      setSettings(data.settings);
      setSections(data.sections);
      setYaning(whatsappValue(data.settings, "yaning"));
      setWenshan(whatsappValue(data.settings, "wenshan"));
      setEmail(settingValue(data.settings, "email"));
      setHours(settingValue(data.settings, "business_hours"));
    } catch (err) {
      logError("Load mobile CMS settings failed", err);
      setError(describeError(err, "CMS settings could not be loaded"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function saveContactSettings() {
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await Promise.all([
        saveMobileSiteSetting("whatsapp_number", { yaning, wenshan }),
        saveMobileSiteSetting("email", { value: email }),
        saveMobileSiteSetting("business_hours", { value: hours }),
      ]);
      setNotice("网站联系设置已保存");
      await load();
    } catch (err) {
      logError("Save mobile CMS settings failed", err);
      setError(describeError(err, "Site settings could not be saved"));
    } finally {
      setSaving(false);
    }
  }

  async function editSection(section: CmsSection) {
    const title = window.prompt("Title", section.title ?? "");
    if (title === null) return;
    const subtitle = window.prompt("Subtitle", section.subtitle ?? "");
    if (subtitle === null) return;
    const body = window.prompt("Body", section.body ?? "");
    if (body === null) return;

    setSaving(true);
    setError("");
    setNotice("");
    try {
      await saveMobileCmsSectionText({ id: section.id, title, subtitle, body });
      setNotice("内容区块已保存");
      await load();
    } catch (err) {
      logError("Save mobile CMS section failed", err);
      setError(describeError(err, "Content section could not be saved"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="page-stack">
      <div className="page-title">
        <span>Settings</span>
        <h1>应用设置</h1>
        <p>Admin App、CMS 内容与网站联系设置。</p>
      </div>

      <article className="data-card">
        <h3>当前用户</h3>
        <p>{profile.email}</p>
        <p className="muted">role: {profile.customer?.role ?? (profile.customer?.is_admin ? "admin" : "member")}</p>
      </article>

      {notice && <p className="success-box">{notice}</p>}
      {error && <p className="error-box">{error}</p>}
      {loading && <div className="empty-state">正在加载 CMS 设置...</div>}

      <article className="filter-card">
        <h3>网站设置 · Site Settings</h3>
        <input placeholder="雅凝 WhatsApp" value={yaning} onChange={(event) => setYaning(event.target.value)} />
        <input placeholder="文珊 WhatsApp" value={wenshan} onChange={(event) => setWenshan(event.target.value)} />
        <input placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} />
        <input placeholder="Business hours" value={hours} onChange={(event) => setHours(event.target.value)} />
        <button className="primary-button full" type="button" disabled={saving} onClick={saveContactSettings}>
          {saving ? "保存中..." : "保存网站设置"}
        </button>
      </article>

      <article className="data-card">
        <h3>内容区块 · Content Sections</h3>
        <p>可快速编辑首页区块 title / subtitle / body。图片上传请使用网页版 Admin。</p>
      </article>

      {sections.map((section) => (
        <article className="data-card" key={section.id}>
          <div className="card-row">
            <div>
              <h3>{section.title || section.section_key}</h3>
              <p>{section.subtitle || section.body || section.section_type}</p>
            </div>
            <span className={["status-pill", section.visible ? "confirmed" : "cancelled"].join(" ")}>
              {section.visible ? "Visible" : "Hidden"}
            </span>
          </div>
          <p className="muted">{section.page_slug} · {section.section_key}</p>
          <button className="text-button" type="button" onClick={() => editSection(section)} disabled={saving}>
            编辑文字
          </button>
        </article>
      ))}
    </section>
  );
}
