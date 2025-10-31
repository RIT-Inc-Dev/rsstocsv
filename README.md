# RSS to CSV

GitHub Actionsで1日1回RSSフィードの新着コンテンツを自動的に取得し、CSVファイルに追記するツールです。

## 機能

- RSSフィードから新着コンテンツを取得
- 重複チェック（既存のURLは追加しない）
- CSV形式で出力（Feed名、URL、タイトル、公開日、コンテンツ概要）
- GitHub Actionsで毎日自動実行

## セットアップ

### 1. 依存関係のインストール

```bash
bun install
```

### 2. RSSフィードの設定

`feeds.json`ファイルでRSSフィードのURLを設定します：

```json
{
  "feeds": [
    {
      "name": "Google Alerts - 生成AI",
      "url": "https://www.google.com/alerts/feeds/YOUR_FEED_ID"
    }
  ]
}
```

複数のフィードを追加することもできます。

### 3. ローカルでの実行

```bash
bun index.ts
```

実行すると、`output.csv`ファイルに新着コンテンツが追加されます。

## GitHub Actionsでの自動実行

このリポジトリをGitHubにプッシュすると、毎日00:00 UTC（日本時間9:00 AM）に自動的にRSSフィードを取得し、CSVを更新します。

### 手動実行

GitHub Actionsの画面から「Actions」→「RSS to CSV Daily Update」→「Run workflow」で手動実行も可能です。

## 出力形式

`output.csv`には以下の形式でデータが保存されます：

```csv
Feed,URL,Title,Published,Content
"Google Alerts - 生成AI","https://example.com/article","記事タイトル","2025-10-31T00:00:00.000Z","記事の概要..."
```

## プロジェクト構成

- `index.ts` - メインスクリプト
- `feeds.json` - RSSフィードの設定ファイル
- `output.csv` - 出力されるCSVファイル
- `.github/workflows/rss-to-csv.yml` - GitHub Actionsワークフロー

This project uses [Bun](https://bun.com) runtime.
