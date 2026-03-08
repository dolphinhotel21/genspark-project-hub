📋 コード全文
Copy# 🎨 カスタマイズガイド

Genspark プロジェクトハブをあなた好みにカスタマイズする方法を説明します。

---

## 📝 プロジェクト名を変更

### 手順
1. **`index.html`** を開く
2. 各プロジェクトカードの **`<h3>`** タグを探す
3. テキストを変更

### 例
```html
<!-- 変更前 -->
<h3 class="project-name">プロジェクトA</h3>

<!-- 変更後 -->
<h3 class="project-name">マーケティング施策</h3>
各プロジェクトの場所
プロジェクトA: 約74行目
プロジェクトB: 約124行目
プロジェクトC: 約174行目
プロジェクトD: 約224行目
プロジェクトE: 約274行目
🎨 プロジェクトの色を変更
利用可能な色
purple（紫）
blue（青）
green（緑）
orange（オレンジ）
pink（ピンク）
手順
index.html を開く
各プロジェクトカードの data-color 属性を変更
例
Copy<!-- 変更前 -->
<div class="project-card" data-project-id="project-a" data-color="purple">

<!-- 変更後 -->
<div class="project-card" data-project-id="project-a" data-color="green">
🌈 カスタムカラーを追加
手順
css/style.css を開く
:root セクションに新しい色を追加
カラークラスを追加
例
Copy/* 1. :root セクションに追加 */
:root {
    --color-red: #ef4444;
    --color-yellow: #fbbf24;
}

/* 2. カラークラスを追加 */
.project-card[data-color="red"] .color-label {
    background: var(--color-red);
}

.project-card[data-color="yellow"] .color-label {
    background: var(--color-yellow);
}
index.html で新しい色を使用
Copy<div class="project-card" data-project-id="project-f" data-color="red">
➕ プロジェクトを追加
手順
1. HTML にプロジェクトカードを追加
index.html の .projects-grid 内に新しいカードを追加：

Copy<div class="project-card" data-project-id="project-f" data-color="red">
    <div class="project-header">
        <div class="project-info">
            <div class="project-icon">
                <i class="fas fa-folder"></i>
            </div>
            <div>
                <h3 class="project-name">プロジェクトF</h3>
                <span class="project-meta">0 チャット</span>
            </div>
        </div>
        <div class="project-actions">
            <button class="icon-btn favorite-btn">
                <i class="far fa-star"></i>
            </button>
            <button class="icon-btn expand-btn">
                <i class="fas fa-chevron-down"></i>
            </button>
        </div>
    </div>
    <span class="color-label"></span>
    <div class="project-details">
        <div class="project-description-section">
            <label>プロジェクトの説明・メモ</label>
            <textarea class="project-description" placeholder="プロジェクトの説明やメモを入力..."></textarea>
        </div>
        <div class="chats-section">
            <div class="section-header">
                <h4><i class="fas fa-comments"></i> チャット</h4>
                <button class="add-chat-btn">
                    <i class="fas fa-plus"></i> チャットを追加
                </button>
            </div>
            <div class="chats-list"></div>
        </div>
        <div class="subfolders-section">
            <div class="section-header">
                <h4><i class="fas fa-folder"></i> サブフォルダ</h4>
                <button class="add-subfolder-btn">
                    <i class="fas fa-plus"></i> サブフォルダを追加
                </button>
            </div>
            <div class="subfolders-list"></div>
        </div>
    </div>
</div>
Copy
2. JavaScript にデータ構造を追加
js/app.js の hubData に新しいプロジェクトを追加：

CopyhubData = {
    projects: {
        // 既存のプロジェクト...
        'project-f': {
            id: 'project-f',
            name: 'プロジェクトF',
            color: 'red',
            description: '',
            favorite: false,
            chats: [],
            subfolders: [],
            expanded: false,
            lastAccessed: null
        }
    }
};
🔤 フォントを変更
手順
Google Fonts で好きなフォントを選択
index.html の <head> セクションでフォントリンクを変更
css/style.css の body で font-family を変更
例
Copy<!-- index.html -->
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700&display=swap" rel="stylesheet">
Copy/* css/style.css */
body {
    font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
🌙 テーマカラーを変更
手順
css/style.css の :root セクションでカラー変数を変更：

Copy:root {
    /* ライトモード */
    --bg-primary: #f8f9fa;           /* 背景色 */
    --bg-secondary: #ffffff;         /* カード背景色 */
    --text-primary: #212529;         /* メインテキスト色 */
    
    /* Gensparkカラー */
    --color-purple: #8b5cf6;         /* メインパープル */
    --color-blue: #3b82f6;           /* メインブルー */
}

body.dark-mode {
    /* ダークモード */
    --bg-primary: #1a1a1a;
    --bg-secondary: #242424;
    --text-primary: #f8f9fa;
}
🔧 その他のカスタマイズ
サイドバーの幅を変更
Copy/* css/style.css */
.sidebar {
    width: 320px;  /* デフォルト: 280px */
}
カードの角丸を変更
Copy/* css/style.css */
:root {
    --radius-md: 16px;  /* デフォルト: 10px */
}
アニメーション速度を変更
Copy/* css/style.css */
:root {
    --transition: all 0.5s ease;  /* デフォルト: 0.3s */
}
💡 カスタマイズのヒント
ヒント1: ブラウザの開発者ツールを活用
F12 または 右クリック→検証 で開く
要素を選択してスタイルをリアルタイムで確認
気に入った変更を style.css にコピー
ヒント2: バックアップを取る
カスタマイズ前に必ずファイルのバックアップを取ってください。

ヒント3: 段階的に変更
一度に多くの変更をせず、1つずつ確認しながら進めてください。

📚 参考リソース
Google Fonts
Font Awesome Icons
CSS Color Picker
CSS Gradient Generator
カスタマイズを楽しんでください！ 🎨✨

