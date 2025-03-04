import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// -----------------------------------------------------------------------------

// Auth拦截中间件
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 网站数据上报公开接口
  if (pathname.startsWith("/api")) {
    // 设置跨域
    const res = NextResponse.next();
    res.headers.set("Access-Control-Allow-Origin", "*");
    res.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, DELETE");
    res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.headers.set("Access-Control-Max-Age", "86400"); // 设置跨域请求的最大缓存时间为86400秒，即24小时
    return res;
  }
}
