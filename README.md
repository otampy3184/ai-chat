# AI Chat App with Backend

AI キャラクターとチャットできるアプリケーション（バックエンドAPI統合版）

## 構成

- **Frontend**: React TypeScript アプリケーション
- **Backend**: Go HTTP サーバー（LLM API プロキシ）

## セットアップ

### バックエンド (Go)

1. バックエンドディレクトリに移動
```bash
cd backend
```

2. 依存関係の確認（既にインストール済み）
```bash
go mod tidy
```

3. サーバー起動（ポート8080）
```bash
go run .
```

### フロントエンド (React)

1. フロントエンドディレクトリに移動
```bash
cd ai-chat-app
```

2. 依存関係のインストール（初回のみ）
```bash
npm install
```

3. アプリケーション起動
```bash
npm start
```

## 使用方法

1. バックエンドサーバーを起動（ポート8080）
2. フロントエンドアプリを起動（ポート3000）
3. ブラウザで http://localhost:3000 にアクセス
4. 設定画面でLLMプロバイダーとAPIキーを設定
5. AIキャラクターを選択してチャット開始

## 対応LLMプロバイダー

- **OpenAI**: GPT-3.5, GPT-4
- **Anthropic Claude**: Claude 3 シリーズ
- **DeepSeek**: DeepSeek Chat

## CORS問題の解決

このバックエンドサーバーにより、ブラウザのCORS制限を回避してLLM APIを利用できます。APIキーはバックエンドを経由して安全に送信されます。

## ファイル構成

```
.
├── ai-chat-app/          # React フロントエンド
│   ├── src/
│   │   ├── components/   # React コンポーネント
│   │   ├── utils/        # ユーティリティ関数
│   │   └── ...
│   └── package.json
├── backend/              # Go バックエンド
│   ├── main.go          # HTTPサーバー
│   ├── llm_clients.go   # LLM API クライアント
│   └── go.mod
└── README.md
```

## 環境変数（オプション）

- `REACT_APP_BACKEND_URL`: バックエンドサーバーのURL（デフォルト: http://localhost:8080）
- `PORT`: バックエンドサーバーのポート（デフォルト: 8080）
