import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: ["/", "/assistant/:id*", "/assistant/new", "/api/assistant/:id*" ]
};

export function middleware(req) {
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