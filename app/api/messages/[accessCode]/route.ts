import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

type RouteContext = {
	params: Promise<{ accessCode: string }> | { accessCode: string };
};

function getSupabase() {
	const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

	if (!url || !serviceRoleKey) {
		throw new Error("Supabase server configuration is missing");
	}

	return createClient(url, serviceRoleKey, {
		auth: { autoRefreshToken: false, persistSession: false },
	});
}

async function findApplication(accessCode: string) {
	const supabase = getSupabase();
	const { data, error } = await supabase
		.from("applications")
		.select("id")
		.eq("access_code", accessCode)
		.maybeSingle();

	if (error) throw error;
	return data;
}

export async function GET(_request: Request, context: RouteContext) {
	try {
		const { accessCode } = await context.params;
		if (!accessCode?.trim()) {
			return NextResponse.json({ error: "Invalid access code" }, { status: 401 });
		}

		const application = await findApplication(accessCode);
		if (!application) {
			return NextResponse.json({ error: "Invalid access code" }, { status: 401 });
		}

		const { data, error } = await getSupabase()
			.from("messages")
			.select("*")
			.eq("application_id", application.id)
			.order("created_at", { ascending: true });

		if (error) throw error;
		return NextResponse.json({ messages: data });
	} catch {
		return NextResponse.json({ error: "Failed to retrieve messages" }, { status: 500 });
	}
}

export async function POST(request: Request, context: RouteContext) {
	try {
		const { accessCode } = await context.params;
		if (!accessCode?.trim()) {
			return NextResponse.json({ error: "Invalid access code" }, { status: 401 });
		}

		const application = await findApplication(accessCode);
		if (!application) {
			return NextResponse.json({ error: "Invalid access code" }, { status: 401 });
		}

		let payload: unknown;
		try {
			payload = await request.json();
		} catch {
			return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 });
		}

		if (typeof payload !== "object" || payload === null) {
			return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
		}

		const body = payload as Record<string, unknown>;
		const senderName = typeof body.senderName === "string" ? body.senderName.trim() : "";
		const messageBody = typeof body.body === "string" ? body.body.trim() : "";

		if (!senderName || senderName.length > 100 || !messageBody || messageBody.length > 10_000) {
			return NextResponse.json(
				{ error: "senderName (1–100 characters) and body (1–10000 characters) are required" },
				{ status: 400 },
			);
		}

		const { data, error } = await getSupabase()
			.from("messages")
			.insert({
				application_id: application.id,
				sender_name: senderName,
				message: messageBody,
			})
			.select("*")
			.single();

		if (error) throw error;
		return NextResponse.json({ message: data }, { status: 201 });
	} catch (error) {
		console.error("Failed to save message:", error);
		return NextResponse.json({ error: "Failed to save message" }, { status: 500 });
	}
}
