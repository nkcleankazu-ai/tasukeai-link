
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { categoryLabels, type HelpRequest } from "@/lib/types";

export default function RequestDetailClient({
  request,
}: {
  request: HelpRequest;
}) {
  const router = useRouter();
  const id = String(request.id ?? "");

  const [message, setMessage] = useState("");
  const [applicantName, setApplicantName] = useState("");
  const [applyStatus, setApplyStatus] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [safetyStatus, setSafetyStatus] = useState("");
  const [safetyLoading, setSafetyLoading] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [checkedUser, setCheckedUser] = useState(false);

  async function getCurrentUser() {
    const supabase = createClient();
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      setSafetyStatus("この操作にはログインが必要です。");
      return null;
    }

    return data.user;
  }

  async function handleReport() {
    if (!request.user_id) return;

    const category = window.prompt(
      "通報理由を入力してください（迷惑行為・詐欺の疑い・危険な依頼・その他）"
    );
    if (!category?.trim()) return;

    const description = window.prompt("詳しい内容を入力してください。");
    if (!description?.trim()) return;

    setSafetyLoading(true);
    setSafetyStatus("");

    try {
      const user = await getCurrentUser();
      if (!user) return;

      if (user.id === request.user_id) {
        setSafetyStatus("自分の依頼は通報できません。");
        return;
      }

      const supabase = createClient();
      const { error } = await supabase.from("reports").insert({
        reporter_id: user.id,
        reported_user_id: request.user_id,
        request_id: id,
        category: category.trim().slice(0, 100),
        description: description.trim().slice(0, 2000),
      });

      if (error) {
        setSafetyStatus("通報できませんでした。時間をおいて再度お試しください。");
      } else {
        setSafetyStatus("通報を受け付けました。ご協力ありがとうございます。");
      }
    } catch {
      setSafetyStatus("通報に失敗しました。");
    } finally {
      setSafetyLoading(false);
    }
  }

  async function handleBlock() {
    if (!request.user_id) return;

    if (!window.confirm("このユーザーをブロックしますか？")) return;

    setSafetyLoading(true);
    setSafetyStatus("");

    try {
      const user = await getCurrentUser();
      if (!user) return;

      if (user.id === request.user_id) {
        setSafetyStatus("自分自身はブロックできません。");
        return;
      }

      const supabase = createClient();
      const { error } = await supabase.from("user_blocks").upsert(
        {
          blocker_id: user.id,
          blocked_user_id: request.user_id,
        },
        { onConflict: "blocker_id,blocked_user_id" }
      );

      if (error) {
        setSafetyStatus("ブロックできませんでした。");
      } else {
        setSafetyStatus("このユーザーをブロックしました。");
      }
    } catch {
      setSafetyStatus("ブロックに失敗しました。");
    } finally {
      setSafetyLoading(false);
    }
  }

  async function handleApply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setApplyStatus("");
    setAccessCode("");
    setLoading(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        setApplyStatus("応募にはログインが必要です。");
        return;
      }

      if (!applicantName.trim() || !message.trim()) {
        setApplyStatus("名前と応募メッセージを入力してください。");
        return;
      }

      if (user.id === request.user_id) {
        setApplyStatus("自分の依頼には応募できません。");
        return;
      }

      const generatedAccessCode = Array.from(
        crypto.getRandomValues(new Uint8Array(16)),
        (byte) => byte.toString(16).padStart(2, "0")
      ).join("");

      const { error } = await supabase.from("applications").insert({
        request_id: id,
        applicant_name: applicantName.trim(),
        applicant_user_id: user.id,
        message: message.trim(),
        access_code: generatedAccessCode,
      });

      if (error) {
        setApplyStatus("応募できませんでした。入力内容や権限設定を確認してください。");
        return;
      }

      setAccessCode(generatedAccessCode);
      setApplyStatus("応募が完了しました！");
      setApplicantName("");
      setMessage("");
    } catch {
      setApplyStatus("応募できませんでした。時間をおいて再度お試しください。");
    } finally {
      setLoading(false);
    }
  }

  // ログインユーザーと依頼者が同一か確認
  useState(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setIsOwner(Boolean(data.user && data.user.id === request.user_id));
      setCheckedUser(true);
    });
  });

  const category =
    typeof request.category === "string"
      ? categoryLabels[request.category] || request.category
      : "未設定";

  return (
    <main className="container">
      <section className="section card">
        <p><Link href="/requests">← 依頼一覧に戻る</Link></p>
        <h1>{request.title || "依頼の詳細"}</h1>
        <p className="muted">カテゴリー：{category}</p>
        <hr />
        <h2>困っていること</h2>
        <p>{request.description || "説明はありません。"}</p>

        {isOwner && (
          <p>
            <Link href={`/requests/${id}/applications`}>
              応募一覧を見る
            </Link>
          </p>
        )}

        {request.created_at && (
          <p className="muted">
            投稿日：
            {new Date(request.created_at).toLocaleDateString("ja-JP")}
          </p>
        )}
      </section>

      {checkedUser && !isOwner && request.user_id && (
        <section className="section card">
          <h2>安全対策</h2>
          <p>不審な依頼や迷惑行為があった場合は運営に通報できます。</p>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button
              type="button"
              className="button"
              disabled={safetyLoading}
              onClick={handleReport}
            >
              通報する
            </button>
            <button
              type="button"
              className="button"
              disabled={safetyLoading}
              onClick={handleBlock}
            >
              このユーザーをブロック
            </button>
          </div>
          {safetyStatus && <p role="status">{safetyStatus}</p>}
        </section>
      )}

      <section className="section card">
        <h2>依頼に応募する</h2>
        <p>安全のため、応募にはログインが必要です。</p>
        <p><Link href="/login">ログイン・新規登録はこちら</Link></p>

        <form onSubmit={handleApply}>
          <div>
            <label htmlFor="applicant-name">名前</label>
            <input
              id="applicant-name"
              type="text"
              value={applicantName}
              onChange={(event) => setApplicantName(event.target.value)}
              maxLength={100}
              required
            />
          </div>

          <div>
            <label htmlFor="application-message">応募メッセージ</label>
            <textarea
              id="application-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              maxLength={3000}
              required
              rows={5}
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "応募中..." : "ログインして応募する"}
          </button>

          {applyStatus && <p role="status">{applyStatus}</p>}

          {accessCode && (
            <div>
              <p>メッセージ用アクセスコード：</p>
              <p>{accessCode}</p>
              <button
                type="button"
                onClick={() => router.push(`/messages/${accessCode}`)}
              >
                メッセージを送る
              </button>
            </div>
          )}
        </form>
      </section>
    </main>
  );
}
