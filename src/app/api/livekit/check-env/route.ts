import { NextResponse } from "next/server";

export async function GET() {
  try {
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const wsUrl = process.env.LIVEKIT_WS_URL;
    const publicUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

    // 检查环境变量
    const envChecks = {
      LIVEKIT_API_KEY: {
        exists: !!apiKey,
        value: apiKey ? `${apiKey.substring(0, 3)}...` : undefined,
      },
      LIVEKIT_API_SECRET: {
        exists: !!apiSecret,
        value: apiSecret ? `${apiSecret.substring(0, 3)}...` : undefined,
      },
      LIVEKIT_WS_URL: {
        exists: !!wsUrl,
        value: wsUrl,
        format: wsUrl ? (wsUrl.startsWith('https://') ? 'correct' : 'incorrect') : undefined,
      },
      NEXT_PUBLIC_LIVEKIT_URL: {
        exists: !!publicUrl,
        value: publicUrl,
        format: publicUrl ? (publicUrl.startsWith('wss://') ? 'correct' : 'incorrect') : undefined,
      },
    };

    // 生成建议修复
    const recommendations = [];

    if (!envChecks.LIVEKIT_API_KEY.exists) {
      recommendations.push({
        variable: 'LIVEKIT_API_KEY',
        reason: '未设置',
      });
    }

    if (!envChecks.LIVEKIT_API_SECRET.exists) {
      recommendations.push({
        variable: 'LIVEKIT_API_SECRET',
        reason: '未设置',
      });
    }

    if (envChecks.LIVEKIT_WS_URL.exists && envChecks.LIVEKIT_WS_URL.format === 'incorrect') {
      recommendations.push({
        variable: 'LIVEKIT_WS_URL',
        reason: '格式错误，应以 "https://" 开头，而非 "wss://"',
      });
    }

    if (envChecks.NEXT_PUBLIC_LIVEKIT_URL.exists && envChecks.NEXT_PUBLIC_LIVEKIT_URL.format === 'incorrect') {
      recommendations.push({
        variable: 'NEXT_PUBLIC_LIVEKIT_URL',
        reason: '格式错误，应以 "wss://" 开头',
      });
    }

    return NextResponse.json({
      checks: envChecks,
      recommendations,
      allValid: recommendations.length === 0,
    });
  } catch (error: any) {
    console.error("检查环境变量时出错:", error);
    return NextResponse.json(
      {
        error: "检查环境变量失败",
        message: error.message,
      },
      { status: 500 }
    );
  }
} 