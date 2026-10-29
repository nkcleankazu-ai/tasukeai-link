import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { categoryLabels, type HelpRequest } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Home() {
  let requests: HelpRequest[] = [];
  let configured = true;
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from("help_requests")
      .select("id,title,description,category,prefecture,support_type,status,created_at")
      .eq("status", "published").order("created_at", { ascending: false }).limit(6);
    if (error) throw error;
    requests = (data ?? []) as HelpRequest[];
  } catch { configured = false; }

  return <>
    <section className="hero">
      <span className="tag">全国対応を目指す支援マッチング</span>
      <h1>困っている人と、<br/>助けたい人をつなぐ。</h1>
      <p>お金・物資の支援から、清掃・運搬などの作業支援まで。あなたの「助けたい」を、必要としている人へ届けるための場所です。</p>
      <div className="row"><Link className="button" href="/requests">支援を探す</Link><Link className="button secondary" href="/requests/new">困りごとを投稿</Link></div>
    </section>
    {!configured && <div className="notice">現在は初期セットアップ中です。Supabaseの環境変数とSQL設定を完了すると、実際の依頼データが表示されます。</div>}
    <section className="section">
      <h2>どんな支援を探していますか？</h2>
      <div className="grid">
        <Link className="card" href="/requests?category=money"><span className="tag">お金の支援</span><h3>生活の困りごと</h3><p className="muted">支援の募集や必要な費用について相談する。</p></Link>
        <Link className="card" href="/requests?category=goods"><span className="tag">物資・食料</span><h3>必要なものを届ける</h3><p className="muted">食料、日用品、家具などの支援を探す。</p></Link>
        <Link className="card" href="/requests?category=work"><span className="tag">作業の支援</span><h3>手を貸してほしい</h3><p className="muted">清掃、運搬、草刈りなどの助け合い。</p></Link>
      </div>
    </section>
    <section className="section">
      <h2>新着の支援依頼</h2>
      {requests.length === 0 ? <div className="card"><p>公開中の依頼はまだありません。</p><p className="muted">最初の依頼を投稿して、支援の輪を広げましょう。</p><Link className="button" href="/requests/new">依頼を投稿する</Link></div> :
        <div className="grid">{requests.map(r => <Link key={r.id} className="card" href={`/requests/${r.id}`}>
          <span className="tag">{categoryLabels[r.category]}</span><h3>{r.title}</h3><p className="muted">{r.prefecture || "地域相談可"} ・ {new Date(r.created_at).toLocaleDateString("ja-JP")}</p><p>{r.description.slice(0,100)}{r.description.length>100?"…":""}</p>
        </Link>)}</div>}
    </section>
    <section className="section card">
      <h2>安心して使うために</h2><p className="muted">公開前に本人確認、通報対応、禁止事項、返金条件を整備します。支援金の決済・分配機能は、決済会社の審査と法的確認が終わるまで有効化しません。</p><Link href="/safety">安全ガイドを読む →</Link>
    </section>
  </>;
}
