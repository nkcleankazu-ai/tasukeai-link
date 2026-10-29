import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "たすけあいリンク | 困りごとと助けたい気持ちをつなぐ",
  description: "全国の困りごとと、助けたい気持ちをつなぐマッチングサービス。",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "たすけあいリンク" }
};
export const viewport: Viewport = { themeColor: "#173d35", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ja"><body>
    <header className="top"><div className="wrap top-inner">
      <a className="brand" href="/">♡ たすけあいリンク<small>助けたい気持ちを、必要な人へ。</small></a>
      <nav className="nav">
        <a href="/requests">依頼を探す</a><a href="/requests/new">依頼する</a><a href="/account">マイページ</a><a href="/admin">管理者</a>
      </nav>
    </div></header>
    <main className="wrap">{children}</main>
    <footer className="footer"><div className="wrap">
      <p>たすけあいリンク — 試作版</p>
      <p>支援金の受け渡しは現在未実装です。緊急時は公的窓口・警察・消防などへ直接ご相談ください。</p>
      <p><a href="/safety">安全ガイド</a>　<a href="/terms">利用規約（草案）</a>　<a href="/privacy">プライバシー（草案）</a></p>
    </div></footer>
  </body></html>;
}
