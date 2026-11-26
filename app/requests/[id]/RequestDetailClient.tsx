
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

  function generateAccessCode() {
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    return Array.from(bytes, (byte) =>
      byte.toString(16).padStart(2, "0")
    ).join("");
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
        setLoading(false);
        return;
      }

      if (!applicantName.trim() || !message.trim()) {
        setApplyStatus("名前と応募メッセージを入力してください。");
        setLoading(false);
        return;
      }

      const generatedAccessCode = generateAccessCode();

      const { error } = await supabase.from("applications").insert({
        request_id: id,
        applicant_name: applicantName.trim(),
        applicant_user_id: user.id,
        message: message.trim(),
        access_code: generatedAccessCode,
      });

      if (error) {
        setApplyStatus("応募できませんでした。入力内容や権限設定を確認してください。");
        setLoading(false);
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

        {Boolean(request.user_id) && (
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

      <section className="section card">
        <h2>依頼に応募する</h2>
        <p>安全のため、応募にはログインが必要です。</p>
        <p>
          <Link href="/login">ログイン・新規登録はこちら</Link>
        </p>

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
