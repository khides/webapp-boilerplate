# Webapp Boilerplate

React + FastAPI + AWS のフルスタックWebアプリケーションボイラープレート。

## 技術スタック

### フロントエンド
- React 19 + Vite 6 + TypeScript 5.6
- Tailwind CSS 4
- Zustand 5 (状態管理)
- lucide-react, framer-motion, CVA

### バックエンド
- FastAPI >= 0.115.0
- Python 3.11+
- SQLAlchemy 2.0 (async)
- Alembic (マイグレーション)
- Mangum (Lambda ASGI adapter)
- pydantic-settings
- uv (パッケージ管理)

### データベース
- **開発環境**: SQLite + aiosqlite (Docker不要)
- **本番環境**: AWS RDS MySQL + aiomysql

### インフラ
- AWS Lambda (コンテナイメージ)
- API Gateway HTTP API
- S3 + CloudFront
- ECR (コンテナレジストリ)
- RDS MySQL (オプション)
- VPC + プライベートサブネット (RDS用)
- Secrets Manager (RDS認証情報)
- Route 53 (オプション)
- Terraform

### CI/CD
- GitHub Actions (タグベースデプロイ)

## ディレクトリ構成

```
webapp-boilerplate/
├── apps/
│   ├── web/                  # フロントエンド (React)
│   │   ├── src/
│   │   │   ├── components/   # UIコンポーネント
│   │   │   ├── pages/        # ページコンポーネント
│   │   │   ├── stores/       # Zustand stores
│   │   │   ├── services/     # APIクライアント
│   │   │   ├── hooks/        # カスタムフック
│   │   │   └── types/        # 型定義
│   │   └── ...
│   └── backend/              # バックエンド (FastAPI)
│       ├── src/
│       │   ├── api/routes/   # APIルート
│       │   ├── db/           # データベース (SQLAlchemy)
│       │   │   └── models/   # ORMモデル
│       │   ├── models/       # Pydanticモデル
│       │   ├── repositories/ # データアクセス層
│       │   └── services/     # ビジネスロジック
│       ├── alembic/          # マイグレーション
│       └── data/             # SQLiteファイル (開発用)
├── infra/                    # Terraform
├── docker/                   # Docker設定
└── .github/workflows/        # CI/CD
```

## ローカル開発

### 必要条件
- Node.js 22+
- pnpm 9+
- Python 3.11+
- uv (Python パッケージ管理)

### セットアップ

```bash
# 依存関係のインストール
make setup
# または個別に:
# pnpm install
# cd apps/backend && uv sync

# 環境変数の設定
cp .env.example .env
```

### 開発サーバー

```bash
# ターミナル1: フロントエンド (http://localhost:5173)
make dev-web

# ターミナル2: バックエンド (http://localhost:8080)
make dev-backend

# tmuxがある場合は一括起動も可能
make dev
```

### データベース

開発環境ではSQLiteを使用するため、Dockerやデータベースサーバーのインストールは不要です。

```bash
# データベース初期化 (make setup に含まれる)
make db-init

# モデル変更後のマイグレーション生成
make db-migrate

# マイグレーション適用
make db-upgrade

# データベースリセット (開発用)
make db-reset

# マイグレーション状態確認
make db-current
make db-history
```

### Docker開発 (オプション)

Docker環境を好む場合:

```bash
docker-compose up
```

### ヘルスチェック

```bash
curl http://localhost:8080/health
```

## デプロイ

### 1. Terraform初期化

```bash
cd infra

# terraform.tfvarsを作成
cp terraform.tfvars.example terraform.tfvars
# project_name等を編集

# 初期化 & 適用
terraform init
terraform plan
terraform apply
```

### 1.1 RDS有効化 (オプション)

本番環境でRDS MySQLを使用する場合:

```bash
cd infra

# RDSを有効にしてデプロイ
terraform plan -var="enable_rds=true"
terraform apply -var="enable_rds=true"
```

作成されるリソース:
- VPC + プライベートサブネット (2AZ)
- RDS MySQL 8.0 インスタンス
- Secrets Manager (認証情報)
- Lambda VPC設定

### 2. GitHub Secretsの設定

以下のSecretsを設定:

| Secret | 説明 |
|--------|------|
| `AWS_ROLE_ARN` | GitHub OIDC用IAMロールARN |
| `AWS_ACCOUNT_ID` | AWSアカウントID |
| `CLOUDFRONT_DISTRIBUTION_ID` | CloudFront配信ID |

### 3. デプロイ実行

```bash
git tag v1.0.0
git push origin v1.0.0
```

## カスタマイズ

### 必須変更

1. `infra/terraform.tfvars` - `project_name`を設定
2. `.github/workflows/deploy.yml` - `PROJECT_NAME`を設定

### 推奨変更

1. `apps/web/package.json` - `name`をプロジェクト名に
2. `apps/backend/pyproject.toml` - `name`をプロジェクト名に
3. このREADMEをプロジェクト説明に更新

### 拡張ポイント

- **新しいモデル追加**: `src/db/models/`にORMモデルを追加し、`make db-migrate`でマイグレーション生成
- **認証**: Cognito, Auth0等を統合
- **ファイルアップロード**: S3への直接アップロード

## API仕様

### ヘルスチェック
```
GET /health
```

### Items CRUD
```
GET    /v1/items          # 一覧取得
GET    /v1/items/{id}     # 詳細取得
POST   /v1/items          # 作成
PUT    /v1/items/{id}     # 更新
DELETE /v1/items/{id}     # 削除
```

## コマンド一覧

```bash
# セットアップ
make setup         # 初期セットアップ (依存関係 + DB初期化)
make install       # 依存関係のみインストール

# 開発
make dev           # 開発サーバー起動 (tmux)
make dev-web       # フロントエンド起動
make dev-backend   # バックエンド起動

# データベース
make db-init       # DB初期化
make db-migrate    # マイグレーション生成
make db-upgrade    # マイグレーション適用
make db-downgrade  # ロールバック
make db-reset      # DBリセット
make db-history    # 履歴表示
make db-current    # 現在バージョン

# 品質管理
make lint          # Lint実行
make format        # コード整形
make test          # テスト実行
make typecheck     # 型チェック

# ビルド・デプロイ
make build         # フロントエンドビルド
make clean         # クリーンアップ
make infra-plan    # Terraform plan
make infra-apply   # Terraform apply
```

## ライセンス

MIT
