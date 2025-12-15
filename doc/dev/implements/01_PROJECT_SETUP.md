# 01. Project Setup - Next.js + TypeScript + TailwindCSS

## Overview

Next.js 14 App Router 기반 프로젝트를 설정합니다.
TailwindCSS와 shadcn/ui를 사용하여 UI 컴포넌트를 구성합니다.

---

## Step 1: Create Next.js Project

```bash
# Next.js 프로젝트 생성
npx create-next-app@latest ai-agent-chat --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# 프로젝트 디렉토리로 이동
cd ai-agent-chat
```

### Project Creation Options
```
✔ Would you like to use TypeScript? … Yes
✔ Would you like to use ESLint? … Yes
✔ Would you like to use Tailwind CSS? … Yes
✔ Would you like to use `src/` directory? … Yes
✔ Would you like to use App Router? … Yes
✔ Would you like to customize the default import alias? … Yes → @/*
```

---

## Step 2: Install Dependencies

```bash
# Core Dependencies
npm install axios @tanstack/react-query zustand

# UI Dependencies
npm install lucide-react clsx tailwind-merge class-variance-authority

# Form & Validation
npm install react-hook-form zod @hookform/resolvers

# Date utilities
npm install date-fns

# Dev Dependencies
npm install -D @types/node
```

---

## Step 3: Setup shadcn/ui

```bash
# shadcn/ui 초기화
npx shadcn@latest init
```

### shadcn/ui Configuration Options
```
✔ Which style would you like to use? › Default
✔ Which color would you like to use as base color? › Slate
✔ Would you like to use CSS variables for colors? › yes
```

### Install Required Components

```bash
# 필수 UI 컴포넌트 설치
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add textarea
npx shadcn@latest add card
npx shadcn@latest add badge
npx shadcn@latest add avatar
npx shadcn@latest add scroll-area
npx shadcn@latest add separator
npx shadcn@latest add skeleton
npx shadcn@latest add progress
npx shadcn@latest add alert
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add toast
npx shadcn@latest add form
```

---

## Step 4: Project Structure

프로젝트 폴더 구조를 생성합니다:

```bash
# 폴더 구조 생성
mkdir -p src/components/chat
mkdir -p src/components/messages
mkdir -p src/components/ui
mkdir -p src/lib/api
mkdir -p src/lib/hooks
mkdir -p src/lib/stores
mkdir -p src/lib/utils
mkdir -p src/types
```

### Final Structure

```
ai-agent-chat/
├── public/
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── providers.tsx
│   ├── components/
│   │   ├── chat/
│   │   │   ├── ChatContainer.tsx
│   │   │   ├── ChatInput.tsx
│   │   │   ├── ChatHeader.tsx
│   │   │   ├── MessageList.tsx
│   │   │   └── MessageItem.tsx
│   │   ├── messages/
│   │   │   ├── ThoughtMessage.tsx
│   │   │   ├── AgentStatusMessage.tsx
│   │   │   ├── ProgressMessage.tsx
│   │   │   ├── ApprovalMessage.tsx
│   │   │   ├── ResultMessage.tsx
│   │   │   └── ErrorMessage.tsx
│   │   └── ui/
│   │       └── (shadcn components)
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts
│   │   │   ├── agents.ts
│   │   │   ├── approvals.ts
│   │   │   └── types.ts
│   │   ├── hooks/
│   │   │   ├── useSSE.ts
│   │   │   ├── useAgent.ts
│   │   │   ├── useApproval.ts
│   │   │   └── useChat.ts
│   │   ├── stores/
│   │   │   └── chatStore.ts
│   │   └── utils/
│   │       ├── cn.ts
│   │       └── format.ts
│   └── types/
│       ├── agent.ts
│       ├── chat.ts
│       └── sse.ts
├── .env.local
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Step 5: Configuration Files

### `.env.local`

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1

# Test Mode Configuration
NEXT_PUBLIC_TEST_SELLER_NO=1
NEXT_PUBLIC_MOCK_MODE=false

# SSE Configuration
NEXT_PUBLIC_SSE_RECONNECT_INTERVAL=3000
NEXT_PUBLIC_SSE_MAX_RETRIES=5
```

### `next.config.js`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // API rewrites for CORS handling (development)
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
```

### `tailwind.config.ts`

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Agent-specific colors
        agent: {
          supervisor: "#6366f1", // Indigo
          md: "#8b5cf6",         // Violet
          cs: "#06b6d4",         // Cyan
          display: "#f59e0b",    // Amber
          purchase: "#10b981",   // Emerald
          logistics: "#ef4444",  // Red
          marketing: "#ec4899",  // Pink
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "pulse-dot": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        "typing": {
          "0%": { width: "0" },
          "100%": { width: "100%" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-dot": "pulse-dot 1.5s ease-in-out infinite",
        "typing": "typing 2s steps(40, end)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
```

---

## Step 6: Base Files

### `src/lib/utils/cn.ts`

```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### `src/lib/utils/format.ts`

```typescript
import { format, formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

export function formatDate(date: string | Date): string {
  return format(new Date(date), "yyyy-MM-dd HH:mm:ss");
}

export function formatRelativeTime(date: string | Date): string {
  return formatDistanceToNow(new Date(date), {
    addSuffix: true,
    locale: ko,
  });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("ko-KR").format(num);
}

export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes > 0) {
    return `${minutes}분 ${remainingSeconds}초`;
  }
  return `${seconds}초`;
}
```

### `src/app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}

/* Custom scrollbar */
@layer utilities {
  .scrollbar-thin {
    scrollbar-width: thin;
    scrollbar-color: hsl(var(--muted-foreground)) transparent;
  }

  .scrollbar-thin::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  .scrollbar-thin::-webkit-scrollbar-track {
    background: transparent;
  }

  .scrollbar-thin::-webkit-scrollbar-thumb {
    background-color: hsl(var(--muted-foreground));
    border-radius: 3px;
  }
}

/* Typing animation for agent messages */
@layer utilities {
  .typing-indicator {
    display: flex;
    gap: 4px;
  }

  .typing-indicator span {
    width: 8px;
    height: 8px;
    background-color: hsl(var(--muted-foreground));
    border-radius: 50%;
    animation: pulse-dot 1.5s ease-in-out infinite;
  }

  .typing-indicator span:nth-child(2) {
    animation-delay: 0.2s;
  }

  .typing-indicator span:nth-child(3) {
    animation-delay: 0.4s;
  }
}
```

### `src/app/layout.tsx`

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Agent Commerce - Chat",
  description: "AI Agent Commerce Platform Chat Interface",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

### `src/app/providers.tsx`

```tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### `src/app/page.tsx`

```tsx
import { ChatContainer } from "@/components/chat/ChatContainer";

export default function Home() {
  return (
    <main className="h-screen bg-background">
      <ChatContainer />
    </main>
  );
}
```

---

## Step 7: TypeScript Configuration

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

## Verification

프로젝트 설정이 완료되면 다음 명령으로 확인합니다:

```bash
# 개발 서버 실행
npm run dev

# http://localhost:3000 접속하여 확인
```

### Expected Output
- Next.js 개발 서버가 http://localhost:3000에서 실행
- 빈 ChatContainer 컴포넌트가 표시 (아직 구현 전)
- TypeScript, TailwindCSS 오류 없음

---

## Troubleshooting

### Issue: shadcn/ui 설치 오류

```bash
# 수동으로 components.json 생성
echo '{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/app/globals.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}' > components.json
```

### Issue: TailwindCSS가 적용되지 않음

`tailwind.config.ts`의 `content` 배열에 파일 경로가 올바르게 설정되어 있는지 확인합니다.

---

## Next Step

다음 문서 [02_API_CLIENT.md](./02_API_CLIENT.md)에서 API 클라이언트와 타입 정의를 구현합니다.
