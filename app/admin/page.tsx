export default function AdminPage() {
  return (
    <main style={{ padding: "24px", maxWidth: "900px", margin: "0 auto" }}>
      <h1>管理者ダッシュボード</h1>
      <p>たすけあいリンク 管理画面</p>

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
        ※ 管理機能は今後追加予定です。
      </p>
    </main>
  );
}
