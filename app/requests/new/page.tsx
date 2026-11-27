"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

const categories = [
  ["money", "お金の支援"],
  ["goods", "物資・食料"],
  ["work", "作業の支援"],
  ["shopping", "買い物"],
  ["cleaning", "掃除"],
  ["cooking", "料理"],
  ["errands", "用事"],
  ["other", "その他"],
] as const;

export default function NewRequestPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("work");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setSaving(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setMessage("依頼の投稿にはログインが必要です。");
        return;
      }

      const { error } = await supabase.from("requests").insert({
        user_id: user.id,
        title: title.trim(),
        description: description.trim(),
        category,
      });

      if (error) {
        console.error("依頼投稿エラー:", error);
        setMessage("投稿できませんでした。入力内容と接続設定を確認してください。");
        return;
      }

      setMessage("依頼を投稿しました！");
      setTitle("");
      setDescription("");
      setCategory("work");
    } catch (error) {
      console.error("依頼投稿エラー:", error);
      setMessage("接続できませんでした。時間をおいて再度お試しください。");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="container">
      <section className="section card">
        <h1>依頼を投稿する</h1>
        <p className="muted">
          助けてほしいことや、依頼したい仕事を入力してください。
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="title">
            依頼のタイトル
            <input
              id="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
              minLength={3}
              maxLength={100}
              placeholder="例：買い物を手伝ってほしい"
            />
          </label>

          <label htmlFor="category">
            カテゴリー
            <select
              id="category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              required
            >
              {categories.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label htmlFor="description">
            困っていること・依頼内容
            <textarea
              id="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              required
              minLength={5}
              maxLength={2000}
              rows={6}
              placeholder="必要な作業、希望する日時、場所などを入力してください。住所や電話番号などの個人情報は公開しないでください。"
            />
          </label>

          <button className="button" type="submit" disabled={saving}>
            {saving ? "投稿中..." : "依頼を投稿する"}
          </button>
        </form>

        {message && <p role="status">{message}</p>}

        <p>
          <Link href="/requests">依頼一覧に戻る</Link>
        </p>
      </section>
    </main>
  );
}
