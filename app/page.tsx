import Link from "next/link";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { categoryLabels, type HelpRequest } from "@/lib/types";

export const metadata = {
  title: "困りごと・生活支援・作業依頼を探す",
  description:
    "生活の困りごと、食料や物資の支援、清掃・運搬などの作業支援。たすけあいリンクで助けを求める人と支援したい人をつなぎます。",
  alternates: {
    canonical: "/",
  },
};

async function getRequests(): Promise<HelpRequest[]> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) return [];

    const cookieStore = cookies();

    const supabase = createServerClient(url, key, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options: CookieOptions;
          }[]
        ) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server ComponentではCookieを書き込めない場合があります
          }
        },
      },
    });

    const { data, error } = await supabase
      .from("requests")
      .select("id, title, description, category, created_at")
      .order("created_at", { ascending: false })
      .limit(6);

    if (error || !data) return [];

    return data as HelpRequest[];
  } catch (error) {
    console.error("Supabase接続エラー:", error);
    return [];
  }
}

export default async function Home() {
  const requests = await getRequests();

  return (
    <div className="container">
      <section className="hero">
        <span className="tag">助け合いをつなぐサービス</span>
        <h1>
          困っている人と、
          <br />
          助けたい人をつなぐ。
        </h1>
        <p>
          生活の困りごと、物資や食料の支援、清掃・運搬などの作業支援まで。
          あなたの「助けたい」という気持ちを、必要としている人へ届けます。
        </p>
        <div className="row">
          <Link className="button" href="/requests">
            支援・依頼を探す
          </Link>
          <Link className="button secondary" href="/requests/new">
            困りごとを投稿する
          </Link>
        </div>
      </section>

      <section className="section">
        <h2>支援の種類から探す</h2>
        <p className="muted">
          必要としている支援を選んで、依頼を探せます。
        </p>
        <div className="grid">
          <Link className="card" href="/requests?category=money">
            <span className="tag">お金の支援</span>
            <h3>生活の困りごと</h3>
            <p>生活に関する支援を探す</p>
          </Link>
          <Link className="card" href="/requests?category=goods">
            <span className="tag">物資・食料</span>
            <h3>必要なものを届ける</h3>
            <p>食料品や日用品などの支援を探す</p>
          </Link>
          <Link className="card" href="/requests?category=work">
            <span className="tag">作業の支援</span>
            <h3>作業を手伝ってほしい</h3>
            <p>清掃・運搬・買い物などの支援を探す</p>
          </Link>
        </div>
      </section>

      <section className="section">
        <div
          className="row"
          style={{ alignItems: "center", justifyContent: "space-between" }}
        >
          <div>
            <h2>新着の支援依頼</h2>
            <p className="muted">最近投稿された依頼を確認できます。</p>
          </div>
          <Link href="/requests">すべて見る →</Link>
        </div>

        {requests.length === 0 ? (
          <div className="card">
            <p>現在、公開中の依頼はありません。</p>
            <Link className="button" href="/requests/new">
              最初の依頼を投稿する
            </Link>
          </div>
        ) : (
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
                <p>
                  {(request.description || "説明はありません。").slice(0, 120)}
                  {(request.description?.length ?? 0) > 120 ? "…" : ""}
                </p>
                {request.created_at && (
                  <p className="muted">
                    {new Date(request.created_at).toLocaleDateString("ja-JP")}
                  </p>
                )}
                <Link href={`/requests/${request.id}`}>詳細を見る →</Link>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="section">
        <h2>たすけあいリンクの使い方</h2>
        <div className="grid">
          <div className="card">
            <span className="tag">STEP 1</span>
            <h3>依頼を探す・投稿する</h3>
            <p>困りごとを投稿したり、支援を必要としている人を探します。</p>
          </div>
          <div className="card">
            <span className="tag">STEP 2</span>
            <h3>支援に応募する</h3>
            <p>自分にできる支援を選び、依頼者へ応募します。</p>
          </div>
          <div className="card">
            <span className="tag">STEP 3</span>
            <h3>メッセージで相談する</h3>
            <p>相手と内容を確認しながら、支援の方法を相談します。</p>
          </div>
        </div>
      </section>

      <section className="section card">
        <h2>安心して利用するために</h2>
        <p>
          個人情報や住所などは必要以上に公開しないようにしましょう。
          支援の内容や条件を事前に確認し、安全にやり取りしてください。
        </p>
        <Link href="/safety">安全ガイドを確認する →</Link>
      </section>
    </div>
  );
}
