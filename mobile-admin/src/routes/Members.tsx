import { useEffect, useState } from "react";
import MemberCard from "../components/MemberCard";
import { adjustMemberPoints, fetchMembers, generateCustomerQrToken } from "../lib/admin";
import { describeError, logError } from "../lib/errors";
import type { Customer, OperatorProfile, TransactionType } from "../lib/types";

export default function Members({ profile }: { profile: OperatorProfile }) {
  const [q, setQ] = useState("");
  const [members, setMembers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

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
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function adjust(customerId: string, points: number, type: TransactionType, reason: string) {
    setNotice("");
    try {
      await adjustMemberPoints(customerId, points, type, reason, profile.userId);
      setNotice("积分已更新");
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
    <section className="page-stack">
      <div className="page-title">
        <span>Members</span>
        <h1>会员管理</h1>
        <p>搜索会员、联系 WhatsApp、加扣积分。</p>
      </div>
      <div className="filter-card">
        <input placeholder="搜索电话 / 名字" value={q} onChange={(e) => setQ(e.target.value)} />
        <button className="primary-button full" onClick={load} disabled={loading}>{loading ? "搜索中…" : "搜索会员"}</button>
      </div>
      {notice && <p className="success-box">{notice}</p>}
      {error && <p className="error-box">{error}</p>}
      {loading ? <div className="empty-state">正在加载会员…</div> : members.length === 0 ? <div className="empty-state">找不到会员</div> : null}
      {members.map((member) => (
        <div key={member.id} className="member-wrap">
          <MemberCard customer={member} onAdjust={adjust} onGenerateQr={generateQr} />
          <button className="text-button" onClick={() => customAdjust(member)}>自定义积分调整</button>
        </div>
      ))}
    </section>
  );
}
