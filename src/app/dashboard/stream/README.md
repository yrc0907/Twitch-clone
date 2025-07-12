# LiveKit 直播功能配置指南

## 环境变量设置

在项目根目录创建 `.env.local` 文件（如果不存在），并添加以下配置：

```
# LiveKit 配置
# 您可以从 LiveKit Cloud 或自托管的 LiveKit 服务器获取这些信息

# LiveKit API 密钥和密钥 (用于生成令牌)
LIVEKIT_API_KEY=your_api_key_here
LIVEKIT_API_SECRET=your_api_secret_here

# LiveKit WebRTC 服务器 URL (用于浏览器连接)
NEXT_PUBLIC_LIVEKIT_URL=wss://your-livekit-server.com

# LiveKit WebSocket URL (用于服务器端API连接)
LIVEKIT_WS_URL=https://your-livekit-server.com
```

请将上面的占位符替换为您的实际 LiveKit 密钥和服务器地址。

## 获取 LiveKit API 密钥

1. 注册/登录 [LiveKit Cloud](https://livekit.io/)
2. 创建一个新项目
3. 在项目设置中找到 API 密钥和密钥
4. 复制这些值到您的环境变量中

## LiveKit Ingress 说明

本项目使用 LiveKit Ingress 功能来实现 RTMP 推流。与传统方法不同，您不需要预先配置固定的 RTMP URL，而是：

1. 在直播页面点击"生成直播推流配置"按钮
2. 系统会调用 LiveKit API 创建一个新的 Ingress
3. 获取专用的 RTMP URL 和流密钥
4. 将这些信息用于 OBS 设置

这种方式的优势：

- 无需预先配置 RTMP 服务器
- 每个直播会话可以获得唯一的推流密钥
- 更好的安全性和可靠性

## OBS 直播设置

1. 打开 OBS Studio
2. 点击"设置" -> "串流"
3. 服务选择"自定义..."
4. 服务器 URL: 使用从应用获取的 RTMP URL
5. 串流密钥: 使用从应用获取的流密钥
6. 点击"确定"并开始串流

## 排查问题

### 直播不显示在页面上

如果 OBS 成功连接但页面上没有显示视频流，请尝试以下步骤：

1. **检查环境变量**

   - 确保所有环境变量都已正确设置
   - 特别注意 `NEXT_PUBLIC_LIVEKIT_URL` 和 `LIVEKIT_WS_URL` 是否正确

2. **确认房间名称一致**

   - 页面使用 "live-stream-room" 作为默认房间名
   - 确保创建 Ingress 时使用了相同的房间名称

3. **检查 LiveKit 项目设置**

   - 在 LiveKit Cloud 控制台中，确保已启用 Ingress 功能
   - 验证项目是否有足够的配额用于直播

4. **检查浏览器控制台**

   - 打开浏览器开发者工具 (F12)
   - 检查控制台是否有连接错误
   - 查看网络选项卡中的 WebSocket 连接状态

5. **检查 OBS 设置**

   - 确保选择了正确的摄像头/输入源
   - 验证 OBS 中的串流状态是否显示为"良好"
   - 检查 OBS 日志中是否有推流错误

6. **重新生成配置**

   - 尝试刷新页面并重新生成推流配置
   - 确保 OBS 使用最新的 RTMP URL 和流密钥

7. **使用调试信息**
   - 点击页面底部的"调试信息"查看连接状态
   - 如果状态一直是"连接中"或"未连接"，可能是 LiveKit 服务器连接问题

### 一般故障排查

1. 确认所有环境变量已正确设置
2. 检查 LiveKit 服务器是否在线
3. 确认 API 密钥和密钥正确
4. 检查 Ingress 创建是否成功 - 查看浏览器控制台是否有错误
5. 确保你的 LiveKit 项目启用了 Ingress 功能（在 LiveKit Cloud 控制台中设置）
6. 查看浏览器控制台和服务器日志是否有错误信息
