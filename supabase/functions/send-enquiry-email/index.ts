import { serve } from "https://deno.land/std@0.224.0/http/server.ts"

declare const Deno: {
  env: {
    get(name: string): string | undefined
  }
}

const allowedOrigins = [
  "https://mauli-international-website.vercel.app",
  "http://localhost:5173",
]

const corsHeaders = {
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

function escapeHtml(value: unknown) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char]!)
}

serve(async (req: Request) => {
  const origin = req.headers.get("origin") ?? ""

  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        ...corsHeaders,
        "Access-Control-Allow-Origin": origin,
      },
    })
  }

  if (!allowedOrigins.includes(origin)) {
    return new Response(
      JSON.stringify({ error: "Origin not allowed" }),
      { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 })
  }

  try {
    const apiKey = Deno.env.get("RESEND_API_KEY")
    const toEmail = Deno.env.get("ENQUIRY_TO_EMAIL")
    const fromEmail = Deno.env.get("EMAIL_FROM")

    if (!apiKey || !toEmail || !fromEmail) {
      throw new Error("Email configuration is incomplete")
    }

    const data = await req.json()

    const required = ["customer_name", "email", "product_name"]

    for (const field of required) {
      if (!String(data[field] ?? "").trim()) {
        return new Response(
          JSON.stringify({ error: `Missing ${field}` }),
          { status: 400, headers: { ...corsHeaders, "Access-Control-Allow-Origin": origin, "Content-Type": "application/json" } }
        )
      }
    }

    const emailHtml = `
      <h2>New Website Enquiry - Mauli International</h2>
      <p><strong>Customer:</strong> ${escapeHtml(data.customer_name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(data.email)}</p>
      <p><strong>Company:</strong> ${escapeHtml(data.company)}</p>
      <p><strong>Product:</strong> ${escapeHtml(data.product_name)}</p>
      <p><strong>Quantity:</strong> ${escapeHtml(data.quantity)}</p>
      <p><strong>Destination:</strong> ${escapeHtml(data.destination_country)}</p>
      <p><strong>Message:</strong></p>
      <p>${escapeHtml(data.message)}</p>
    `

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        reply_to: data.email,
        subject: `New Enquiry: ${data.product_name}`,
        html: emailHtml,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      console.error("Resend error:", result)
      throw new Error("Email provider rejected the request")
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Access-Control-Allow-Origin": origin,
          "Content-Type": "application/json",
        },
      }
    )
  } catch (error) {
    console.error(error)

    return new Response(
      JSON.stringify({ error: "Unable to send enquiry notification" }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Access-Control-Allow-Origin": origin,
          "Content-Type": "application/json",
        },
      }
    )
  }
})