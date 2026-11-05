
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage("ログインできませんでした：" + error.message);
    } else {
      window.location.href = "/requests";
    }

    setLoading(false);
  }

  return (
    <main style={{ maxWidth: 400, margin: "50px auto", padding: 20 }}>
      <h1>ログイン</h1>

      <form onSubmit={handleLogin}>
        <p>メールアドレス</p>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: "100%", padding: 12 }}
        />

        <p>パスワード</p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: "100%", padding: 12 }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{ marginTop: 20, padding: 12, width: "100%" }}
        >
          {loading ? "ログイン中..." : "ログイン"}
        </button>
      </form>

      <p>{message}</p>
    </main>
  );
}
