
"use client";
import { Suspense } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase";

type RequestItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  created_at: string;
};

const categoryLabels: Record<string, string> = {
  money: "お金の支援",
  goods: "必要なものを届ける",
  work: "手を貸してほしい",
};

function RequestsContent() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category");

  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadRequests() {
      setLoading(true);
      setError("");

      try {
        const supabase = createClient();

        let query = supabase
          .from("requests")
          .select("id, title, description, category, created_at")
          .order("created_at", { ascending: false });

        if (category) {
          query = query.eq("category", category);
        }

        const { data, error } = await query;

        if (error) {
          throw error;
        }

        setRequests(data ?? []);
      } catch (err) {
        console.error(err);
        setError("依頼を読み込めませんでした。");
      } finally {
        setLoading(false);
      }
    }

    loadRequests();
  }, [category]);

  return (
    <main style={{ maxWidth: "700px", margin: "0 auto", padding: "24px" }}>
      <h1>支援を探す</h1>

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <Link href="/requests">すべて</Link>
        <Link href="/requests?category=money">お金の支援</Link>
        <Link href="/requests?category=goods">
          必要なものを届ける
        </Link>
        <Link href="/requests?category=work">
          手を貸してほしい
        </Link>
      </div>

      <h2>
        {category
          ? categoryLabels[category] ?? "依頼一覧"
          : "依頼一覧"}
      </h2>

      <Link href="/requests/new">依頼を投稿する</Link>

      {loading && <p>読み込み中...</p>}

      {error && <p>{error}</p>}

      {!loading && !error && requests.length === 0 && (
        <p>現在、依頼はありません。</p>
      )}

      {requests.map((request) => (
        <article
          key={request.id}
          style={{
            border: "1px solid #ddd",
            borderRadius: "10px",
            padding: "16px",
            marginTop: "16px",
          }}
        >
          <h3>{request.title}</h3>
          <p>{request.description}</p>
          <p>
            {categoryLabels[request.category] ?? "その他"}
          </p>
          <Link href={`/requests/${request.id}`}>
            詳細を見る
          </Link>
        </article>
      ))}

      <p>
        <Link href="/">トップページへ戻る</Link>
      </p>
    </main>
  );
}export default function RequestsPage() {
  return (
    <Suspense fallback={<p>読み込み中...</p>}>
      <RequestsContent />
    </Suspense>
  );
}
