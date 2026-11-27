import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminPage() {
  const supabase = createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) redirect("/login");

  const { data: admin } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!admin) redirect("/requests");

  const { data: reports, error: reportError } = await supabase
    .from("reports")
    .select(
      "id, reporter_id, reported_user_id, request_id, category, description, reason, created_at"
    )
    .order("created_at", { ascending: false });

  return (
    <main style={{ padding: "24px", maxWidth: "900px", margin: "0 auto" }}>
      <h1>管理者ダッシュボード</h1>
      <p>たすけあいリンク管理画面</p>

      <section style={{ marginTop: "24px" }}>
        <h2>通報管理</h2>

        {reportError ? (
          <p>通報一覧を読み込めませんでした。</p>
        ) : !reports || reports.length === 0 ? (
          <p>現在、通報はありません。</p>
        ) : (
          reports.map((report) => (
            <article
              key={report.id}
              style={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "16px",
                marginBottom: "12px",
              }}
            >
              <p>通報日時：{new Date(report.created_at).toLocaleString("ja-JP")}</p>
              <p>理由：{report.category || report.reason || "未入力"}</p>
              <p>詳細：{report.description || "記載なし"}</p>
              <p>対象依頼ID：{report.request_id}</p>
              <p>通報対象ユーザーID：{report.reported_user_id || "未登録"}</p>
              <p>通報者ID：{report.reporter_id}</p>
            </article>
          ))
        )}
      </section>

      <section style={{ marginTop: "24px" }}>
        <h2>管理メニュー</h2>
        <ul>
          <li>ユーザー管理</li>
          <li>依頼管理</li>
          <li>支援金管理</li>
          <li>通報・問い合わせ管理</li>
        </ul>
      </section>

      <p style={{ marginTop: "30px", color: "#777" }}>
        管理者としてログインしています。
      </p>
    </main>
  );
}
