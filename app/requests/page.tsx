import Link from "next/link";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const metadata = {
  title: "支援・依頼一覧",
  description:
    "お金・物資・食料・作業・買い物・掃除など、さまざまな支援依頼を探せます。",
  alternates: { canonical: "/requests" },
};

type RequestItem = {
  id: string;
  user_id: string;
  title: string | null;
  description: string | null;
  category: string | null;
  created_at: string | null;
};

const categories = [
  ["money", "お金の支援"],
  ["goods", "物資・食料"],
  ["work", "作業の支援"],
  ["shopping", "買い物"],
  ["cleaning", "掃除"],
  ["cooking", "料理"],
  ["errands", "用事"],
  ["other", "その他"],
] as const;

const categoryLabels: Record<string, string> =
  Object.fromEntries(categories);

async function getRequests(category?: string): Promise<RequestItem[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return [];

  try {
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

    const {
      data: { user },
    } = await supabase.auth.getUser();

    let query = supabase
      .from("requests")
      .select("id, user_id, title, description, category, created_at")
      .order("created_at", { ascending: false });

    if (category && categoryLabels[category]) {
      query = query.eq("category", category);
    }

    const { data, error } = await query;

    if (error || !data) return [];

    let requests = data as RequestItem[];

    if (user) {
      const { data: blocks, error: blockError } = await supabase
        .from("user_blocks")
        .select("blocked_user_id")
        .eq("blocker_id", user.id);

      if (!blockError && blocks) {
        const blockedIds = new Set(
          blocks.map((block) => block.blocked_user_id)
        );

        requests = requests.filter(
          (request) => !blockedIds.has(request.user_id)
        );
      }
    }

    return requests;
  } catch (error) {
    console.error("依頼一覧エラー:", error);
    return [];
  }
}

export default async function RequestsPage({
  searchParams,
}: {
  searchParams?: { category?: string };
}) {
  const category = searchParams?.category;
  const requests = await getRequests(category);

  return (
    <main
      className="container"
      style={{
        maxWidth: "900px",
        margin: "0 auto",
        padding: "24px 16px",
      }}
    >
      <h1>支援を探す</h1>
      <p className="muted">
        あなたにできる支援や、必要としている人の依頼を探せます。
      </p>

      <nav
        className="row"
        aria-label="支援の種類"
        style={{ flexWrap: "wrap", gap: "8px" }}
      >
        <Link className="button secondary" href="/requests">
          すべて
        </Link>

        {categories.map(([value, label]) => (
          <Link
            className="button secondary"
            href={`/requests?category=${value}`}
            key={value}
          >
            {label}
          </Link>
        ))}
      </nav>

      <section className="section">
        <div
          className="row"
          style={{
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h2>
            {category
              ? categoryLabels[category] ?? "依頼一覧"
              : "新着の依頼一覧"}
          </h2>

          <Link className="button" href="/requests/new">
            依頼を投稿する
          </Link>
        </div>

        {requests.length === 0 ? (
          <div className="card">
            <p>現在、公開中の依頼はありません。</p>
            <p className="muted">
              困っていることがあれば、最初の依頼を投稿してみましょう。
            </p>
            <Link className="button" href="/requests/new">
              困りごとを投稿する
            </Link>
          </div>
        ) : (
          <div className="grid">
            {requests.map((request) => (
              <article className="card" key={request.id}>
                <span className="tag">
                  {categoryLabels[request.category ?? "other"] ?? "その他"}
                </span>

                <h3>
                  <Link href={`/requests/${request.id}`}>
                    {request.title || "タイトルなし"}
                  </Link>
                </h3>

                <p>
                  {(request.description || "説明はありません。").slice(
                    0,
                    180
                  )}
                  {(request.description?.length ?? 0) > 180 ? "…" : ""}
                </p>

                {request.created_at && (
                  <p className="muted">
                    投稿日：
                    {new Date(request.created_at).toLocaleDateString("ja-JP")}
                  </p>
                )}

                <Link href={`/requests/${request.id}`}>
                  詳細を見る →
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>

      <p>
        <Link href="/">トップページへ戻る</Link>
      </p>
    </main>
  );
}
