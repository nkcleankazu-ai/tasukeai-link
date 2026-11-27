if (user) {
  const [outgoing, incoming] = await Promise.all([
    supabase
      .from("user_blocks")
      .select("blocked_user_id")
      .eq("blocker_id", user.id),
    supabase
      .from("user_blocks")
      .select("blocker_id")
      .eq("blocked_user_id", user.id),
  ]);

  if (outgoing.error || incoming.error) {
    console.error("ブロック情報の取得エラー");
    return [];
  }

  const hiddenUserIds = new Set([
    ...(outgoing.data ?? []).map((block) => block.blocked_user_id),
    ...(incoming.data ?? []).map((block) => block.blocker_id),
  ]);

  requests = requests.filter(
    (request) => !hiddenUserIds.has(request.user_id)
  );
}
