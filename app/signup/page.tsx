"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignUp(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!agreed) {
      setMessage("利用規約とプライバシーポリシーへの同意が必要です。");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setMessage("登録できませんでした：" + error.message);
      } else if (data.session) {
        window.location.href = "/requests";
        return;
      } else {
        setMessage("確認メールを確認してください。メール内のリンクから登録を完了できます。");
      }
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "エラーが発生しました。"
      );
    }

    setLoading(false);
  }

  return (
    <main style={{ maxWidth: "420px", margin: "40px auto", padding: "24px" }}>
      <h1>新規会員登録</h1>

      <form onSubmit={handleSignUp}>
        <p>メールアドレス</p>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          style={{ width: "100%", padding: "12px", boxSizing: "border-box" }}
        />

        <p>パスワード（6文字以上）</p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          autoComplete="new-password"
          style={{ width: "100%", padding: "12px", boxSizing: "border-box" }}
        />

        <label style={{ display: "block", marginTop: "20px" }}>
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
          />
          {" "}利用規約と
          <Link href="/terms">利用規約</Link>・
          <Link href="/privacy">プライバシーポリシー</Link>
          に同意する
        </label>

        <button
          type="submit"
          disabled={loading || !agreed}
          style={{ width: "100%", padding: "14px", marginTop: "20px" }}
        >
          {loading ? "登録中..." : "無料で会員登録"}
        </button>
      </form>

      <p role="status">{message}</p>
      <Link href="/login">ログイン画面へ戻る</Link>
    </main>
  );
}
