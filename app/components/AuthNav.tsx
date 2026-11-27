"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

export default function AuthNav() {
  const [signedIn, setSignedIn] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data }) => {
      setSignedIn(!!data.session);
      setReady(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(!!session);
      setReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (!error) window.location.href = "/";
  }

  return (
    <>
      <Link href="/requests">依頼を探す</Link>
      <Link href="/requests/new">依頼する</Link>

      {ready && signedIn ? (
        <>
          <Link href="/account">マイページ</Link>
          <button type="button" onClick={handleLogout}>
            ログアウト
          </button>
        </>
      ) : (
        <>
          <Link href="/login">ログイン</Link>
          <Link href="/signup">新規会員登録</Link>
        </>
      )}

      <Link href="/admin">管理者</Link>
    </>
  );
}
