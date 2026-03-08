// ==================== グローバル変数 ====================
let currentProjectElement = null;
let currentSubfolderElement = null;

// ハブデータ構造
let hubData = {
    projects: {
        'project-a': {
            id: 'project-a',
            name: 'プロジェクトA',
            color: 'purple',
            description: '',
            favorite: false,
            chats: [],
            subfolders: [],
            expanded: false,
            lastAccessed: null
        },
        'project-b': {
            id: 'project-b',
            name: 'プロジェクトB',
            color: 'blue',
            description: '',
            favorite: false,
            chats: [],
            subfolders: [],
            expanded: false,
            lastAccessed: null
        },
        'project-c': {
            id: 'project-c',
            name: 'プロジェクトC',
            color: 'green',
            description: '',
            favorite: false,
            chats: [],
            subfolders: [],
            expanded: false,
            lastAccessed: null
        },
        'project-d': {
            id: 'project-d',
            name: 'プロジェクトD',
            color: 'orange',
            description: '',
            favorite: false,
            chats: [],
            subfolders: [],
            expanded: false,
            lastAccessed: null
        },
        'project-e': {
            id: 'project-e',
            name: 'プロジェクトE',
            color: 'pink',
            description: '',
            favorite: false,
            chats: [],
            subfolders: [],
            expanded: false,
            lastAccessed: null
        }
    }
};

// ==================== 初期化 ====================
document.addEventListener('DOMContentLoaded', () => {
    setupTheme();
    loadDataFromStorage();
    initializeEventListeners();
    renderAllProjects();
});

// ==================== テーマ設定 ====================
function setupTheme() {
    const savedTheme = localStorage.getItem('genspark_theme') || 'light';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        const themeIcon = document.querySelector('.theme-toggle i');
        if (themeIcon) {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        }
    }
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('genspark_theme', isDark ? 'dark' : 'light');
    
    const themeIcon = document.querySelector('.theme-toggle i');
    if (themeIcon) {
        themeIcon.classList.toggle('fa-moon', !isDark);
        themeIcon.classList.toggle('fa-sun', isDark);
    }
}

// ==================== データ永続化 ====================
function loadDataFromStorage() {
    const saved = localStorage.getItem('genspark_hub_data');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            // 既存データとマージ（新しいプロジェクトが追加された場合に対応）
            hubData.projects = { ...hubData.projects, ...parsed.projects };
        } catch (e) {
            console.error('データ読み込みエラー:', e);
        }
    }
}

function saveDataToStorage() {
    try {
        localStorage.setItem('genspark_hub_data', JSON.stringify(hubData));
    } catch (e) {
        console.error('データ保存エラー:', e);
        alert('データの保存に失敗しました。ストレージ容量を確認してください。');
    }
}

// ==================== イベントリスナー登録 ====================
function initializeEventListeners() {
    // テーマ切替
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    // 検索
    const searchInput = document.querySelector('.search-box input');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }

    // ナビゲーション
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', handleNavigation);
    });

    // プロジェクトカードのイベント
    document.querySelectorAll('.project-card').forEach(card => {
        setupProjectCard(card);
    });

    // モーダル関連
    setupModalEventListeners();
}

// ==================== プロジェクトカードの設定 ====================
function setupProjectCard(card) {
    const projectId = card.dataset.projectId;
    const header = card.querySelector('.project-header');
    const favoriteBtn = card.querySelector('.favorite-btn');
    const expandBtn = card.querySelector('.expand-btn');
    const descriptionArea = card.querySelector('.project-description');
    const addChatBtn = card.querySelector('.add-chat-btn');
    const addSubfolderBtn = card.querySelector('.add-subfolder-btn');

    // ヘッダークリックで展開/折りたたみ
    header.addEventListener('click', (e) => {
        if (e.target.closest('.favorite-btn') || e.target.closest('.expand-btn')) {
            return;
        }
        toggleProjectExpand(card, projectId);
    });

    // お気に入りボタン
    if (favoriteBtn) {
        favoriteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFavorite(projectId);
        });
    }

    // 展開ボタン
    if (expandBtn) {
        expandBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleProjectExpand(card, projectId);
        });
    }

    // 説明エリア
    if (descriptionArea) {
        descriptionArea.addEventListener('blur', () => {
            updateProjectDescription(projectId, descriptionArea.value);
        });
    }

    // チャット追加ボタン
    if (addChatBtn) {
        addChatBtn.addEventListener('click', () => {
            openAddChatModal(projectId, null);
        });
    }

    // サブフォルダ追加ボタン
    if (addSubfolderBtn) {
        addSubfolderBtn.addEventListener('click', () => {
            openAddSubfolderModal(projectId);
        });
    }
}

// ==================== プロジェクトの展開/折りたたみ ====================
function toggleProjectExpand(card, projectId) {
    const details = card.querySelector('.project-details');
    const expandIcon = card.querySelector('.expand-btn i');
    
    const isExpanded = details.classList.contains('active');
    
    if (isExpanded) {
        details.classList.remove('active');
        expandIcon.classList.remove('fa-chevron-up');
        expandIcon.classList.add('fa-chevron-down');
        hubData.projects[projectId].expanded = false;
    } else {
        details.classList.add('active');
        expandIcon.classList.remove('fa-chevron-down');
        expandIcon.classList.add('fa-chevron-up');
        hubData.projects[projectId].expanded = true;
        hubData.projects[projectId].lastAccessed = Date.now();
        
        // データを読み込んで表示
        loadProjectData(card, projectId);
    }
    
    saveDataToStorage();
}

function loadProjectData(card, projectId) {
    const project = hubData.projects[projectId];
    
    // 説明エリア
    const descriptionArea = card.querySelector('.project-description');
    if (descriptionArea && project.description) {
        descriptionArea.value = project.description;
    }
    
    // チャットリスト
    renderChats(card, projectId);
    
    // サブフォルダリスト
    renderSubfolders(card, projectId);
}

// ==================== お気に入り切替 ====================
function toggleFavorite(projectId) {
    const project = hubData.projects[projectId];
    project.favorite = !project.favorite;
    
    const card = document.querySelector(`[data-project-id="${projectId}"]`);
    const favoriteIcon = card.querySelector('.favorite-btn i');
    
    if (project.favorite) {
        favoriteIcon.classList.remove('far');
        favoriteIcon.classList.add('fas');
        favoriteIcon.style.color = '#f59e0b';
    } else {
        favoriteIcon.classList.remove('fas');
        favoriteIcon.classList.add('far');
        favoriteIcon.style.color = '';
    }
    
    saveDataToStorage();
}

// ==================== 説明の更新 ====================
function updateProjectDescription(projectId, description) {
    if (hubData.projects[projectId]) {
        hubData.projects[projectId].description = description;
        saveDataToStorage();
    }
}

// ==================== チャットのレンダリング ====================
function renderChats(card, projectId) {
    const project = hubData.projects[projectId];
    const chatsList = card.querySelector('.chats-list');
    
    if (!chatsList) return;
    
    chatsList.innerHTML = '';
    
    if (project.chats.length === 0) {
        chatsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-comments"></i>
                <p>まだチャットがありません</p>
            </div>
        `;
        return;
    }
    
    project.chats.forEach(chat => {
        const chatItem = document.createElement('div');
        chatItem.className = 'chat-item';
        chatItem.innerHTML = `
            <div class="chat-info">
                <i class="fas fa-comment"></i>
                <div class="chat-details">
                    <a href="${chat.url}" target="_blank" class="chat-title">${chat.title}</a>
                    ${chat.description ? `<p class="chat-description">${chat.description}</p>` : ''}
                </div>
            </div>
            <div class="chat-actions">
                <button class="icon-btn move-chat-btn" title="移動">
                    <i class="fas fa-exchange-alt"></i>
                </button>
                <button class="icon-btn delete-chat-btn" title="削除">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        // 移動ボタン
        chatItem.querySelector('.move-chat-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            openMoveChatModal(projectId, null, chat.id);
        });
        
        // 削除ボタン
        chatItem.querySelector('.delete-chat-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            deleteChat(projectId, null, chat.id);
        });
        
        chatsList.appendChild(chatItem);
    });
}

// ==================== サブフォルダのレンダリング ====================
function renderSubfolders(card, projectId) {
    const project = hubData.projects[projectId];
    const subfoldersList = card.querySelector('.subfolders-list');
    
    if (!subfoldersList) return;
    
    subfoldersList.innerHTML = '';
    
    if (project.subfolders.length === 0) {
        return;
    }
    
    project.subfolders.forEach(subfolder => {
        const subfolderItem = document.createElement('div');
        subfolderItem.className = 'subfolder-item';
        subfolderItem.dataset.subfolderId = subfolder.id;
        
        subfolderItem.innerHTML = `
            <div class="subfolder-header">
                <div class="subfolder-info">
                    <i class="fas fa-folder"></i>
                    <span class="subfolder-name">${subfolder.name}</span>
                    ${subfolder.description ? `<span class="subfolder-description">${subfolder.description}</span>` : ''}
                </div>
                <div class="subfolder-actions">
                    <button class="icon-btn expand-subfolder-btn">
                        <i class="fas fa-chevron-down"></i>
                    </button>
                    <button class="icon-btn delete-subfolder-btn" title="削除">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="subfolder-chats">
                <div class="subfolder-chats-list"></div>
                <button class="add-chat-btn">
                    <i class="fas fa-plus"></i> チャットを追加
                </button>
            </div>
        `;
        
        // サブフォルダのチャットをレンダリング
        renderSubfolderChats(subfolderItem, projectId, subfolder);
        
        // 展開ボタン
        const expandBtn = subfolderItem.querySelector('.expand-subfolder-btn');
        const subfolderChats = subfolderItem.querySelector('.subfolder-chats');
        expandBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isExpanded = subfolderChats.classList.contains('active');
            subfolderChats.classList.toggle('active');
            expandBtn.querySelector('i').classList.toggle('fa-chevron-down', isExpanded);
            expandBtn.querySelector('i').classList.toggle('fa-chevron-up', !isExpanded);
        });
        
        // サブフォルダヘッダークリックで展開
        const subfolderHeader = subfolderItem.querySelector('.subfolder-header');
        subfolderHeader.addEventListener('click', (e) => {
            if (e.target.closest('.delete-subfolder-btn')) return;
            expandBtn.click();
        });
        
        // 削除ボタン
        subfolderItem.querySelector('.delete-subfolder-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            deleteSubfolder(projectId, subfolder.id);
        });
        
        // チャット追加ボタン
        subfolderItem.querySelector('.add-chat-btn').addEventListener('click', () => {
            openAddChatModal(projectId, subfolder.id);
        });
        
        subfoldersList.appendChild(subfolderItem);
    });
}

// ==================== サブフォルダのチャットをレンダリング ====================
function renderSubfolderChats(subfolderElement, projectId, subfolder) {
    const chatsList = subfolderElement.querySelector('.subfolder-chats-list');
    
    if (!chatsList) return;
    
    chatsList.innerHTML = '';
    
    if (subfolder.chats.length === 0) {
        chatsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-comments"></i>
                <p>まだチャットがありません</p>
            </div>
        `;
        return;
    }
    
    subfolder.chats.forEach(chat => {
        const chatItem = document.createElement('div');
        chatItem.className = 'chat-item';
        chatItem.innerHTML = `
            <div class="chat-info">
                <i class="fas fa-comment"></i>
                <div class="chat-details">
                    <a href="${chat.url}" target="_blank" class="chat-title">${chat.title}</a>
                    ${chat.description ? `<p class="chat-description">${chat.description}</p>` : ''}
                </div>
            </div>
            <div class="chat-actions">
                <button class="icon-btn move-chat-btn" title="移動">
                    <i class="fas fa-exchange-alt"></i>
                </button>
                <button class="icon-btn delete-chat-btn" title="削除">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        // 移動ボタン
        chatItem.querySelector('.move-chat-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            openMoveChatModal(projectId, subfolder.id, chat.id);
        });
        
        // 削除ボタン
        chatItem.querySelector('.delete-chat-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            deleteChat(projectId, subfolder.id, chat.id);
        });
        
        chatsList.appendChild(chatItem);
    });
}

// ==================== モーダルイベントリスナー ====================
function setupModalEventListeners() {
    // チャット追加モーダル
    const addChatModal = document.getElementById('addChatModal');
    const addChatForm = document.getElementById('addChatForm');
    const cancelChatBtn = document.querySelector('#addChatModal .cancel-btn');
    
    if (cancelChatBtn) {
        cancelChatBtn.addEventListener('click', () => {
            closeModal(addChatModal);
        });
    }
    
    if (addChatForm) {
        addChatForm.addEventListener('submit', handleAddChat);
    }
    
    // サブフォルダ追加モーダル
    const addSubfolderModal = document.getElementById('addSubfolderModal');
    const addSubfolderForm = document.getElementById('addSubfolderForm');
    const cancelSubfolderBtn = document.querySelector('#addSubfolderModal .cancel-btn');
    
    if (cancelSubfolderBtn) {
        cancelSubfolderBtn.addEventListener('click', () => {
            closeModal(addSubfolderModal);
        });
    }
    
    if (addSubfolderForm) {
        addSubfolderForm.addEventListener('submit', handleAddSubfolder);
    }
    
    // チャット移動モーダル
    const moveChatModal = document.getElementById('moveChatModal');
    const moveChatForm = document.getElementById('moveChatForm');
    const cancelMoveBtn = document.querySelector('#moveChatModal .cancel-btn');
    
    if (cancelMoveBtn) {
        cancelMoveBtn.addEventListener('click', () => {
            closeModal(moveChatModal);
        });
    }
    
    if (moveChatForm) {
        moveChatForm.addEventListener('submit', handleMoveChat);
    }
    
    // モーダル外クリックで閉じる
    [addChatModal, addSubfolderModal, moveChatModal].forEach(modal => {
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    closeModal(modal);
                }
            });
        }
    });
}

// ==================== チャット追加モーダルを開く ====================
function openAddChatModal(projectId, subfolderId = null) {
    const modal = document.getElementById('addChatModal');
    const form = document.getElementById('addChatForm');
    
    currentProjectElement = projectId;
    currentSubfolderElement = subfolderId;
    
    form.reset();
    modal.classList.add('active');
}

// ==================== チャット追加処理 ====================
function handleAddChat(e) {
    e.preventDefault();
    
    const title = document.getElementById('chatTitle').value.trim();
    const url = document.getElementById('chatUrl').value.trim();
    const description = document.getElementById('chatDescription').value.trim();
    
    if (!title || !url) {
        alert('タイトルとURLは必須です');
        return;
    }
    
    const chat = {
        id: 'chat-' + Date.now(),
        title,
        url,
        description,
        createdAt: Date.now()
    };
    
    const project = hubData.projects[currentProjectElement];
    
    if (currentSubfolderElement) {
        // サブフォルダにチャットを追加
        const subfolder = project.subfolders.find(sf => sf.id === currentSubfolderElement);
        if (subfolder) {
            subfolder.chats.push(chat);
        }
    } else {
        // プロジェクト直下にチャットを追加
        project.chats.push(chat);
    }
    
    saveDataToStorage();
    
    // UIを更新
    const card = document.querySelector(`[data-project-id="${currentProjectElement}"]`);
    if (currentSubfolderElement) {
        const subfolder = project.subfolders.find(sf => sf.id === currentSubfolderElement);
        const subfolderElement = card.querySelector(`[data-subfolder-id="${currentSubfolderElement}"]`);
        if (subfolderElement) {
            renderSubfolderChats(subfolderElement, currentProjectElement, subfolder);
        }
    } else {
        renderChats(card, currentProjectElement);
    }
    
    closeModal(document.getElementById('addChatModal'));
}

// ==================== チャット削除 ====================
function deleteChat(projectId, subfolderId, chatId) {
    if (!confirm('このチャットを削除しますか？')) {
        return;
    }
    
    const project = hubData.projects[projectId];
    
    if (subfolderId) {
        const subfolder = project.subfolders.find(sf => sf.id === subfolderId);
        if (subfolder) {
            subfolder.chats = subfolder.chats.filter(c => c.id !== chatId);
            
            // UIを更新
            const card = document.querySelector(`[data-project-id="${projectId}"]`);
            const subfolderElement = card.querySelector(`[data-subfolder-id="${subfolderId}"]`);
            if (subfolderElement) {
                renderSubfolderChats(subfolderElement, projectId, subfolder);
            }
        }
    } else {
        project.chats = project.chats.filter(c => c.id !== chatId);
        
        // UIを更新
        const card = document.querySelector(`[data-project-id="${projectId}"]`);
        renderChats(card, projectId);
    }
    
    saveDataToStorage();
}

// ==================== サブフォルダ追加モーダルを開く ====================
function openAddSubfolderModal(projectId) {
    const modal = document.getElementById('addSubfolderModal');
    const form = document.getElementById('addSubfolderForm');
    
    currentProjectElement = projectId;
    
    form.reset();
    modal.classList.add('active');
}

// ==================== サブフォルダ追加処理 ====================
function handleAddSubfolder(e) {
    e.preventDefault();
    
    const name = document.getElementById('subfolderName').value.trim();
    const description = document.getElementById('subfolderDescription').value.trim();
    
    if (!name) {
        alert('フォルダ名は必須です');
        return;
    }
    
    const subfolder = {
        id: 'subfolder-' + Date.now(),
        name,
        description,
        chats: [],
        createdAt: Date.now()
    };
    
    const project = hubData.projects[currentProjectElement];
    project.subfolders.push(subfolder);
    
    saveDataToStorage();
    
    // UIを更新
    const card = document.querySelector(`[data-project-id="${currentProjectElement}"]`);
    renderSubfolders(card, currentProjectElement);
    
    closeModal(document.getElementById('addSubfolderModal'));
}

// ==================== サブフォルダ削除 ====================
function deleteSubfolder(projectId, subfolderId) {
    const project = hubData.projects[projectId];
    const subfolder = project.subfolders.find(sf => sf.id === subfolderId);
    
    if (subfolder && subfolder.chats.length > 0) {
        if (!confirm('このフォルダにはチャットが含まれています。本当に削除しますか？')) {
            return;
        }
    }
    
    project.subfolders = project.subfolders.filter(sf => sf.id !== subfolderId);
    
    saveDataToStorage();
    
    // UIを更新
    const card = document.querySelector(`[data-project-id="${projectId}"]`);
    renderSubfolders(card, projectId);
}

// ==================== チャット移動モーダルを開く ====================
function openMoveChatModal(projectId, subfolderId, chatId) {
    const modal = document.getElementById('moveChatModal');
    const targetProjectSelect = document.getElementById('targetProject');
    const targetSubfolderSelect = document.getElementById('targetSubfolder');
    const chatTitleSpan = document.getElementById('moveChatTitle');
    
    // 現在のチャット情報を取得
    const project = hubData.projects[projectId];
    let chat;
    
    if (subfolderId) {
        const subfolder = project.subfolders.find(sf => sf.id === subfolderId);
        chat = subfolder ? subfolder.chats.find(c => c.id === chatId) : null;
    } else {
        chat = project.chats.find(c => c.id === chatId);
    }
    
    if (!chat) return;
    
    // チャットタイトルを表示
    chatTitleSpan.textContent = chat.title;
    
    // プロジェクト選択肢を設定
    targetProjectSelect.innerHTML = '';
    Object.values(hubData.projects).forEach(p => {
        const option = document.createElement('option');
        option.value = p.id;
        option.textContent = p.name;
        targetProjectSelect.appendChild(option);
    });
    
    // サブフォルダ選択肢を更新
    updateSubfolderOptions();
    
    targetProjectSelect.addEventListener('change', updateSubfolderOptions);
    
    // 移動元情報を保存
    modal.dataset.sourceProjectId = projectId;
    modal.dataset.sourceSubfolderId = subfolderId || '';
    modal.dataset.chatId = chatId;
    
    modal.classList.add('active');
}

// ==================== サブフォルダ選択肢を更新 ====================
function updateSubfolderOptions() {
    const targetProjectSelect = document.getElementById('targetProject');
    const targetSubfolderSelect = document.getElementById('targetSubfolder');
    
    const selectedProjectId = targetProjectSelect.value;
    const project = hubData.projects[selectedProjectId];
    
    targetSubfolderSelect.innerHTML = '<option value="">プロジェクト直下</option>';
    
    if (project && project.subfolders.length > 0) {
        project.subfolders.forEach(sf => {
            const option = document.createElement('option');
            option.value = sf.id;
            option.textContent = sf.name;
            targetSubfolderSelect.appendChild(option);
        });
    }
}

// ==================== チャット移動処理 ====================
function handleMoveChat(e) {
    e.preventDefault();
    
    const modal = document.getElementById('moveChatModal');
    const sourceProjectId = modal.dataset.sourceProjectId;
    const sourceSubfolderId = modal.dataset.sourceSubfolderId;
    const chatId = modal.dataset.chatId;
    
    const targetProjectId = document.getElementById('targetProject').value;
    const targetSubfolderId = document.getElementById('targetSubfolder').value;
    
    // 移動元と移動先が同じ場合
    if (sourceProjectId === targetProjectId && sourceSubfolderId === targetSubfolderId) {
        alert('移動先が同じです');
        return;
    }
    
    // 移動元からチャットを取得して削除
    const sourceProject = hubData.projects[sourceProjectId];
    let chat;
    
    if (sourceSubfolderId) {
        const sourceSubfolder = sourceProject.subfolders.find(sf => sf.id === sourceSubfolderId);
        if (sourceSubfolder) {
            chat = sourceSubfolder.chats.find(c => c.id === chatId);
            sourceSubfolder.chats = sourceSubfolder.chats.filter(c => c.id !== chatId);
        }
    } else {
        chat = sourceProject.chats.find(c => c.id === chatId);
        sourceProject.chats = sourceProject.chats.filter(c => c.id !== chatId);
    }
    
    if (!chat) {
        alert('チャットが見つかりません');
        return;
    }
    
    // 移動先にチャットを追加
    const targetProject = hubData.projects[targetProjectId];
    
    if (targetSubfolderId) {
        const targetSubfolder = targetProject.subfolders.find(sf => sf.id === targetSubfolderId);
        if (targetSubfolder) {
            targetSubfolder.chats.push(chat);
        }
    } else {
        targetProject.chats.push(chat);
    }
    
    saveDataToStorage();
    
    // 両方のプロジェクトのUIを更新
    renderAllProjects();
    
    closeModal(modal);
    
    alert('チャットを移動しました');
}

// ==================== プロジェクト全体の再レンダリング ====================
function renderAllProjects() {
    document.querySelectorAll('.project-card').forEach(card => {
        const projectId = card.dataset.projectId;
        const project = hubData.projects[projectId];
        
        if (!project) return;
        
        // お気に入りアイコンの状態を更新
        const favoriteIcon = card.querySelector('.favorite-btn i');
        if (favoriteIcon) {
            if (project.favorite) {
                favoriteIcon.classList.remove('far');
                favoriteIcon.classList.add('fas');
                favoriteIcon.style.color = '#f59e0b';
            } else {
                favoriteIcon.classList.remove('fas');
                favoriteIcon.classList.add('far');
                favoriteIcon.style.color = '';
            }
        }
        
        // 展開状態の復元
        const details = card.querySelector('.project-details');
        const expandIcon = card.querySelector('.expand-btn i');
        
        if (project.expanded) {
            details.classList.add('active');
            expandIcon.classList.remove('fa-chevron-down');
            expandIcon.classList.add('fa-chevron-up');
            loadProjectData(card, projectId);
        } else {
            details.classList.remove('active');
            expandIcon.classList.remove('fa-chevron-up');
            expandIcon.classList.add('fa-chevron-down');
        }
    });
}

// ==================== モーダルを閉じる ====================
function closeModal(modal) {
    if (modal) {
        modal.classList.remove('active');
    }
}

// ==================== 検索処理 ====================
function handleSearch(e) {
    const query = e.target.value.toLowerCase().trim();
    
    document.querySelectorAll('.project-card').forEach(card => {
        const projectId = card.dataset.projectId;
        const project = hubData.projects[projectId];
        
        if (!project) return;
        
        const projectName = project.name.toLowerCase();
        let hasMatch = projectName.includes(query);
        
        // チャットタイトルでも検索
        if (!hasMatch) {
            hasMatch = project.chats.some(chat => 
                chat.title.toLowerCase().includes(query) ||
                (chat.description && chat.description.toLowerCase().includes(query))
            );
        }
        
        // サブフォルダとそのチャットでも検索
        if (!hasMatch) {
            hasMatch = project.subfolders.some(sf => 
                sf.name.toLowerCase().includes(query) ||
                sf.chats.some(chat =>
                    chat.title.toLowerCase().includes(query) ||
                    (chat.description && chat.description.toLowerCase().includes(query))
                )
            );
        }
        
        card.style.display = hasMatch || query === '' ? 'block' : 'none';
    });
}

// ==================== ナビゲーション処理 ====================
function handleNavigation(e) {
    e.preventDefault();
    
    const filter = e.currentTarget.dataset.filter;
    
    // アクティブ状態を更新
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    e.currentTarget.classList.add('active');
    
    // フィルタリング
    document.querySelectorAll('.project-card').forEach(card => {
        const projectId = card.dataset.projectId;
        const project = hubData.projects[projectId];
        
        if (!project) return;
        
        switch (filter) {
            case 'all':
                card.style.display = 'block';
                break;
            case 'favorites':
                card.style.display = project.favorite ? 'block' : 'none';
                break;
            case 'recent':
                card.style.display = project.lastAccessed ? 'block' : 'none';
                break;
        }
    });
}
