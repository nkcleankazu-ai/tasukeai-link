import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminPage() {
  const supabase = createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  // ログインしていない場合
  if (error || !user) {
    redirect("/login");
  }

  // 管理者かどうか確認
  const { data: admin } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  // 管理者でなければ依頼一覧へ
  if (!admin) {
    redirect("/requests");
  }

  return (
    <main
      style={{
        padding: "24px",
        maxWidth: "900px",
        margin: "0 auto",
      }}
    >
      <h1>管理者ダッシュボード</h1>
      <p>たすけあいリンク管理画面</p>

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
