import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// -----------------------------------------------------------------------------

// Auth拦截中间件
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api")) {
    // 设置跨域
    if (request.method === "OPTIONS") {
      // 处理预检请求
      const response = new NextResponse(null, { status: 204 });
      response.headers.set("Access-Control-Allow-Origin", "*");
      response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, DELETE");
      response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
      response.headers.set("Access-Control-Max-Age", "86400");
      return response;
    }
    
    // 处理实际请求
    const res = NextResponse.next();
    res.headers.set("Access-Control-Allow-Origin", "*");
    res.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, DELETE");
    res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.headers.set("Access-Control-Max-Age", "86400"); // 设置跨域请求的最大缓存时间为86400秒，即24小时
    return res;
  }
}
