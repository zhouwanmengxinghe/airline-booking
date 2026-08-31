# 航空在线订票系统 — 作业 2

[English](README.md) | 简体中文

## 快速开始

首先启动开发服务器。在项目根目录打开终端，执行：

```bash
npm install
npm run db:generate
npm run dev
# 或使用其他包管理器启动开发服务器
pnpm dev
# 或
bun dev
```

用浏览器打开 [http://localhost:3000](http://localhost:3000) 查看页面。

英文原文提供的在线演示：[Vercel 部署页面](https://airline-booking-sandy.vercel.app/)。在线环境是否可用取决于当前部署状态。

可以修改 `app/page.tsx` 开始编辑主页，保存后页面会自动更新。

## 补充运行说明（根据当前代码）

- 项目基于 Next.js 14、React 18、TypeScript、Tailwind CSS、MongoDB 和 Mongoose。
- 数据库连接依赖项目根目录 `.env.local` 中的 `MONGODB_URI`。请使用自己的开发数据库连接串，不要将凭据提交到 Git。
- **`npm run db:generate` 会先清空目标数据库中的航班集合，再生成示例航班。请仅对可重建的开发数据库执行，不要对真实业务数据库运行。** 该行为位于 `scripts/generateSchedules.ts`。
- 功能包含航班查询、预订、按邮箱查看预订、预订详情和取消。航班时间以 UTC 保存，并按机场所在时区展示。
- 该项目为课程演示；现有预订查询和取消接口不应直接当作已具备生产级用户身份验证的系统使用。
