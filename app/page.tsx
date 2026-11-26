
import Link from "next/link";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { categoryLabels, type HelpRequest } from "@/lib/types";

export const metadata = {
  title: "生活支援・仕事依頼・職人マッチング",
  description:
    "困っている人と助けたい人、仕事を依頼したい人と職人をつなぐサービス。生活支援、食料・物資、清掃、運搬、建設、外構、設備などの依頼を探せます。",
  keywords: [
    "生活支援",
    "助け合い",
    "仕事依頼",
    "職人マッチング",
    "建設",
    "外構工事",
    "清掃",
    "運搬",
    "買い物支援",
    "地域支援",
  ],
  alternates: { canonical: "/" },
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
        setAll(cookiesToSet: any[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {}
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
  } catch {
    return [];
  }
}

export default async function Home() {
  const requests = await getRequests();

  return (
    <div className="container">
      <section className="hero">
        <span className="tag">人と人、仕事と技術をつなぐ</span>
        <h1>
          困っている人と、
          <br />
          助けたい人をつなぐ。
        </h1>
        <p>
          日常の困りごとから専門的な仕事の依頼まで。
          支援したい人、仕事を探している職人、
          そして助けを必要としている人をつなぎます。
        </p>
        <div className="row">
          <Link className="button" href="/requests">
            依頼・仕事を探す
          </Link>
          <Link className="button secondary" href="/requests/new">
            依頼を投稿する
          </Link>
        </div>
      </section>

      <section className="section">
        <h2>あなたにできることから、つながろう。</h2>
        <div className="grid">
          <article className="card">
            <img
              src="https://images.unsplash.com/photo-1779883958259-84b880cf12fa?auto=format&fit=crop&fm=jpg&q=80&w=1000"
              alt="京都の市場で買い物をする日本の地域の日常風景"
              style={{ width: "100%", height: 210, objectFit: "cover", borderRadius: 12 }}
            />
            <span className="tag">地域・生活支援</span>
            <h3>暮らしの困りごとを支える</h3>
            <p>
              食料や日用品、買い物、掃除、料理、日常のちょっとした手助け。
              できる人と必要な人をつなぎます。
            </p>
            <Link className="button" href="/requests">
              支援依頼を探す
            </Link>
          </article>

          <article className="card">
            <img
              src="https://images.unsplash.com/photo-1767589565100-f9aa084a574a?auto=format&fit=crop&fm=jpg&q=80&w=1000"
              alt="日本の名古屋の道路工事現場で働く建設作業員"
              style={{ width: "100%", height: 210, objectFit: "cover", borderRadius: 12 }}
            />
            <span className="tag">職人・仕事依頼</span>
            <h3>技術と仕事をつなぐ</h3>
            <p>
              建設、外構、設備、清掃、運搬など。
              職人の技術を必要としている人と仕事をつなぎます。
            </p>
            <Link className="button" href="/requests">
              仕事・依頼を探す
            </Link>
          </article>
        </div>
      </section>

      <section className="section">
        <h2>支援・仕事の種類</h2>
        <p className="muted">
          自分に合った依頼や、手伝える仕事を探せます。
        </p>
        <div className="grid">
          {[
            ["money", "お金の支援", "生活の困りごと"],
            ["goods", "物資・食料", "食料品・日用品"],
            ["work", "作業の支援", "清掃・運搬・作業"],
            ["shopping", "買い物", "買い物のお手伝い"],
            ["cleaning", "掃除", "清掃・片付け"],
            ["cooking", "料理", "調理のお手伝い"],
            ["errands", "用事", "日常の用事"],
            ["other", "その他", "さまざまな依頼"],
          ].map(([category, label, description]) => (
            <Link
              className="card"
              href={`/requests?category=${category}`}
              key={category}
            >
              <span className="tag">{label}</span>
              <h3>{description}</h3>
              <p className="muted">依頼を見る →</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="row" style={{ alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h2>新着の依頼</h2>
            <p className="muted">最近投稿された支援・仕事の依頼です。</p>
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
        <h2>利用の流れ</h2>
        <div className="grid">
          <div className="card">
            <span className="tag">STEP 1</span>
            <h3>依頼を探す・投稿する</h3>
            <p>困りごとや仕事の依頼を投稿・検索します。</p>
          </div>
          <div className="card">
            <span className="tag">STEP 2</span>
            <h3>支援・仕事に応募する</h3>
            <p>自分にできることを選んで応募します。</p>
          </div>
          <div className="card">
            <span className="tag">STEP 3</span>
            <h3>メッセージで相談する</h3>
            <p>内容や条件を確認して進めます。</p>
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
