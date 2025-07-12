"use client";

import { useEffect, useState } from "react";
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
  useConnectionState
} from '@livekit/components-react';
import '@livekit/components-styles';
import Link from "next/link";

// 环境检查结果类型
interface EnvCheckResult {
  checks: {
    LIVEKIT_API_KEY: { exists: boolean; value?: string };
    LIVEKIT_API_SECRET: { exists: boolean; value?: string };
    LIVEKIT_WS_URL: { exists: boolean; value?: string; format?: string };
    NEXT_PUBLIC_LIVEKIT_URL: { exists: boolean; value?: string; format?: string };
  };
  recommendations: Array<{ variable: string; reason: string }>;
  allValid: boolean;
}

export default function StreamPage() {
  const [token, setToken] = useState("");
  const [roomName, setRoomName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [rtmpUrl, setRtmpUrl] = useState("");
  const [streamKey, setStreamKey] = useState("");
  const [showStreamKey, setShowStreamKey] = useState(false);
  const [creatingIngress, setCreatingIngress] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("");
  const [ingressId, setIngressId] = useState("");
  const [error, setError] = useState("");
  const [showError, setShowError] = useState(false);
  const [connectionError, setConnectionError] = useState("");
  const [checkingEnv, setCheckingEnv] = useState(false);
  const [envCheckResult, setEnvCheckResult] = useState<EnvCheckResult | null>(null);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        // 设置直播间名称 - 固定房间名以确保一致性
        const streamRoomName = "live-stream-room";
        // 用户名 - 实际应用中应该从身份验证系统获取
        const username = "stream-viewer";

        console.log("开始获取 token...");

        // 从API获取直播令牌
        const response = await fetch(`/api/livekit/token?room=${streamRoomName}&username=${username}`);

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Token API 错误:", errorData);
          throw new Error(errorData.message || 'Token API 请求失败');
        }

        const data = await response.json();
        console.log("成功获取 token", data);
        setToken(data.token);
        setRoomName(streamRoomName);
        setIsLoading(false);
      } catch (error: any) {
        console.error("获取token失败:", error);
        setError(`获取令牌失败: ${error.message || '未知错误'}`);
        setIsLoading(false);
      }
    };

    fetchToken();
  }, []);

  // 创建 Ingress 获取 RTMP URL 和流密钥
  const createIngress = async () => {
    setCreatingIngress(true);
    setError("");
    try {
      // 确保使用相同的房间名
      const ingressRoomName = roomName || "live-stream-room";

      console.log("创建 Ingress, 房间名:", ingressRoomName);

      const response = await fetch('/api/livekit/ingress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomName: ingressRoomName,
        }),
      });

      const responseData = await response.json();

      console.log("Ingress API 响应:", responseData);

      if (!response.ok) {
        throw new Error(responseData.message || responseData.error || '创建 Ingress 失败');
      }

      setRtmpUrl(responseData.url);
      setStreamKey(responseData.streamKey);
      setIngressId(responseData.ingressId);
      console.log("成功创建 Ingress:", responseData);
    } catch (error: any) {
      console.error("创建 Ingress 失败:", error);
      setError(`创建直播配置失败: ${error.message || '未知错误'}`);
      setShowError(true);
    } finally {
      setCreatingIngress(false);
    }
  };

  // 复制文本到剪贴板
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("已复制到剪贴板");
  };

  // LiveKit Room 连接错误处理
  const handleRoomError = (err: Error) => {
    console.error("LiveKit Room 连接错误:", err);
    setConnectionError(err.message || "连接失败");
  };

  // 检查环境变量配置
  const checkEnvironment = async () => {
    setCheckingEnv(true);
    try {
      const response = await fetch('/api/livekit/check-env');
      const data = await response.json();
      console.log("环境检查结果:", data);
      setEnvCheckResult(data as EnvCheckResult);
    } catch (error: any) {
      console.error("检查环境变量失败:", error);
      setError(`检查环境配置失败: ${error.message}`);
    } finally {
      setCheckingEnv(false);
    }
  };

  // 连接状态组件
  function ConnectionStateDisplay() {
    const connectionState = useConnectionState();

    useEffect(() => {
      console.log("连接状态变更:", connectionState);
      setConnectionStatus(connectionState);
    }, [connectionState]);

    return (
      <div className={`mt-2 py-1 px-3 rounded inline-block ${connectionState === 'connected'
        ? 'bg-green-100 text-green-800'
        : connectionState === 'connecting'
          ? 'bg-yellow-100 text-yellow-800'
          : 'bg-red-100 text-red-800'
        }`}>
        状态: {
          connectionState === 'connected'
            ? '已连接'
            : connectionState === 'connecting'
              ? '连接中...'
              : '未连接'
        }
      </div>
    );
  }

  // 重新连接按钮
  const reconnectToRoom = async () => {
    setIsLoading(true);
    setConnectionError("");
    try {
      const streamRoomName = "live-stream-room";
      const username = "stream-viewer-" + Math.floor(Math.random() * 1000); // 使用随机用户名避免冲突

      console.log("尝试重新连接, 新用户名:", username);

      const response = await fetch(`/api/livekit/token?room=${streamRoomName}&username=${username}`);

      if (!response.ok) {
        throw new Error("重新获取 token 失败");
      }

      const data = await response.json();
      setToken(data.token);
      console.log("已获取新 token, 准备重连");
    } catch (error: any) {
      console.error("重连失败:", error);
      setError(`重新连接失败: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 环境变量检查结果显示
  const renderEnvCheckResults = () => {
    if (!envCheckResult) return null;

    return (
      <div className="mt-2 text-sm">
        <h4 className={`font-medium ${envCheckResult.allValid ? 'text-green-600' : 'text-red-600'}`}>
          {envCheckResult.allValid ? '✓ 所有环境变量配置正确' : '⚠️ 环境变量配置存在问题'}
        </h4>

        {envCheckResult.recommendations.length > 0 && (
          <div className="mt-2">
            <h5 className="font-medium">建议修复:</h5>
            <ul className="list-disc list-inside pl-2 mt-1">
              {envCheckResult.recommendations.map((rec, idx) => (
                <li key={idx} className="text-red-600">
                  <span className="font-mono">{rec.variable}</span>: {rec.reason}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-2 p-2 bg-gray-100 rounded text-xs font-mono">
          <div>LIVEKIT_API_KEY: {envCheckResult.checks.LIVEKIT_API_KEY.exists ? '✓' : '✗'}</div>
          <div>LIVEKIT_API_SECRET: {envCheckResult.checks.LIVEKIT_API_SECRET.exists ? '✓' : '✗'}</div>
          <div>
            LIVEKIT_WS_URL: {envCheckResult.checks.LIVEKIT_WS_URL.exists ? (
              <>
                {envCheckResult.checks.LIVEKIT_WS_URL.format === 'correct' ? '✓' : '✗'}
                {envCheckResult.checks.LIVEKIT_WS_URL.value}
                {envCheckResult.checks.LIVEKIT_WS_URL.format === 'incorrect' &&
                  <span className="text-red-500 ml-1">(格式错误: 应以 https:// 开头)</span>
                }
              </>
            ) : '✗ 未设置'}
          </div>
          <div>
            NEXT_PUBLIC_LIVEKIT_URL: {envCheckResult.checks.NEXT_PUBLIC_LIVEKIT_URL.exists ? (
              <>
                {envCheckResult.checks.NEXT_PUBLIC_LIVEKIT_URL.format === 'correct' ? '✓' : '✗'}
                {envCheckResult.checks.NEXT_PUBLIC_LIVEKIT_URL.value}
                {envCheckResult.checks.NEXT_PUBLIC_LIVEKIT_URL.format === 'incorrect' &&
                  <span className="text-red-500 ml-1">(格式错误: 应以 wss:// 开头)</span>
                }
              </>
            ) : '✗ 未设置'}
          </div>
        </div>
      </div>
    );
  };

  // 环境变量设置指南
  const renderEnvSetupGuide = () => {
    return (
      <div className="mt-4 pt-4 border-t border-gray-200">
        <details className="text-xs">
          <summary className="cursor-pointer text-gray-500 font-medium">环境变量设置指南</summary>
          <div className="mt-2 p-3 bg-blue-50 text-blue-800 rounded-md text-sm">
            <h4 className="font-medium mb-2">如何设置环境变量</h4>
            <ol className="list-decimal list-inside space-y-2">
              <li>
                创建或编辑 <code className="bg-blue-100 px-1 rounded">.env.local</code> 文件（在项目根目录）
              </li>
              <li>
                添加以下环境变量：
                <pre className="mt-1 p-2 bg-gray-800 text-gray-200 rounded overflow-x-auto">
                  {`LIVEKIT_API_KEY=你的API密钥
LIVEKIT_API_SECRET=你的API密钥
LIVEKIT_WS_URL=https://你的LiveKit域名.livekit.cloud
NEXT_PUBLIC_LIVEKIT_URL=wss://你的LiveKit域名.livekit.cloud`}
                </pre>
              </li>
              <li>
                <strong>重要说明：</strong>
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li><code className="bg-blue-100 px-1 rounded">LIVEKIT_WS_URL</code> 必须以 <code className="bg-blue-100 px-1 rounded">https://</code> 开头</li>
                  <li><code className="bg-blue-100 px-1 rounded">NEXT_PUBLIC_LIVEKIT_URL</code> 必须以 <code className="bg-blue-100 px-1 rounded">wss://</code> 开头</li>
                  <li>修改环境变量后，需要重启开发服务器</li>
                </ul>
              </li>
            </ol>
          </div>
        </details>
      </div>
    );
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">加载中...</div>;
  }

  return (
    <div className="h-full">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">直播间: {roomName}</h1>
        <p className="text-gray-500 text-sm">使用OBS连接直播</p>

        {/* 连接错误提示 */}
        {connectionError && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-200">
            <div className="flex justify-between items-center">
              <div className="font-medium">LiveKit 连接错误</div>
              <div className="flex space-x-2">
                <Link
                  href="/dashboard/stream/troubleshoot"
                  className="px-2 py-1 bg-blue-600 text-white text-xs rounded-md"
                >
                  故障排除
                </Link>
                <button
                  onClick={reconnectToRoom}
                  className="px-2 py-1 bg-red-600 text-white text-xs rounded-md"
                >
                  尝试重连
                </button>
              </div>
            </div>
            <pre className="mt-2 p-2 bg-red-100 rounded text-xs overflow-auto whitespace-pre-wrap">{connectionError}</pre>
          </div>
        )}

        {/* 错误提示 */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-200">
            <div className="flex justify-between items-center">
              <div className="font-medium">发生错误</div>
              <button
                onClick={() => setShowError(!showError)}
                className="text-xs text-gray-500"
              >
                {showError ? "隐藏详情" : "显示详情"}
              </button>
            </div>
            {showError && <pre className="mt-2 p-2 bg-red-100 rounded text-xs overflow-auto whitespace-pre-wrap">{error}</pre>}
          </div>
        )}

        {/* OBS连接信息 */}
        <div className="mt-4 p-4 bg-gray-100 rounded-md">
          <h2 className="text-lg font-semibold mb-2">OBS设置指南</h2>

          {!rtmpUrl && (
            <button
              onClick={createIngress}
              disabled={creatingIngress}
              className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-blue-300"
            >
              {creatingIngress ? "生成中..." : "生成直播推流配置"}
            </button>
          )}

          {rtmpUrl && (
            <>
              <ol className="list-decimal list-inside space-y-1 text-sm mt-3">
                <li>打开OBS Studio</li>
                <li>点击"设置" {'->'} "串流"</li>
                <li>服务选择"自定义..."</li>
                <li className="flex items-center">
                  服务器URL:
                  <code className="mx-2 px-2 py-1 bg-black text-white rounded">{rtmpUrl}</code>
                  <button
                    onClick={() => copyToClipboard(rtmpUrl)}
                    className="ml-2 px-2 py-1 bg-gray-200 text-xs rounded"
                  >
                    复制
                  </button>
                </li>
                <li className="flex items-center">
                  串流密钥:
                  <code className="mx-2 px-2 py-1 bg-black text-white rounded">
                    {showStreamKey ? streamKey : "••••••••••••••"}
                  </code>
                  <button
                    onClick={() => setShowStreamKey(!showStreamKey)}
                    className="ml-2 px-2 py-1 bg-gray-200 text-xs rounded"
                  >
                    {showStreamKey ? "隐藏" : "显示"}
                  </button>
                  <button
                    onClick={() => copyToClipboard(streamKey)}
                    className="ml-2 px-2 py-1 bg-gray-200 text-xs rounded"
                  >
                    复制
                  </button>
                </li>
                <li>点击"确定"并开始串流</li>
              </ol>
              <p className="mt-2 text-sm text-red-500">注意：请勿分享您的串流密钥！</p>
            </>
          )}

          {/* 环境变量检查按钮 */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">环境配置检查</h3>
              <button
                onClick={checkEnvironment}
                disabled={checkingEnv}
                className="px-3 py-1 bg-blue-500 text-white text-xs rounded-md"
              >
                {checkingEnv ? "检查中..." : "检查配置"}
              </button>
            </div>
            {envCheckResult && renderEnvCheckResults()}
          </div>

          {/* 环境变量设置指南 */}
          {renderEnvSetupGuide()}

          {/* 客户端环境变量 */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <details className="text-xs">
              <summary className="cursor-pointer text-gray-500">客户端环境变量</summary>
              <div className="mt-2 p-2 bg-gray-800 text-gray-200 rounded font-mono overflow-x-auto">
                <div>NEXT_PUBLIC_LIVEKIT_URL: {process.env.NEXT_PUBLIC_LIVEKIT_URL || "未设置"}</div>
              </div>
            </details>
          </div>

          {/* 调试信息 */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <details className="text-xs" open>
              <summary className="cursor-pointer text-gray-500">调试信息</summary>
              <div className="mt-2 p-2 bg-gray-800 text-gray-200 rounded font-mono overflow-x-auto">
                <div>房间名: {roomName}</div>
                {ingressId && <div>Ingress ID: {ingressId}</div>}
                <div>连接状态: {connectionStatus}</div>
                <div>Token 长度: {token ? token.length : 0}</div>
              </div>
            </details>
          </div>
        </div>
      </div>

      {token ? (
        <div className="h-[calc(100%-260px)] rounded-md overflow-hidden bg-gray-800">
          <LiveKitRoom
            token={token}
            serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
            className="h-full"
            options={{
              adaptiveStream: true,
              dynacast: true
            }}
            onError={handleRoomError}
            // 防止自动重连导致的令牌错误循环
            connectOptions={{
              maxRetries: 1,
            }}
          >
            <div className="h-full relative">
              <VideoConference />
              <div className="absolute top-2 right-2">
                <ConnectionStateDisplay />
              </div>
            </div>
            <RoomAudioRenderer />
          </LiveKitRoom>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-red-500">无法加载直播。请检查连接或联系支持。</p>
        </div>
      )}
    </div>
  );
} 