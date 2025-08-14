# 在线活动与聊天前端（uni-app）

这是基于 uni-app 的前端项目，配套后端为 Spring Boot + Netty 的在线活动与实时聊天平台。
后端仓库地址：
- https://github.com/Onaffair/ActivityManager_Back

## 运行环境
- HBuilderX（推荐，支持编译 H5/各类小程序）
- Node.js 16+（如需安装依赖、或使用 H5 调试）

依赖管理：
- 使用 package.json 管理依赖，首次使用可执行：
  - npm install

## 后端服务地址与前端配置
前端统一在 util/basic-data.js 中配置以下地址：
- wsUrl：WebSocket 地址（Netty 服务器）
- backUrl：后端 HTTP API 基础地址
- imgBaseUrl：图片访问前缀（例如 OSS/CDN 域名，或后端静态资源域名）

文件位置：src/util/basic-data.js（路径：uni/util/basic-data.js）
默认示例：
```js
const baseUrl = "onaffair.website"
const wsUrl = `ws://${baseUrl}:9000/ws`
const backUrl = `http://${baseUrl}:721/api`
const imgBaseUrl = `` // 如需拼接相对路径图片，配置成 https://your-cdn/ 或 http://ip/static/
```

常见场景：
- 本地开发
  - baseUrl 改为 "localhost"
  - wsUrl = ws://localhost:9000/ws
  - backUrl = http://localhost:721/api
- 生产环境（HTTPS）
  - 使用 wss 与 https：
    - wsUrl = wss://yourdomain.com/ws
    - backUrl = https://yourdomain.com/api
  - 同时确保后端与网关/Nginx 已支持 TLS 与跨域

说明：
- 所有 HTTP 请求通过 backUrl 作为前缀，请求工具位于 util/request.js 与 util/_axios.js，会自动附带 JWT Token。
- WebSocket 连接在 store/websocketStore.js 中初始化，使用 util/webSocketUtils.js，
  - 连接时会在 Header 添加 Authorization: Bearer <token>
  - 并在子协议 protocols 中携带 ['auth', token]（配合后端子协议认证）

## 重要依赖
- ali-oss：OSS 客户端，前端通过后端提供的 STS 临时凭证直传图片
- axios、uni-request-adapter：HTTP 请求
- pinia：状态管理（含 token 持久化）
- dayjs、dompurify、marked：工具/渲染

## 与后端的对接说明
- REST 端口：默认 http://<host>:721/api
- WebSocket：默认 ws://<host>:9000/ws
- 登录成功后，后端返回 JWT，前端持久化存储并自动在请求与 WebSocket 连接中携带
- OSS 上传：
  - 前端从后端获取 STS（/api/oss/get-sts 和 /api/oss/get-sign），再使用 ali-oss 直传
  - 如后端返回的是相对路径图片，请在 imgBaseUrl 中配置访问前缀
- AI 流式接口：
  - 通过 composables/useAIChat.js 请求 /api/ai/chat 或 /api/ai/image-analise，按行解析 data: {...} 流式响应

## 功能模块概览（前端页面）
- 首页与活动
  - pages/Home/Home.vue：活动列表、搜索、分类、公告轮播、顶部轮播图
  - pages/launchActivity/LaunchActivity.vue：发起活动（图片上传、规则校验）
  - pages/Detail/ActivityDetailPage.vue：活动详情、评论展示
- 公告
  - pages/Home/AnnouncementList.vue、components/AnnouncementDetailModal：公告列表与详情
- 用户与个人中心
  - pages/Detail/UserDetailPage.vue：用户详情
  - pages/PersonalCenter/PersonalCenter.vue：个人中心首页
  - pages/PersonalCenter/MyFan.vue：粉丝/关注
  - pages/PersonalCenter/SystemInfo.vue：系统通知与请求处理
  - 头像上传：components/ImgUploader，结合 ali-oss 与 STS
- 聊天（实时）
  - pages/Chat/MyChat.vue：会话列表（好友/群组）
  - pages/Chat/ChatRoom.vue：私聊页
  - pages/Chat/GroupChatRoom.vue：群聊页
  - util/webSocketUtils.js + store/websocketStore.js：WebSocket 连接、重连、消息分发
- AI 助手
  - pages/Chat/AIChat.vue：AI 聊天与图片分析，支持流式渲染（useAIChat.js）
- 管理后台（H5 环境可访问）
  - pages/admin/Login.vue：管理员登录
  - pages/admin/Index.vue、Dashboard.vue：仪表盘与统计
  - pages/admin/Users.vue：用户管理
  - pages/admin/Activities.vue：活动管理
  - pages/admin/Groups.vue：群组管理
  - pages/admin/Announcements.vue：公告管理
  - pages/admin/ReportManagePage.vue / ReportDetailPage.vue：举报管理
  - pages/admin/RepairManagement.vue：维修请求与任务调度

## 启动方式
方式一（推荐）：HBuilderX
- 使用 HBuilderX 打开本项目根目录（uni）
- 运行到浏览器（H5）或对应小程序平台

方式二：命令行依赖安装（H5 调试）
- npm install
- 运行请使用 HBuilderX 的“运行到浏览器”，本项目未内置通用 npm scripts

## 常见问题
1) 无法连接后端 API
   - 确认 util/basic-data.js 的 backUrl 正确；后端已启动并允许 CORS
2) WebSocket 连接失败
   - 确认 wsUrl 正确、端口已开放；生产环境使用 wss 并正确配置证书
3) 图片无法显示
   - 配置 imgBaseUrl，使之与后端返回的相对路径拼接为可访问的绝对 URL（如 OSS/CDN 域名）
4) 上传失败（OSS）
   - 确认后端 STS 接口可用、角色 ARN 配置正确；前端仅使用临时凭证，不在前端暴露 AK/SK

## 后端仓库
- 完整后端源码与部署参见：
  - https://github.com/Onaffair/ActivityManager_Back