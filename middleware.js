import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: ["/", "/assistant/:id*", "/assistant/new", "/api/assistant/:id*" ]
};

export function middleware(req) {
    const headers = new Headers(req.headers);

    const currentEnv = process.env.NODE_ENV;
    const isHttps = headers.get("x-forwarded-proto")?.split(",")[0] === "https";
    const isLocalhost = req.headers.get("host")?.includes("localhost");

    console.log("MIDDLEWARE INICIAL - currentEnv: ", currentEnv, "isHttps: ", isHttps, "isLocalhost: ", isLocalhost);
    if (currentEnv === "production" && !isHttps && !isLocalhost) {
      const newUrl = new URL(`http://${headers.get("host")}` || "");
      newUrl.protocol = "https:";
      return NextResponse.redirect(newUrl.href, 301);
    }

    const basicAuth = req.headers.get("authorization");
    const url = req.nextUrl;
    if (basicAuth) {
        const authValue = basicAuth.split(" ")[1];
        const [user, pwd] = atob(authValue).split(":");

        const validUser = process.env.BASIC_AUTH_USER;
        const validPassWord = process.env.BASIC_AUTH_PASSWORD;

        if (user === validUser && pwd === validPassWord) {
        return NextResponse.next();
        }
    }

    url.pathname = "/api/auth";

    return NextResponse.rewrite(url);
}

