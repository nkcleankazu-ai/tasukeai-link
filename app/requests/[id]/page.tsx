
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { HelpRequest } from "@/lib/types";
import RequestDetailClient from "./RequestDetailClient";

async function getRequest(id: string): Promise<HelpRequest | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return null;

  try {
    const cookieStore = cookies();

    const supabase = createServerClient(url, key, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server ComponentではCookieを書き込めない場合があります
          }
        },
      },
    });

    const { data, error } = await supabase
      .from("requests")
      .select("id, user_id, title, description, category, created_at")
      .eq("id", id)
      .single();

    if (error || !data) return null;

    return data as HelpRequest;
  } catch (error) {
    console.error("依頼詳細の読み込みエラー:", error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const request = await getRequest(params.id);

  if (!request) {
    return {
      title: "依頼が見つかりません",
      robots: { index: false, follow: false },
    };
  }

  const title = request.title || "支援依頼";
  const description = (request.description || "支援を必要としている人からの依頼です。")
    .replace(/\s+/g, " ")
    .slice(0, 150);

  return {
    title,
    description,
    alternates: {
      canonical: `/requests/${params.id}`,
    },
    openGraph: {
      title: `${title} | たすけあいリンク`,
      description,
      type: "article",
    },
  };
}

export default async function RequestDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const request = await getRequest(params.id);

  if (!request) {
    notFound();
  }

  return <RequestDetailClient request={request} />;
}
