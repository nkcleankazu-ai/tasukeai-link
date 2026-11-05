
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

export default function NewRequestPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("money");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setSaving(true);

    try {
      const supabase = createClient();
　　　const {
  data: { user },
  error: userError,
} = await supabase.auth.getUser();

if (userError || !user) {
  setMessage("ログインしてください。");
  setSaving(false);
  return;
}
      const { error } = await supabase.from("requests").insert({
        user_id: user.id,
        title: title.trim(),
        description: description.trim(),
        category,
      });

      if (error) {
        console.error("投稿エラー:",error);
        setMessage("保存エラー: " + error.message);
        console.error(error);
      } else {
        setMessage("依頼を投稿しました！");
        setTitle("");
        setDescription("");
        setCategory("work");
      }
    } catch (error) {
      console.error(error);
      setMessage("接続できませんでした。設定を確認してください。");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="container">
      <section className="section card">
        <h1>依頼を投稿する</h1>
        <p className="muted">助けてほしいことを入力してください。</p>

        <form onSubmit={handleSubmit}>
          <p>
            <label htmlFor="title">依頼のタイトル</label>
            <input
              id="title"
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={100}
              placeholder="例：買い物を手伝ってほしい"
            />
          </p>

          <p>
            <label htmlFor="category">カテゴリー</label>
            <select
              id="category"
              className="input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="money">お金の支援</option>
<option value="goods">必要なものを届ける</option>
<option value="work">手を貸してほしい</option>
            </select>
          </p>

          <p>
            <label htmlFor="description">困っていることの説明</label>
            <textarea
              id="description"
              className="input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={5}
              maxLength={2000}
              placeholder="どのような助けが必要か入力してください"
            />
          </p>

          <button className="button" type="submit" disabled={saving}>
            {saving ? "保存中..." : "依頼を投稿する"}
          </button>
        </form>

        {message && <p role="status">{message}</p>}

        <p><Link href="/">トップページに戻る</Link></p>
      </section>
    </main>
  );
}
