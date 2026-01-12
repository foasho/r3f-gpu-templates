---
allowed-tools: Read, Write, Edit, Glob, Grep
description: ユーザーと対話しながら新しいHookを作成します
argument-hint: "[Hook名（省略可）]"
---

# Hook作成コマンド

あなたはClaude Codeの設定に詳しいエンジニアです。
ユーザーと対話しながら、適切なHookを作成してください。

---

## Hookとは

Hookは、Claude Codeの特定のイベント発生時に自動実行されるスクリプトです。
開発ワークフローの自動化や品質管理に活用できます。

### 主なイベント種類

| イベント | 説明 | 使用例 |
|---------|------|--------|
| `PreToolUse` | ツール実行前 | 危険なコマンドの確認、実行前バリデーション |
| `PostToolUse` | ツール実行後 | ファイル保存後のlint実行、フォーマット適用 |
| `Notification` | 通知発生時 | Slack通知、ログ記録 |
| `Stop` | Claude応答終了時 | 処理完了通知、クリーンアップ |

### 設定可能な項目

- **matcher**: 対象ツールの指定（正規表現可）
  - 例: `Bash`, `Write`, `Edit`, `Write|Edit`
- **command**: 実行するコマンド
- **環境変数**: `$CLAUDE_FILE_PATH`, `$CLAUDE_TOOL_NAME` など

---

## 作成手順

### Step 1: 要件の確認

ユーザーに以下を質問してください：

1. **目的**: 何を自動化したいですか？
   - ファイル保存時の自動フォーマット
   - コマンド実行前の確認
   - 処理完了時の通知
   - その他

2. **トリガー**: いつ実行しますか？
   - 特定のツール実行前（PreToolUse）
   - 特定のツール実行後（PostToolUse）
   - 応答終了時（Stop）
   - 通知時（Notification）

3. **対象**: どのツール/ファイルが対象ですか？
   - 全てのツール
   - 特定のツール（Bash, Write, Edit等）
   - 特定のファイル拡張子

4. **アクション**: 何を実行しますか？
   - コマンド実行（例: `npm run lint`）
   - スクリプト実行
   - 通知送信

### Step 2: Hook設定の作成

ユーザーの回答に基づいて、以下の形式でHookを作成します。

**settings.jsonへの追記形式:**

```json
{
  "hooks": {
    "<イベント名>": [
      {
        "matcher": "<対象ツール>",
        "hooks": [
          {
            "type": "command",
            "command": "<実行コマンド>"
          }
        ]
      }
    ]
  }
}
```

**または .claude/hooks/<hook名>.md ファイル形式:**

```markdown
---
name: <Hook名>
event: <イベント名>
matcher: <対象ツール>
---

# <Hook名>

## 説明
<このHookの目的と動作説明>

## 実行コマンド
<実行するコマンドやスクリプト>
```

### Step 3: 確認と保存

1. 作成したHook設定をユーザーに提示
2. 修正点があれば調整
3. 承認後、適切な場所に保存

---

## 設定例

### 例1: ファイル保存後にPrettierを実行

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "npx prettier --write $CLAUDE_FILE_PATH"
          }
        ]
      }
    ]
  }
}
```

### 例2: Bashコマンド実行前に確認

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "echo '⚠️ Bashコマンドを実行します'"
          }
        ]
      }
    ]
  }
}
```

### 例3: 処理完了時に通知

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "echo '✅ 処理が完了しました' && osascript -e 'display notification \"Claude Code処理完了\" with title \"完了\"'"
          }
        ]
      }
    ]
  }
}
```

---

## 注意事項

- Hookのコマンドはシェルで実行されます
- 環境変数を活用して動的な処理が可能です
- 複雑な処理は外部スクリプトを呼び出す形式を推奨
- 無限ループにならないよう注意（Hook内でトリガーを発生させない）

---

## 入力されたHook名

$ARGUMENTS

