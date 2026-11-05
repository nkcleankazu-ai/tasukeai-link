
"use client";

import { useState, type FormEvent } from "react";
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
  }

  async function handleSignUp(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const supabase = createClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMessage("新規登録できませんでした：" + error.message);
    } else if (data.session) {
      window.location.href = "/requests";
      return;
    } else {
      setMessage("登録確認メールを確認してください。メール内のリンクから登録を完了できます。");
    }

    setLoading(false);
  }

  return (
    <main style={{ maxWidth: 400, margin: "50px auto", padding: 20 }}>
      <h1>ログイン・新規登録</h1>

      <p>メールアドレス</p>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        style={{ width: "100%", padding: 12 }}
      />

      <p>パスワード（6文字以上）</p>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={6}
        style={{ width: "100%", padding: 12 }}
      />

      <button
        onClick={() => {
          const form = document.getElementById("login-form") as HTMLFormElement;
          form.requestSubmit();
        }}
        disabled={loading}
        style={{ marginTop: 20, padding: 12, width: "100%" }}
      >
        {loading ? "処理中..." : "ログイン"}
      </button>

      <form id="login-form" onSubmit={handleLogin}>
        <input type="hidden" />
      </form>

      <button
        onClick={() => {
          handleSignUp({
            preventDefault: () => {},
          } as FormEvent<HTMLFormElement>);
        }}
        disabled={loading}
        style={{ marginTop: 12, padding: 12, width: "100%" }}
      >
        新規登録
      </button>

      <p>{message}</p>
    </main>
  );
}
