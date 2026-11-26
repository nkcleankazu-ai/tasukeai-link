
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ accessCode: string }> | { accessCode: string };
};

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Server configuration is missing");
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function getAuthenticatedUser() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Supabase configuration is missing");
  }

  const cookieStore = cookies();

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: any[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Cookieを書き込めない場合があります
        }
      },
    },
  });

  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) return null;
  return data.user;
}

async function getAuthorizedApplication(
  accessCode: string,
  userId: string
) {
  const supabase = getServiceClient();

  const { data: application, error } = await supabase
    .from("applications")
    .select("id, applicant_user_id, request_id")
    .eq("access_code", accessCode)
    .maybeSingle();

  if (error || !application) return null;

  const { data: request, error: requestError } = await supabase
    .from("requests")
    .select("user_id")
    .eq("id", application.request_id)
    .maybeSingle();

  if (requestError || !request) return null;

  const isApplicant = application.applicant_user_id === userId;
  const isRequestOwner = request.user_id === userId;

  if (!isApplicant && !isRequestOwner) return null;

  return application;
}

function getSenderName(user: {
  user_metadata?: Record<string, unknown>;
  email?: string;
}) {
  const metadataName = user.user_metadata?.full_name;
  const name = typeof metadataName === "string" ? metadataName.trim() : "";

  if (name) return name.slice(0, 100);
  return user.email?.slice(0, 100) || "ログインユーザー";
}

export async function GET(
  _request: Request,
  context: RouteContext
) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { error: "ログインしてください。" },
        { status: 401 }
      );
    }

    const { accessCode } = await context.params;

    if (!accessCode?.trim()) {
      return NextResponse.json(
        { error: "アクセスコードが無効です。" },
        { status: 401 }
      );
    }

    const application = await getAuthorizedApplication(
      accessCode,
      user.id
    );

    if (!application) {
      return NextResponse.json(
        { error: "このメッセージを閲覧する権限がありません。" },
        { status: 403 }
      );
    }

    const { data, error } = await getServiceClient()
      .from("messages")
      .select("*")
      .eq("application_id", application.id)
      .order("created_at", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ messages: data });
  } catch (error) {
    console.error("Message retrieval failed:", error);
    return NextResponse.json(
      { error: "メッセージを取得できませんでした。" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  context: RouteContext
) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { error: "ログインしてください。" },
        { status: 401 }
      );
    }

    const { accessCode } = await context.params;

    if (!accessCode?.trim()) {
      return NextResponse.json(
        { error: "アクセスコードが無効です。" },
        { status: 401 }
      );
    }

    const application = await getAuthorizedApplication(
      accessCode,
      user.id
    );

    if (!application) {
      return NextResponse.json(
        { error: "このメッセージを送信する権限がありません。" },
        { status: 403 }
      );
    }

    let payload: unknown;

    try {
      payload = await request.json();
    } catch {
      return NextResponse.json(
        { error: "送信内容を確認してください。" },
        { status: 400 }
      );
    }

    if (typeof payload !== "object" || payload === null) {
      return NextResponse.json(
        { error: "送信内容が正しくありません。" },
        { status: 400 }
      );
    }

    const body = payload as Record<string, unknown>;
    const messageBody =
      typeof body.body === "string" ? body.body.trim() : "";

    if (!messageBody || messageBody.length > 10000) {
      return NextResponse.json(
        { error: "メッセージは1〜10000文字で入力してください。" },
        { status: 400 }
      );
    }

    const { data, error } = await getServiceClient()
      .from("messages")
      .insert({
        application_id: application.id,
        sender_name: getSenderName(user),
        message: messageBody,
      })
      .select("*")
      .single();

    if (error) throw error;

    return NextResponse.json(
      { message: data },
      { status: 201 }
    );
  } catch (error) {
    console.error("Message sending failed:", error);
    return NextResponse.json(
      { error: "メッセージを送信できませんでした。" },
      { status: 500 }
    );
  }
}
