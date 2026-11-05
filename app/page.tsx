"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { categoryLabels, type HelpRequest } from "@/lib/types";

export default function Home() {
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [configured, setConfigured] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRequests() {
      try {
        const supabase = createClient();

        const { data, error } = await supabase
          .from("requests")
          .select("id, title, description, category, created_at")
          .order("created_at", { ascending: false })
          .limit(6);

        if (error) throw error;

        setRequests((data ?? []) as HelpRequest[]);
      } catch (error) {
        console.error("依頼の読み込みエラー:", error);
        setConfigured(false);
      } finally {
        setLoading(false);
      }
    }

    loadRequests();
  }, []);

  return (
    <div className="container">
      <section className="hero">
        <span className="tag">
          たすけあいリンク｜全国対応を目指す支援マッチング
        </span>

        <h1>
          困っている人と、
          <br />
          助けたい人をつなぐ。
        </h1>

        <p>
          お金・物資の支援から、清掃・運搬などの作業支援まで。
          あなたの「助けたい」を必要としている人へ届けるサービスです。
        </p>

        <div className="row">
          <Link className="button" href="/requests">
            支援を探す
          </Link>
          <Link className="button secondary" href="/requests/new">
            困りごとを投稿
          </Link>
        </div>
      </section>

      {!configured && (
        <div className="notice">
          現在、依頼を読み込めません。
          Supabaseの設定とデータベースを確認してください。
        </div>
      )}

      <section className="section">
        <h2>どんな支援を探していますか？</h2>

        <div className="grid">
          <Link className="card" href="/requests?category=money">
            <span className="tag">お金の支援</span>
            <p>生活の困りごと</p>
          </Link>

          <Link className="card" href="/requests?category=goods">
            <span className="tag">物資・食料</span>
            <p>必要なものを届ける</p>
          </Link>

          <Link className="card" href="/requests?category=work">
            <span className="tag">作業の支援</span>
            <p>手を貸してほしい</p>
          </Link>
        </div>
      </section>

      <section className="section">
        <h2>新着の支援依頼</h2>

        {loading && <p>読み込み中...</p>}

        {!loading && requests.length === 0 && (
          <div className="card">
            <p>公開中の依頼はまだありません。</p>
          </div>
        )}

        <div className="grid">
          {requests.map((request) => (
            <article key={request.id} className="card">
              <span className="tag">
                {categoryLabels[request.category ?? "other"] ?? "その他"}
              </span>

              <h3>
                <Link href={`/requests/${request.id}`}>
                  {request.title || "タイトルなし"}
                </Link>
              </h3>

              <p>{request.description || "説明はありません。"}</p>

              {request.created_at && (
                <p className="muted">
                  {new Date(request.created_at).toLocaleDateString("ja-JP")}
                </p>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="section card">
        <h2>安心して使うために</h2>
        <p>
          個人情報や住所などは、必要以上に公開しないようにしましょう。
        </p>
        <Link href="/safety">安全ガイドを確認する</Link>
      </section>
    </div>
  );
}
