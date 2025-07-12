import { NextRequest, NextResponse } from "next/server";
import { IngressClient, IngressInput } from "livekit-server-sdk";

export async function POST(req: NextRequest) {
  try {
    const { roomName } = await req.json();

    if (!roomName) {
      return NextResponse.json(
        { error: "缺少房间名" },
        { status: 400 }
      );
    }

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    // 这里要使用https协议的URL，不是wss
    const wsUrl = process.env.LIVEKIT_WS_URL; // LiveKit 的 API URL (https://)

    // 记录环境变量状态（注意不要记录实际的密钥值）
    console.log("环境变量检查 (ingress API):", {
      hasApiKey: !!apiKey,
      hasApiSecret: !!apiSecret,
      wsUrl,
      roomName,
      wsUrlFormat: wsUrl ? (wsUrl.startsWith('https://') ? '正确' : '错误-应以https://开头') : '未设置'
    });

    if (!apiKey || !apiSecret || !wsUrl) {
      const missingVars = [];
      if (!apiKey) missingVars.push("LIVEKIT_API_KEY");
      if (!apiSecret) missingVars.push("LIVEKIT_API_SECRET");
      if (!wsUrl) missingVars.push("LIVEKIT_WS_URL");

      console.error("缺少必要的环境变量:", missingVars.join(", "));

      return NextResponse.json(
        { error: `LiveKit 配置缺失: ${missingVars.join(", ")}` },
        { status: 500 }
      );
    }

    // 检查wsUrl是否是正确的格式(应该是https://而非wss://)
    if (!wsUrl.startsWith('https://')) {
      console.error("LIVEKIT_WS_URL 格式错误:", wsUrl);
      return NextResponse.json({
        error: "LiveKit 配置错误",
        message: "LIVEKIT_WS_URL 应该以 https:// 开头，而不是 wss://",
        currentValue: wsUrl
      }, { status: 500 });
    }

    // 创建 IngressClient
    try {
      console.log("尝试创建 IngressClient...");
      const ingressClient = new IngressClient(wsUrl, apiKey, apiSecret);

      // 创建 RTMP Ingress
      console.log("尝试创建 RTMP Ingress...");
      const ingress = await ingressClient.createIngress(
        IngressInput.RTMP_INPUT, // RTMP 输入
        {
          name: `stream-${roomName}`,
          roomName: roomName,
          participantName: "OBS 直播", // 参与者名称
          participantIdentity: `obs-${roomName}`, // 唯一标识符
        }
      );

      console.log("成功创建 Ingress:", {
        ingressId: ingress.ingressId,
        hasUrl: !!ingress.url,
        hasStreamKey: !!ingress.streamKey,
        roomName: roomName
      });

      // 返回 RTMP 推流 URL 和流密钥
      return NextResponse.json({
        url: ingress.url,
        streamKey: ingress.streamKey,
        ingressId: ingress.ingressId,
      });
    } catch (ingressError: any) {
      console.error("创建 Ingress 详细错误:", ingressError);
      return NextResponse.json(
        {
          error: "创建 Ingress 失败",
          message: ingressError.message || "未知错误",
          details: ingressError.toString()
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("整体错误:", error);
    return NextResponse.json(
      {
        error: "创建 Ingress 失败",
        message: error.message || "未知错误",
        details: error.toString()
      },
      { status: 500 }
    );
  }
} 