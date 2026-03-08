# 🔒 認証機能の設定ガイド

Genspark プロジェクトハブにパスワード認証を追加する方法を説明します。

---

## 📌 デフォルト設定

**デフォルトでは認証機能は無効化されています。**

- **`js/auth.js`** の `AUTH_CONFIG.enabled` が `false` に設定
- URLを知っている人のみアクセス可能（ランダムURL保護）
- 個人使用には十分なセキュリティレベル

---

## 🔐 認証機能を有効化する方法

### ステップ1: パスワードを設定

**`js/auth.js`** を開いて、パスワードを変更：

```javascript
const AUTH_CONFIG = {
    enabled: true,  // false → true に変更
    sessionDuration: 7 * 24 * 60 * 60 * 1000, // 7日間
    password: 'MySecurePassword2024!',  // ← ここを変更
    storageKey: 'genspark_auth_session'
};
ステップ2: 強力なパスワードを選ぶ
✅ 良いパスワードの例
Genspark@Hub#2024!
MyProject$Secure123
ChatDashboard!2024
❌ 避けるべきパスワード
password
123456
admin
⚙️ セッション設定
セッション有効期間を変更
デフォルトは 7日間 ですが、変更可能です：

Copyconst AUTH_CONFIG = {
    enabled: true,
    sessionDuration: 1 * 24 * 60 * 60 * 1000,  // 1日間
    // sessionDuration: 30 * 60 * 1000,        // 30分間
    // sessionDuration: 30 * 24 * 60 * 60 * 1000,  // 30日間
    password: 'your-password',
    storageKey: 'genspark_auth_session'
};
🎨 ログイン画面のカスタマイズ
タイトルを変更
js/auth.js の showLoginScreen() 関数内：

Copy<h2 style="...">あなたのプロジェクト名</h2>
<p style="...">アクセスコードを入力してください</p>
デザインを変更
グラデーション背景を変更：

Copybackground: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
// 他の例:
// background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
// background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
🔓 ログアウト機能
ログアウトボタンを追加（オプション）
index.html のサイドバーに追加：

Copy<div class="sidebar-footer">
    <a href="https://www.genspark.ai" target="_blank" class="new-chat-btn">
        <i class="fas fa-plus-circle"></i>
        新しいチャットを開始
    </a>
    <!-- ログアウトボタンを追加 -->
    <button class="logout-btn" onclick="logout()">
        <i class="fas fa-sign-out-alt"></i>
        ログアウト
    </button>
</div>
css/style.css にスタイルを追加：

Copy.logout-btn {
    width: 100%;
    padding: 12px 16px;
    background: transparent;
    border: 2px solid var(--border-color);
    border-radius: var(--radius-md);
    color: var(--text-secondary);
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: var(--transition);
    margin-top: 10px;
}

.logout-btn:hover {
    background: var(--bg-tertiary);
    border-color: var(--accent-primary);
    color: var(--accent-primary);
}
🛡️ セキュリティの考慮事項
⚠️ 重要な注意点
1. クライアントサイド認証の限界
JavaScriptコードは秘匿化できません
ブラウザの開発者ツールでパスワードが見える可能性
個人使用・低リスクデータ向け
2. 適切な使用シーン
✅ 適している:

個人のチャット履歴管理
社内の非機密プロジェクト
学習・研究用途
❌ 適していない:

企業の機密情報
金融データ
個人情報（PII）
3. より強力なセキュリティが必要な場合
以下の方法を検討してください：

Netlify/Vercel の有料プラン（パスワード保護機能）
Cloudflare Access（無料でBasic認証）
サーバーサイド認証（Node.js + データベース）
🔄 認証を無効化する方法
認証が不要になった場合：

js/auth.js を開いて：

Copyconst AUTH_CONFIG = {
    enabled: false,  // true → false に変更
    // 他の設定はそのまま
};
これだけでURLのみの保護に戻ります。

🧪 テスト手順
1. 認証有効化後のテスト
ブラウザで index.html を開く
ログイン画面が表示されることを確認
間違ったパスワードを入力 → エラーメッセージ表示
正しいパスワードを入力 → ダッシュボード表示
2. セッション維持のテスト
ログイン後、ブラウザを閉じる
再度ブラウザを開いて同じURLにアクセス
ログイン状態が維持されていることを確認
3. ログアウトのテスト
ログアウトボタンをクリック
ページがリロードされ、ログイン画面が表示されることを確認
📞 トラブルシューティング
問題1: ログイン画面が表示されない
原因: enabled: false になっている
解決策: js/auth.js で enabled: true に変更

問題2: 正しいパスワードでもログインできない
原因: パスワードの入力ミスまたはスペースが含まれている
解決策: js/auth.js のパスワードを再確認

問題3: ログアウト後もログイン状態が残る
原因: ブラウザキャッシュの問題
解決策:

Copy// 開発者ツール（F12）→ Console で実行
localStorage.clear();
location.reload();
💡 ベストプラクティス
1. 定期的にパスワードを変更
Copy// 3ヶ月ごとに変更を推奨
password: 'NewPassword2024Q2!'
2. パスワードをバージョン管理しない
.gitignore にパスワード設定ファイルを追加（該当する場合）

3. セッション期間を適切に設定
個人デバイス: 30日間でも問題なし
共有デバイス: 1日～7日間を推奨
📚 参考資料
LocalStorage のセキュリティ
クライアントサイド認証のベストプラクティス
安全にご利用ください！ 🔒✨
