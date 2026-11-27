"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

type RequestItem = {
  id: string;
  title: string | null;
  category: string | null;
  created_at: string | null;
};

type ApplicationItem = {
  id: string;
  request_id: string;
  created_at: string | null;
};

const categoryLabels: Record<string, string> = {
  money: "お金の支援",
  goods: "物資・食料",
  work: "作業の支援",
  shopping: "買い物",
  cleaning: "掃除",
  cooking: "料理",
  errands: "用事",
  other: "その他",
};

export default function AccountPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadAccount() {
      const supabase = createClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.replace("/login");
        return;
      }

      setEmail(user.email || "");

      const [requestResult, applicationResult] = await Promise.all([
        supabase
          .from("requests")
          .select("id, title, category, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),

        supabase
          .from("applications")
          .select("id, request_id, created_at")
          .eq("applicant_user_id", user.id)
          .order("created_at", { ascending: false }),
      ]);

      if (requestResult.error) {
        setMessage("自分の依頼を読み込めませんでした。");
      } else {
        setRequests((requestResult.data || []) as RequestItem[]);
      }

      if (applicationResult.error) {
        setMessage((current) =>
          current
            ? current + " 応募履歴も読み込めませんでした。"
            : "応募履歴を読み込めませんでした。"
        );
      } else {
        setApplications(
          (applicationResult.data || []) as ApplicationItem[]
        );
      }

      setLoading(false);
    }

    void loadAccount();
  }, [router]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <main className="container" style={{ maxWidth: "800px", margin: "0 auto", padding: "24px 16px" }}>
      <section className="section card">
        <h1>マイページ</h1>
        <p className="muted">アカウント情報と活動履歴</p>

        {loading ? (
          <p>読み込み中...</p>
        ) : (
          <>
            <div className="card">
              <h2>アカウント情報</h2>
              <p>メールアドレス：{email}</p>
            </div>

            <div className="card">
              <h2>自分が投稿した依頼（{requests.length}件）</h2>

              {requests.length === 0 ? (
                <p>まだ依頼を投稿していません。</p>
              ) : (
                requests.map((request) => (
                  <article key={request.id}>
                    <hr />
                    <p className="tag">
                      {categoryLabels[request.category || "other"] || "その他"}
                    </p>
                    <h3>
                      <Link href={`/requests/${request.id}`}>
                        {request.title || "タイトルなし"}
                      </Link>
                    </h3>
                    <Link href={`/requests/${request.id}/applications`}>
                      応募者を確認する
                    </Link>
                  </article>
                ))
              )}
            </div>

            <div className="card">
              <h2>応募した依頼（{applications.length}件）</h2>

              {applications.length === 0 ? (
                <p>まだ応募していません。</p>
              ) : (
                applications.map((application) => (
                  <article key={application.id}>
                    <hr />
                    <p>
                      <Link href={`/requests/${application.request_id}`}>
                        応募した依頼の詳細を見る
                      </Link>
                    </p>
                    {application.created_at && (
                      <p className="muted">
                        応募日：
                        {new Date(application.created_at).toLocaleDateString("ja-JP")}
                      </p>
                    )}
                  </article>
                ))
              )}
            </div>
          </>
        )}

        {message && <p role="status">{message}</p>}

        <p>
          <Link href="/requests">依頼一覧へ戻る</Link>
        </p>

        <button className="button secondary" onClick={handleLogout}>
          ログアウト
        </button>
      </section>
    </main>
  );
}
