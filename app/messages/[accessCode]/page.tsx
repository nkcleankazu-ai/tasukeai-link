
"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Message = {
  id: string | number;
  sender_name: string;
  message: string;
  created_at?: string;
};

type ApiResponse = {
  messages?: Message[];
  message?: Message;
  error?: string;
};

export default function MessagePage() {
  const params = useParams<{ accessCode: string }>();
  const accessCode = params.accessCode;

  const [messages, setMessages] = useState<Message[]>([]);
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const loadMessages = useCallback(async () => {
    if (!accessCode) {
      setError("アクセスコードを取得できませんでした。");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `/api/messages/${encodeURIComponent(accessCode)}`
      );
      const data = (await response.json()) as ApiResponse;

      if (!response.ok) {
        throw new Error(data.error || "メッセージを取得できませんでした。");
      }

      setMessages(Array.isArray(data.messages) ? data.messages : []);
      setError("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "読み込みに失敗しました。"
      );
    } finally {
      setLoading(false);
    }
  }, [accessCode]);

  useEffect(() => {
    void loadMessages();
  }, [loadMessages]);

  async function handleSend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim() || !content.trim()) {
      setError("名前とメッセージを入力してください。");
      return;
    }

    setSending(true);
    setError("");

    try {
      const response = await fetch(
        `/api/messages/${encodeURIComponent(accessCode)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            senderName: name.trim(),
            body: content.trim(),
          }),
        }
      );

      const data = (await response.json()) as ApiResponse;

      if (!response.ok) {
        throw new Error(data.error || "送信に失敗しました。");
      }

      setContent("");
      await loadMessages();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "送信に失敗しました。"
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-2xl p-4">
      <h1 className="mb-6 text-2xl font-bold">メッセージ</h1>

      {error && (
        <p role="alert" className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-red-700">
          {error}
        </p>
      )}

      <form onSubmit={handleSend} className="mb-8 space-y-4">
        <label className="block">
          <span className="mb-1 block">名前</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={100}
            required
            className="w-full rounded border p-3"
          />
        </label>

        <label className="block">
          <span className="mb-1 block">メッセージ</span>
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            maxLength={10000}
            required
            rows={4}
            className="w-full rounded border p-3"
          />
        </label>

        <button
          type="submit"
          disabled={sending || !name.trim() || !content.trim()}
          className="rounded bg-blue-600 px-5 py-3 text-white disabled:opacity-50"
        >
          {sending ? "送信中..." : "送信する"}
        </button>
      </form>

      <section aria-label="メッセージ一覧">
        <h2 className="mb-3 text-xl font-semibold">メッセージ一覧</h2>

        {loading ? (
          <p>読み込み中...</p>
        ) : messages.length === 0 ? (
          <p>メッセージはまだありません。</p>
        ) : (
          <ul className="space-y-3">
            {messages.map((item) => (
              <li key={item.id} className="rounded border p-4">
                <p className="font-semibold">{item.sender_name}</p>
                <p className="whitespace-pre-wrap">{item.message}</p>
                {item.created_at && (
                  <time className="mt-2 block text-sm text-gray-500">
                    {new Date(item.created_at).toLocaleString("ja-JP")}
                  </time>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
