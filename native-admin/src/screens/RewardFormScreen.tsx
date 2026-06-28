import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import AppButton from "../components/AppButton";
import AppCard from "../components/AppCard";
import AppInput from "../components/AppInput";
import AppScreen from "../components/AppScreen";
import AppSelect from "../components/AppSelect";
import AppTextarea from "../components/AppTextarea";
import ErrorState from "../components/ErrorState";
import { useApp } from "../app/AppProvider";
import { useAuth } from "../app/AuthProvider";
import { saveRewardProduct, uploadRewardProductImage } from "../features/rewards/rewards.api";
import { getErrorMessage, logAppError } from "../lib/errors";
import type { RewardProduct } from "../lib/types";

export default function RewardFormScreen({ route, navigation }: { route: { params?: { product?: RewardProduct } }; navigation: any }) {
  const product = route.params?.product;
  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [imageUrl, setImageUrl] = useState(product?.image_url ?? "");
  const [pointsCost, setPointsCost] = useState(String(product?.points_cost ?? ""));
  const [stock, setStock] = useState(String(product?.stock ?? "0"));
  const [active, setActive] = useState(product?.active === false ? "false" : "true");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { profile } = useAuth();
  const { showToast } = useApp();

  async function pickImage() {
    setError("");
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError("没有相册权限，无法上传图片。");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.9,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    try {
      setLoading(true);
      setImageUrl(await uploadRewardProductImage(asset.uri, asset.mimeType ?? "image/jpeg"));
      showToast("图片已上传", "success");
    } catch (err) {
      logAppError("Native reward image upload failed", err);
      setError(getErrorMessage(err, "Image upload failed"));
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    if (!profile) return;
    setLoading(true);
    setError("");
    try {
      await saveRewardProduct({
        id: product?.id,
        name,
        description,
        image_url: imageUrl,
        points_cost: Number(pointsCost),
        stock: Number(stock),
        active: active === "true",
        operatorUserId: profile.userId,
      });
      showToast("积分商品已保存", "success");
      navigation.goBack();
    } catch (err) {
      logAppError("Native reward save failed", err);
      setError(getErrorMessage(err, "Reward save failed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppScreen title={product ? "编辑积分商品" : "新增积分商品"} subtitle="Reward Product">
      <AppCard>
        <AppInput label="商品名称" value={name} onChangeText={setName} />
        <AppTextarea label="商品说明" value={description} onChangeText={setDescription} />
        <AppInput label="图片 URL" value={imageUrl} onChangeText={setImageUrl} />
        <AppButton tone="secondary" loading={loading} onPress={pickImage}>选择并上传图片</AppButton>
        <AppInput label="所需积分" keyboardType="numeric" value={pointsCost} onChangeText={setPointsCost} />
        <AppInput label="库存" keyboardType="numeric" value={stock} onChangeText={setStock} />
        <AppSelect label="状态" value={active} onChange={setActive} options={[{ label: "Active", value: "true" }, { label: "Hidden", value: "false" }]} />
        {error ? <ErrorState title="Reward save failed" details={error} /> : null}
        <AppButton loading={loading} onPress={save}>保存商品</AppButton>
      </AppCard>
    </AppScreen>
  );
}
