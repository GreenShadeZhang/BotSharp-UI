# Keycloak OIDC Authentication Integration

本项目已集成 Keycloak 作为 OpenID Connect (OIDC) 认证提供者，实现了安全的用户认证和授权功能。

## 功能特性

- ✅ **标准 OIDC 认证流程**：使用授权码 + PKCE 流程确保安全性
- ✅ **模块化设计**：易于更换其他 OIDC 提供者（如 Google、Azure AD 等）
- ✅ **自动令牌刷新**：支持使用刷新令牌自动更新访问令牌
- ✅ **无缝用户体验**：统一的登录入口，自动处理认证状态
- ✅ **安全退出**：支持安全的登出和会话清理

## 配置信息

### Keycloak 服务器配置
- **域名**: https://auth.verdure-hiro.cn/
- **Realm**: maker-community  
- **客户端 ID**: aiforge
- **认证端点**: `/realms/maker-community/protocol/openid-connect/auth`
- **令牌端点**: `/realms/maker-community/protocol/openid-connect/token`
- **用户信息端点**: `/realms/maker-community/protocol/openid-connect/userinfo`
- **登出端点**: `/realms/maker-community/protocol/openid-connect/logout`

### 应用配置
- **回调地址**: `http://localhost:5015/auth/callback`
- **登出回调**: `http://localhost:5015/`
- **认证方式**: 授权码 + PKCE
- **作用域**: `openid profile email`

## 使用方法

### 1. 启动认证流程
点击首页的"登录"按钮即可启动 OIDC 认证流程：
- 系统会自动重定向到 Keycloak 登录页面
- 用户在 Keycloak 中完成身份验证
- 认证成功后自动返回应用并获取用户信息

### 2. 访问受保护的资源
- 所有 HTTP 请求会自动附加认证令牌
- 令牌过期时会自动尝试刷新
- 刷新失败时会重新引导用户进行认证

### 3. 查看用户信息
访问 `/profile` 页面可以查看当前用户的详细信息：
- 用户名和邮箱
- 认证状态和来源
- 令牌信息

### 4. 安全退出
点击"退出"按钮会：
- 清除本地存储的所有令牌和用户数据
- 重定向到 Keycloak 执行服务器端登出
- 最终返回应用首页

## 文件结构

```
src/lib/services/
├── oidc-config.js           # OIDC 配置文件
├── oidc-auth-service.js     # OIDC 认证服务
└── auth-service.js          # 统一认证接口（支持 OIDC + 遗留系统）

src/routes/
├── auth/
│   └── callback/
│       └── +page.svelte     # 认证回调页面
├── profile/
│   └── +page.svelte         # 用户资料页面
└── (home)/
    └── +page.svelte         # 首页（包含登录按钮）

src/lib/helpers/
└── http.js                  # HTTP 拦截器（自动附加令牌）
```

## 更换认证提供者

由于采用了模块化设计，更换其他 OIDC 提供者非常简单：

### 1. 更新配置文件
修改 `src/lib/services/oidc-config.js` 中的配置：

```javascript
// 例如：使用 Google OIDC
const GOOGLE_CONFIG = {
    issuer: 'https://accounts.google.com',
    authorization_endpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    token_endpoint: 'https://oauth2.googleapis.com/token',
    userinfo_endpoint: 'https://openidconnect.googleapis.com/v1/userinfo',
    end_session_endpoint: 'https://accounts.google.com/logout',
    client_id: 'your-google-client-id',
    // ... 其他配置
};
```

### 2. 无需修改其他代码
- 认证服务 (`oidc-auth-service.js`) 会自动使用新配置
- 所有认证流程保持不变
- 用户界面无需调整

## 开发和调试

### 本地开发
```bash
npm run dev
```
访问 http://localhost:5015 测试认证功能

### 调试信息
- 浏览器控制台会显示认证流程的详细日志
- 检查 `localStorage` 中的令牌存储
- 网络面板可以查看 OIDC 端点的请求/响应

### 常见问题
1. **回调地址不匹配**：确保 Keycloak 客户端配置中包含正确的回调 URL
2. **CORS 问题**：确保 Keycloak 允许来自应用域名的跨域请求
3. **令牌过期**：检查令牌的有效期设置，确保刷新令牌正常工作

## 安全注意事项

1. **PKCE 保护**：使用 PKCE (Proof Key for Code Exchange) 防止授权码拦截攻击
2. **状态参数**：使用随机状态参数防止 CSRF 攻击  
3. **令牌存储**：访问令牌存储在 localStorage，刷新令牌仅在需要时使用
4. **HTTPS 要求**：生产环境必须使用 HTTPS 协议
5. **令牌验证**：所有 API 请求都会验证令牌的有效性

## 生产部署

### 1. 更新配置
修改 `oidc-config.js` 中的生产环境配置：
- 更新回调地址为生产域名
- 确保所有端点使用 HTTPS

### 2. Keycloak 客户端配置
在 Keycloak 管理界面中：
- 添加生产环境的回调 URL
- 配置适当的客户端设置
- 设置合理的令牌有效期

### 3. 环境变量
可以通过环境变量动态配置：
```javascript
const config = {
    client_id: process.env.OIDC_CLIENT_ID || 'aiforge',
    issuer: process.env.OIDC_ISSUER || 'https://auth.verdure-hiro.cn/realms/maker-community',
    // ...
};
```

这样设计的 OIDC 集成既保证了安全性，又具有良好的可维护性和扩展性。
