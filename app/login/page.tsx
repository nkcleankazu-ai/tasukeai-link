"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage("ログインできませんでした：" + error.message);
        setLoading(false);
        return;
      }

      window.location.href = "/requests";
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "エラーが発生しました。"
      );
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: "420px", margin: "40px auto", padding: "24px" }}>
      <h1>ログイン</h1>

      <form onSubmit={handleLogin}>
        <p>メールアドレス</p>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          style={{ width: "100%", padding: "12px", boxSizing: "border-box" }}
        />

        <p>パスワード</p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          style={{ width: "100%", padding: "12px", boxSizing: "border-box" }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{ width: "100%", padding: "14px", marginTop: "20px" }}
        >
          {loading ? "ログイン中…" : "ログイン"}
        </button>
      </form>

      <p role="status">{message}</p>

      <hr />

      <p>初めてご利用の方はこちら</p>
      <Link href="/signup">新規会員登録</Link>
    </main>
  );
}
