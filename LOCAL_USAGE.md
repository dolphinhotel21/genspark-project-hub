# 💻 ローカル使用ガイド

Genspark プロジェクトハブをインターネット接続なしで、完全にプライベートに使用する方法を説明します。

---

## 🎯 ローカル使用のメリット

### ✅ 完全なプライバシー
- データはあなたのPCのみに保存
- インターネット経由での情報流出リスクゼロ
- 誰にもアクセスされない

### ✅ 無料
- ホスティング費用不要
- サーバー管理不要

### ✅ 高速
- ネットワーク遅延なし
- 即座にアクセス可能

### ❌ デメリット
- 複数デバイスで共有できない（1台のPCのみ）
- バックアップは手動で必要

---

## 📥 ダウンロード方法

### 方法1: GitHubからZIPダウンロード（推奨）

1. **GitHubリポジトリ**にアクセス：  
   https://github.com/dolphinhotel21/genspark-project-hub

2. 緑色の **「Code」** ボタンをクリック

3. **「Download ZIP」** を選択

4. ダウンロードしたZIPファイルを解凍

### 方法2: Git Cloneを使用

```bash
git clone https://github.com/dolphinhotel21/genspark-project-hub.git
cd genspark-project-hub
🚀 起動方法
Windows
エクスプローラーで解凍したフォルダを開く
index.html を右クリック
「プログラムから開く」 → お好きなブラウザ（Chrome、Edge、Firefoxなど）を選択
ダッシュボードが開きます！
Mac
Finderで解凍したフォルダを開く
index.html を右クリック
「このアプリケーションで開く」 → お好きなブラウザを選択
ダッシュボードが開きます！
ブラウザのアドレスバーに表示されるURL例
file:///C:/Users/YourName/Desktop/genspark-project-hub/index.html
🔖 ブックマーク設定（推奨）
すぐにアクセスできるようにブックマーク登録
index.html をブラウザで開く
Ctrl + D（Mac: Cmd + D）でブックマーク登録
わかりやすい名前（例：「Genspark Hub」）を付ける
次回からはブックマークをクリックするだけ！
💾 データの保存場所
LocalStorageに自動保存
保存先: ブラウザのLocalStorage（file:// スキーム）
自動保存: チャット追加・編集・削除時に即座に保存
永続性: ブラウザのキャッシュをクリアしない限り永久保存
データの確認方法
ダッシュボードを開いた状態で F12 を押す
「Application」 タブ（または「Storage」タブ）を開く
「Local Storage」 → file:// を選択
genspark_hub_data キーに全データが保存されています
📦 バックアップ方法
手動バックアップ（推奨）
ステップ1: データをエクスポート
ダッシュボードを開く
F12 で開発者ツールを開く
Console タブで以下を実行：
Copyconst data = localStorage.getItem('genspark_hub_data');
const blob = new Blob([data], {type: 'application/json'});
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'genspark-backup-' + new Date().toISOString().split('T')[0] + '.json';
a.click();
genspark-backup-2024-03-08.json のようなファイルがダウンロードされます
ステップ2: バックアップを保存
ダウンロードしたJSONファイルを安全な場所に保管
クラウドストレージ（Google Drive、Dropboxなど）に保存推奨
バックアップから復元
ダッシュボードを開く
F12 で開発者ツールを開く
Console タブで以下を実行：
Copy// バックアップファイルの内容をコピーして以下の '' 内に貼り付け
const backupData = '{"projects":{...}}';  // ← ここに貼り付け
localStorage.setItem('genspark_hub_data', backupData);
location.reload();
🔄 複数デバイスでの使用方法
方法1: バックアップ・復元を活用
デバイスAでデータをエクスポート
バックアップファイルをデバイスBに転送
デバイスBで復元
方法2: フォルダごと同期
プロジェクトフォルダをクラウドストレージ（Dropbox、OneDriveなど）に配置
複数デバイスで同期
注意: LocalStorageはデバイスごとに独立しているため、データは手動バックアップが必要
🛠️ トラブルシューティング
問題1: スタイルが適用されない
原因: CSSファイルのパスが正しくない

解決策:

index.html と同じフォルダに css/ フォルダがあることを確認
css/style.css が存在することを確認
問題2: データが保存されない
原因: ブラウザのプライベートモード（シークレットモード）を使用している

解決策:

通常モードでブラウザを開く
LocalStorageが有効か確認（設定で無効化されていないか）
問題3: 「Mixed Content」エラー
原因: HTTPSリソース（Font Awesome、Google Fontsなど）が読み込まれない

解決策:

インターネット接続を確認
または、外部リソースをローカルにダウンロードして参照
問題4: データが消えた
原因: ブラウザのキャッシュをクリアした

解決策:

バックアップから復元
予防策: 定期的にバックアップを取る
🔒 セキュリティ
ローカル使用時のセキュリティ
✅ 安全:

インターネット経由でのアクセスなし
物理的にあなたのPCにのみ存在
⚠️ 注意点:

PC自体のセキュリティ（パスワードロック、暗号化など）は必要
共有PCでは使用しない
バックアップファイルも安全に保管
📊 ローカル vs オンライン比較
項目	ローカル使用	オンライン公開
プライバシー	完全にプライベート	URLを知る人はアクセス可能
費用	無料	無料～有料
速度	超高速	ネットワーク依存
複数デバイス	手動同期が必要	URLで即座にアクセス
バックアップ	手動	ホスティング側で自動
インターネット	不要	必要
💡 おすすめの使い方
パターン1: 完全ローカル
自宅のメインPCでのみ使用
最高のプライバシー
定期的に手動バックアップ
パターン2: ハイブリッド
普段はオンライン版を使用
重要なプロジェクトはローカル版に保存
両方を併用
🎓 上級者向け
ローカルサーバーで起動（オプション）
より本番に近い環境でテストしたい場合：

Python 3を使用
Copycd genspark-project-hub
python -m http.server 8000
ブラウザで http://localhost:8000 にアクセス

Node.jsを使用
Copynpx http-server -p 8000
📞 サポート
問題が発生した場合は、GitHubのIssuesで報告してください。

ローカルで快適にご利用ください！ 💻✨
