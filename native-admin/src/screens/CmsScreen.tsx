import { useCallback, useEffect, useState } from "react";
import { FlatList, RefreshControl } from "react-native";
import AppButton from "../components/AppButton";
import AppCard from "../components/AppCard";
import AppInput from "../components/AppInput";
import AppScreen from "../components/AppScreen";
import AppTextarea from "../components/AppTextarea";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import LoadingState from "../components/LoadingState";
import { useApp } from "../app/AppProvider";
import { fetchCmsOverview, saveCmsSection } from "../features/cms/cms.api";
import { getErrorMessage, logAppError } from "../lib/errors";
import type { CmsSection } from "../lib/types";
import { spacing } from "../theme";

export default function CmsScreen() {
  const [sections, setSections] = useState<CmsSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { showToast } = useApp();

  const load = useCallback(async () => {
    setError("");
    try {
      const overview = await fetchCmsOverview();
      setSections(overview.sections);
    } catch (err) {
      logAppError("Native CMS load failed", err);
      setError(getErrorMessage(err, "CMS load failed"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function save(section: CmsSection) {
    try {
      await saveCmsSection(section);
      showToast("内容已保存", "success");
    } catch (err) {
      setError(getErrorMessage(err, "CMS save failed"));
    }
  }

  return (
    <AppScreen title="内容管理" subtitle="CMS" scroll={false}>
      <FlatList
        data={sections}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        contentContainerStyle={{ padding: spacing.md, paddingBottom: 110, gap: spacing.md }}
        ListHeaderComponent={error ? <ErrorState title="CMS load failed" details={error} onRetry={load} /> : null}
        ListEmptyComponent={loading ? <LoadingState text="正在加载 CMS..." /> : <EmptyState title="没有 CMS 内容" />}
        renderItem={({ item, index }) => (
          <CmsEditor
            section={item}
            onChange={(next) => setSections((current) => current.map((row, rowIndex) => (rowIndex === index ? next : row)))}
            onSave={() => save(item)}
          />
        )}
      />
    </AppScreen>
  );
}

function CmsEditor({ section, onChange, onSave }: { section: CmsSection; onChange: (section: CmsSection) => void; onSave: () => void }) {
  return (
    <AppCard title={section.section_key} subtitle={section.page_slug}>
      <AppInput label="Title" value={section.title ?? ""} onChangeText={(title) => onChange({ ...section, title })} />
      <AppInput label="Subtitle" value={section.subtitle ?? ""} onChangeText={(subtitle) => onChange({ ...section, subtitle })} />
      <AppTextarea label="Body" value={section.body ?? ""} onChangeText={(body) => onChange({ ...section, body })} />
      <AppInput label="Image URL" value={section.image_url ?? ""} onChangeText={(image_url) => onChange({ ...section, image_url })} />
      <AppInput label="Button Text" value={section.button_text ?? ""} onChangeText={(button_text) => onChange({ ...section, button_text })} />
      <AppInput label="Button URL" value={section.button_url ?? ""} onChangeText={(button_url) => onChange({ ...section, button_url })} />
      <AppButton onPress={onSave}>保存这个区块</AppButton>
    </AppCard>
  );
}
