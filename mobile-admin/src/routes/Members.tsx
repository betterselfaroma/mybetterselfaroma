import { useEffect, useState } from "react";
import MemberCard from "../components/MemberCard";
import AppInput from "../components/mobile/AppInput";
import AppPage from "../components/mobile/AppPage";
import EmptyState from "../components/mobile/EmptyState";
import ErrorState from "../components/mobile/ErrorState";
import LoadingState from "../components/mobile/LoadingState";
import { useApp } from "../app/AppProvider";
import { adjustMemberPoints, fetchMembers, generateCustomerQrToken } from "../features/members/members.api";
import { describeError, logError } from "../lib/errors";
import type { Customer, OperatorProfile, TransactionType } from "../lib/types";

export default function Members({ profile }: { profile: OperatorProfile }) {
  const [q, setQ] = useState("");
  const [members, setMembers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const { showToast } = useApp();

  async function load() {
    setLoading(true);
    setError("");
    try {
      setMembers(await fetchMembers(q));
    } catch (err) {
      logError("Load mobile members failed", err);
      setError(describeError(err, "Members could not be loaded"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(load, 260);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  async function adjust(customerId: string, points: number, type: TransactionType, reason: string) {
    setNotice("");
    try {
      await adjustMemberPoints(customerId, points, type, reason, profile.userId);
      setNotice("积分已更新");
      showToast("积分已更新");
      await load();
    } catch (err) {
      logError("Mobile points adjustment failed", err);
      setError(describeError(err, "Points update failed"));
    }
  }

  async function generateQr(customerId: string) {
    setNotice("");
    setError("");
    try {
      await generateCustomerQrToken(customerId, profile.userId);
      setNotice("QR Token generated");
      showToast("QR Token generated");
      await load();
    } catch (err) {
      logError("Mobile QR token generation failed", err);
      setError(describeError(err, "QR Token could not be generated"));
    }
  }

  async function customAdjust(customer: Customer) {
    const raw = window.prompt(`输入 ${customer.name || customer.phone || "Member"} 的积分调整，例如 20 或 -10`);
    if (!raw) return;
    const points = Number(raw);
    if (!Number.isFinite(points) || points === 0) {
      setError("请输入有效积分数字");
      return;
    }
    await adjust(customer.id, points, "adjust", "Mobile admin custom adjustment");
  }

  return (
    <AppPage eyebrow="Members" title="会员管理" description="搜索会员、联系 WhatsApp、加扣积分。">
      <div className="filter-card">
        <AppInput label="搜索会员" placeholder="搜索电话 / 名字 / Email" value={q} clearable onClear={() => setQ("")} onChange={(e) => setQ(e.target.value)} />
      </div>
      {notice && <p className="success-box">{notice}</p>}
      {error && <ErrorState message="会员列表暂时无法读取。" details={error} onRetry={load} />}
      {loading ? <LoadingState text="正在加载会员…" /> : members.length === 0 ? <EmptyState title="找不到会员" description="请换一个名字、电话或 Email 搜索。" /> : null}
      {members.map((member) => (
        <div key={member.id} className="member-wrap">
          <MemberCard customer={member} onAdjust={adjust} onGenerateQr={generateQr} />
          <button className="text-button" onClick={() => customAdjust(member)}>自定义积分调整</button>
        </div>
      ))}
    </AppPage>
  );
}
