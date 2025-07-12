import { AccessToken } from "livekit-server-sdk";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // 从查询参数获取房间名和用户身份
    const { searchParams } = new URL(req.url);
    const room = searchParams.get("room");
    const username = searchParams.get("username");

    console.log("Token API 请求参数:", { room, username });

    // 验证参数
    if (!room) {
      console.error("缺少房间名");
      return NextResponse.json(
        { error: "房间名是必须的" },
        { status: 400 }
      );
    }

    if (!username) {
      console.error("缺少用户名");
      return NextResponse.json(
        { error: "用户名是必须的" },
        { status: 400 }
      );
    }

    // 从环境变量获取 API 密钥
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

    console.log("环境变量检查 (token API):", {
      hasApiKey: !!apiKey,
      hasApiSecret: !!apiSecret,
      wsUrl,
      keyPreview: apiKey ? apiKey.substring(0, 3) + "..." : "未设置",
      secretPreview: apiSecret ? apiSecret.substring(0, 3) + "..." : "未设置"
    });

    if (!apiKey || !apiSecret) {
      const missingVars = [];
      if (!apiKey) missingVars.push("LIVEKIT_API_KEY");
      if (!apiSecret) missingVars.push("LIVEKIT_API_SECRET");

      console.error("缺少必要的环境变量:", missingVars.join(", "));
      return NextResponse.json(
        { error: `LiveKit 配置缺失: ${missingVars.join(", ")}` },
        { status: 500 }
      );
    }

    // 创建 token，设置较长有效期（24小时）
    console.log("开始生成 token...");
    const at = new AccessToken(apiKey, apiSecret, {
      identity: username,
      // 令牌24小时有效
      ttl: 86400
    });

    // 添加所有权限
    at.addGrant({
      roomJoin: true,
      room,
      // 添加所有可能的权限，确保不会因为权限问题导致连接失败
      canPublish: true,
      canSubscribe: true,
      canPublishData: true
    });

    try {
      // toJwt() 是异步方法，需要等待它完成
      const token = await at.toJwt();

      // 记录令牌前10个字符，用于调试（不要记录完整令牌）
      console.log("成功生成 token:", token.substring(0, 10) + "...");

      return NextResponse.json({
        token,
        room,
        username,
        debug: {
          generatedAt: new Date().toISOString(),
          expiresIn: "24 hours"
        }
      });
    } catch (tokenError: any) {
      console.error("生成 token 时出错:", tokenError);
      return NextResponse.json(
        {
          error: "生成 token 失败",
          message: tokenError.message,
          details: tokenError.toString()
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("整体错误:", error);
    return NextResponse.json(
      {
        error: "无法生成令牌",
        message: error.message,
        details: error.toString()
      },
      { status: 500 }
    );
  }
} 