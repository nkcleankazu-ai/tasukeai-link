"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase";

type Application = {
  id: string;
  applicant_name: string;
  message: string;
  created_at: string;
};

export default function ApplicationsPage() {
  const params = useParams<{ id: string }>();
  const requestId = params.id;

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadApplications() {
      const supabase = createClient();

      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) {
        setErrorMessage("ログインしてください。");
        setLoading(false);
        return;
      }

      const { data: request } = await supabase
        .from("requests")
        .select("id")
        .eq("id", requestId)
        .eq("user_id", userData.user.id)
        .maybeSingle();

      if (!request) {
        setErrorMessage("この依頼の応募内容を見ることはできません。");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .eq("request_id", requestId)
        .order("created_at", { ascending: false });

      if (error) {
        setErrorMessage("応募内容を読み込めませんでした。");
      } else {
        setApplications((data || []) as Application[]);
      }

      setLoading(false);
    }

    if (requestId) {
      loadApplications();
    }
  }, [requestId]);

  return (
    <main className="container">
      <section className="section card">
        <h1>応募一覧</h1>

        <p>
          <Link href={`/requests/${requestId}`}>
            依頼の詳細に戻る
          </Link>
        </p>

        {loading && <p>読み込み中...</p>}

        {!loading && errorMessage && <p>{errorMessage}</p>}

        {!loading && !errorMessage && applications.length === 0 && (
          <p>まだ応募はありません。</p>
        )}

        {!loading &&
          !errorMessage &&
          applications.map((application) => (
            <article key={application.id}>
              <hr />
              <h2>{application.applicant_name}</h2>
              <p>{application.message}</p>
              <p className="muted">
                {new Date(application.created_at).toLocaleString("ja-JP")}
              </p>
            </article>
          ))}
      </section>
    </main>
  );
}