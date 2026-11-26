
import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl = "https://tasukeai-link.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "たすけあいリンク｜生活支援・仕事・職人の助け合いマッチング",
    template: "%s｜たすけあいリンク",
  },
  description:
    "たすけあいリンクは、困っている人と助けたい人、仕事を依頼したい人と職人をつなぐマッチングサービスです。生活支援、食料・物資、清掃、運搬、買い物、建設、外構、修理などの依頼を探せます。",
  keywords: [
    "助け合い",
    "生活支援",
    "支援募集",
    "仕事依頼",
    "職人",
    "建設",
    "外構工事",
    "清掃",
    "不用品回収",
    "運搬",
    "買い物代行",
    "地域支援",
    "マッチングサービス",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: siteUrl,
    siteName: "たすけあいリンク",
    title: "たすけあいリンク｜困りごとと仕事をつなぐ",
    description:
      "生活の困りごとから職人への仕事依頼まで。助けたい人と必要としている人をつなぎます。",
  },
  twitter: {
    card: "summary_large_image",
    title: "たすけあいリンク",
    description: "困っている人と、助けたい人をつなぐ。",
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: "/manifest.webmanifest",
  verification: {
    google: "F3JJk3VO2c2HJnGIbgzggxLa7JgawZfTAf9zIpVoTZY",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "たすけあいリンク",
  },
};

export const viewport: Viewport = {
  themeColor: "#173d35",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        <header className="top">
          <div className="wrap top-inner">
            <a className="brand" href="/">
              ♥ たすけあいリンク
              <small>助けたい気持ちを、必要な人へ。</small>
            </a>
            <nav className="nav">
              <a href="/requests">依頼を探す</a>
              <a href="/requests/new">依頼する</a>
              <a href="/login">ログイン</a>
              <a href="/account">マイページ</a>
              <a href="/admin">管理者</a>
            </nav>
          </div>
        </header>

        <main className="wrap">{children}</main>

        <footer className="footer">
          <div className="wrap">
            <p>たすけあいリンク</p>
            <p>
              支援金の受け渡しは現在未実装です。
              緊急時は公的窓口・警察・消防などへ直接ご相談ください。
            </p>
            <p>
              <a href="/safety">安全ガイド</a>{" "}
              <a href="/terms">利用規約（草案）</a>{" "}
              <a href="/privacy">プライバシー（草案）</a>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
