
"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { categoryLabels, type HelpRequest } from "@/lib/types";

export default function RequestDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();

  const [request, setRequest] = useState<HelpRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [applicantName, setApplicantName] = useState("");
  const [loadError, setLoadError] = useState("");
  const [applyStatus, setApplyStatus] = useState("");
  const [accessCode, setAccessCode] = useState("");

  function generateAccessCode() {
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  }

  async function handleApply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setApplyStatus("");
    setAccessCode("");

    if (!applicantName.trim() || !message.trim()) {
      setApplyStatus("名前と応募メッセージを入力してください。");
      return;
    }

    try {
      const generatedAccessCode = generateAccessCode();
      const supabase = createClient();
      const { data, error } = await supabase
        .from("applications")
        .insert({
          request_id: id,
          applicant_name: applicantName.trim(),
          message: message.trim(),
          access_code: generatedAccessCode,
        })
        .select("access_code")
        .single();

      if (error) {
        setApplyStatus("応募できませんでした：" + error.message);
        return;
      }

      if (!data?.access_code) {
        setApplyStatus("応募は完了しましたが、アクセスコードを取得できませんでした。");
        return;
      }

      setAccessCode(data.access_code);
      setApplyStatus("応募が完了しました！");
      setApplicantName("");
      setMessage("");
    } catch {
      setApplyStatus("応募できませんでした。時間をおいて再度お試しください。");
    }
  }

  useEffect(() => {
    async function loadRequest() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("requests")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          setLoadError("依頼を読み込めませんでした。");
        } else {
          setRequest(data as HelpRequest);
        }
      } catch {
        setLoadError("接続できませんでした。");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadRequest();
    }
  }, [id]);

  if (loading) {
    return <main className="container"><p>読み込み中...</p></main>;
  }

  if (!request) {
    return (
      <main className="container">
        <section className="section card">
          <h1>依頼の詳細</h1>
          <p>{loadError || "依頼が見つかりませんでした。"}</p>
          <Link href="/">トップページに戻る</Link>
        </section>
      </main>
    );
  }

  const category =
    typeof request.category === "string"
      ? categoryLabels[request.category] || request.category
      : "未設定";

  return (
    <main className="container">
      <section className="section card">
        <p><Link href="/">← トップページに戻る</Link></p>
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
            投稿日：{new Date(request.created_at).toLocaleDateString("ja-JP")}
          </p>
        )}
      </section>

      <section className="section card">
        <h2>依頼に応募する</h2>
        <form onSubmit={handleApply}>
          <div>
            <label htmlFor="applicant-name">名前</label>
            <input
              id="applicant-name"
              type="text"
              value={applicantName}
              onChange={(event) => setApplicantName(event.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="application-message">応募メッセージ</label>
            <textarea
              id="application-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              required
              rows={5}
            />
          </div>
          <button type="submit">応募する</button>
          {applyStatus && <p role="status">{applyStatus}</p>}
          {accessCode && (
            <div>
              <p>アクセスコード：{accessCode}</p>
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
