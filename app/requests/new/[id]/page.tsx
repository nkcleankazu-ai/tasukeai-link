
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { categoryLabels, type HelpRequest } from "@/lib/types";

export default function RequestDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [request, setRequest] = useState<HelpRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

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
          setMessage("依頼を読み込めませんでした。");
        } else {
          setRequest(data as HelpRequest);
        }
      } catch {
        setMessage("接続できませんでした。");
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
          <p>{message || "依頼が見つかりませんでした。"}</p>
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
        {request.created_at && (
          <p className="muted">
            投稿日：{new Date(request.created_at).toLocaleDateString("ja-JP")}
          </p>
        )}
      </section>
    </main>
  );
}
