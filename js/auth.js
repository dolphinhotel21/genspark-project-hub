// ==================== 認証設定 ====================
const AUTH_CONFIG = {
    enabled: false, // 認証機能を無効化（URLのみで保護）
    sessionDuration: 7 * 24 * 60 * 60 * 1000, // 7日間（ミリ秒）
    password: 'your-secure-password-123', // ※使用されません（enabled: false のため）
    storageKey: 'genspark_auth_session'
};

// ==================== 認証状態の確認 ====================
function checkAuth() {
    // 認証が無効の場合は常にtrueを返す
    if (!AUTH_CONFIG.enabled) {
        return true;
    }

    const session = localStorage.getItem(AUTH_CONFIG.storageKey);
    if (!session) {
        return false;
    }

    try {
        const sessionData = JSON.parse(session);
        const now = Date.now();
        
        // セッションの有効期限をチェック
        if (now - sessionData.timestamp > AUTH_CONFIG.sessionDuration) {
            localStorage.removeItem(AUTH_CONFIG.storageKey);
            return false;
        }

        return true;
    } catch (e) {
        localStorage.removeItem(AUTH_CONFIG.storageKey);
        return false;
    }
}

// ==================== ログイン処理 ====================
function login(password) {
    if (password === AUTH_CONFIG.password) {
        const sessionData = {
            timestamp: Date.now(),
            authenticated: true
        };
        localStorage.setItem(AUTH_CONFIG.storageKey, JSON.stringify(sessionData));
        return true;
    }
    return false;
}

// ==================== ログアウト処理 ====================
function logout() {
    localStorage.removeItem(AUTH_CONFIG.storageKey);
    window.location.reload();
}

// ==================== ログインUI表示 ====================
function showLoginScreen() {
    // 認証が無効の場合は何もしない
    if (!AUTH_CONFIG.enabled) {
        return;
    }

    const loginHTML = `
        <div id="loginScreen" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        ">
            <div style="
                background: white;
                padding: 40px;
                border-radius: 16px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.3);
                text-align: center;
                max-width: 400px;
                width: 90%;
            ">
                <div style="font-size: 48px; margin-bottom: 20px;">🔒</div>
                <h2 style="color: #333; margin-bottom: 10px; font-family: 'Inter', sans-serif;">Genspark プロジェクトハブ</h2>
                <p style="color: #666; margin-bottom: 30px;">パスワードを入力してください</p>
                <input 
                    type="password" 
                    id="loginPassword" 
                    placeholder="パスワード"
                    style="
                        width: 100%;
                        padding: 12px 16px;
                        border: 2px solid #e0e0e0;
                        border-radius: 8px;
                        font-size: 16px;
                        margin-bottom: 20px;
                        font-family: 'Inter', sans-serif;
                        transition: border-color 0.3s;
                    "
                />
                <button 
                    id="loginButton"
                    style="
                        width: 100%;
                        padding: 12px 16px;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        border: none;
                        border-radius: 8px;
                        font-size: 16px;
                        font-weight: 600;
                        cursor: pointer;
                        font-family: 'Inter', sans-serif;
                        transition: transform 0.2s;
                    "
                >ログイン</button>
                <p id="loginError" style="
                    color: #e74c3c;
                    margin-top: 15px;
                    font-size: 14px;
                    display: none;
                ">パスワードが正しくありません</p>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', loginHTML);

    const passwordInput = document.getElementById('loginPassword');
    const loginButton = document.getElementById('loginButton');
    const errorMsg = document.getElementById('loginError');

    const attemptLogin = () => {
        const password = passwordInput.value;
        if (login(password)) {
            document.getElementById('loginScreen').remove();
        } else {
            errorMsg.style.display = 'block';
            passwordInput.value = '';
            passwordInput.style.borderColor = '#e74c3c';
            passwordInput.focus();
            
            setTimeout(() => {
                passwordInput.style.borderColor = '#e0e0e0';
            }, 2000);
        }
    };

    loginButton.addEventListener('click', attemptLogin);
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            attemptLogin();
        }
    });

    passwordInput.focus();
}

// ==================== 初期化 ====================
document.addEventListener('DOMContentLoaded', () => {
    // 認証が有効で、かつ未認証の場合のみログイン画面を表示
    if (AUTH_CONFIG.enabled && !checkAuth()) {
        showLoginScreen();
    }
});

// ==================== グローバル公開（ログアウトボタン用） ====================
window.logout = logout;
