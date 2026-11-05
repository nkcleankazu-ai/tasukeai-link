"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Message = {
	id: string | number;
	name: string;
	content: string;
	createdAt?: string;
};

type ApiResponse = {
	messages?: Message[];
	error?: string;
};

export default function MessagePage() {
	const params = useParams();
	const routeParams = params as Record<string, string | string[] | undefined>;
	const rawAccessCode = routeParams.accessCode ?? routeParams["access Code"];
	const accessCode = Array.isArray(rawAccessCode) ? rawAccessCode[0] : rawAccessCode;

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

		setError("");
		try {
			const response = await fetch(`/api/messages/${encodeURIComponent(accessCode)}`);
			const data = (await response.json()) as ApiResponse;
			if (!response.ok) {
				throw new Error(data.error || "メッセージの取得に失敗しました。");
			}
			setMessages(Array.isArray(data.messages) ? data.messages : []);
		} catch (requestError) {
			setError(
				requestError instanceof Error
					? requestError.message
					: "メッセージの取得に失敗しました。",
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
		alert("送信ボタンが押されました");

		if (!accessCode) {
			setError("アクセスコードを取得できませんでした。");
			return;
		}
		if (!name.trim() || !content.trim()) {
			setError("名前とメッセージを入力してください。");
			return;
		}

		setSending(true);
		setError("");
		try {
			const response = await fetch(`/api/messages/${encodeURIComponent(accessCode)}`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name: name.trim(), content: content.trim() }),
			});
			const data = (await response.json()) as ApiResponse;
			if (!response.ok) {
				throw new Error(data.error || "メッセージの送信に失敗しました。");
			}

			setContent("");
			await loadMessages();
		} catch (requestError) {
			setError(
				requestError instanceof Error
					? requestError.message
					: "メッセージの送信に失敗しました。",
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
						className="w-full rounded border p-2"
					/>
				</label>
				<label className="block">
					<span className="mb-1 block">メッセージ</span>
					<textarea
						value={content}
						onChange={(event) => setContent(event.target.value)}
						maxLength={5000}
						required
						rows={4}
						className="w-full rounded border p-2"
					/>
				</label>
				<button
					type="submit"
					disabled={sending || !name.trim() || !content.trim()}
					className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
				>
					{sending ? "送信中…" : "送信"}
				</button>
			</form>

			<section aria-label="メッセージ一覧">
				<h2 className="mb-3 text-xl font-semibold">メッセージ一覧</h2>
				{loading ? (
					<p>読み込み中…</p>
				) : messages.length === 0 ? (
					<p>メッセージはまだありません。</p>
				) : (
					<ul className="space-y-3">
						{messages.map((message, index) => (
							<li key={message.id ?? index} className="rounded border p-3">
								<p className="font-medium">{message.name}</p>
								<p className="whitespace-pre-wrap">{message.content}</p>
								{message.createdAt && (
									<time className="mt-2 block text-sm text-gray-500">
										{new Date(message.createdAt).toLocaleString()}
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
