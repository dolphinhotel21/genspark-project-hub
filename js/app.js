// ==================== グローバル変数 ====================
let currentProjectId = null;
let currentSubfolderId = null;
let movingChatId = null;
let movingSourceProjectId = null;
let movingSourceSubfolderId = null;

let hubData = {
    projects: {
        'project-a': { id: 'project-a', name: 'プロジェクトA', color: 'purple', description: '', favorite: false, chats: [], subfolders: [], expanded: false, lastAccessed: null },
        'project-b': { id: 'project-b', name: 'プロジェクトB', color: 'blue',   description: '', favorite: false, chats: [], subfolders: [], expanded: false, lastAccessed: null },
        'project-c': { id: 'project-c', name: 'プロジェクトC', color: 'green',  description: '', favorite: false, chats: [], subfolders: [], expanded: false, lastAccessed: null },
        'project-d': { id: 'project-d', name: 'プロジェクトD', color: 'orange', description: '', favorite: false, chats: [], subfolders: [], expanded: false, lastAccessed: null },
        'project-e': { id: 'project-e', name: 'プロジェクトE', color: 'pink',   description: '', favorite: false, chats: [], subfolders: [], expanded: false, lastAccessed: null }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    setupTheme();
    loadDataFromStorage();
    initializeEventListeners();
    renderAllProjects();
});

function setupTheme() {
    const savedTheme = localStorage.getItem('genspark_theme') || 'light';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        const icon = document.querySelector('.theme-toggle i');
        if (icon) { icon.classList.remove('fa-moon'); icon.classList.add('fa-sun'); }
    }
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('genspark_theme', isDark ? 'dark' : 'light');
    const icon = document.querySelector('.theme-toggle i');
    if (icon) { icon.classList.toggle('fa-moon', !isDark); icon.classList.toggle('fa-sun', isDark); }
}

function loadDataFromStorage() {
    const saved = localStorage.getItem('genspark_hub_data');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            hubData.projects = { ...hubData.projects, ...parsed.projects };
        } catch (e) { console.error('データ読み込みエラー:', e); }
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

function escapeHtml(text) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(String(text)));
    return div.innerHTML;
}

function initializeEventListeners() {
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) themeToggle.addEventListener('click', toggleTheme);

    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.addEventListener('input', handleSearch);

    // FIX: .nav-link → .nav-item
    document.querySelectorAll('.nav-item').forEach(link => {
        link.addEventListener('click', handleNavigation);
    });

    document.querySelectorAll('.project-card').forEach(card => setupProjectCard(card));
    setupModalEventListeners();
}

function setupProjectCard(card) {
    // FIX: dataset.projectId → dataset.project  (HTML: data-project="project-a")
    const projectId = card.dataset.project;
    const header = card.querySelector('.project-header');
    const favoriteBtn = card.querySelector('.favorite-btn');
    const expandBtn = card.querySelector('.expand-btn');
    // FIX: .project-description (div) → .project-description textarea
    const descriptionTextarea = card.querySelector('.project-description textarea');
    const addChatBtn = card.querySelector('.add-chat-btn');
    const addSubfolderBtn = card.querySelector('.add-subfolder-btn');

    if (header) {
        header.addEventListener('click', (e) => {
            if (e.target.closest('.favorite-btn') || e.target.closest('.expand-btn')) return;
            toggleProjectExpand(card, projectId);
        });
    }
    if (favoriteBtn) favoriteBtn.addEventListener('click', (e) => { e.stopPropagation(); toggleFavorite(projectId); });
    if (expandBtn) expandBtn.addEventListener('click', (e) => { e.stopPropagation(); toggleProjectExpand(card, projectId); });
    if (descriptionTextarea) descriptionTextarea.addEventListener('blur', () => updateProjectDescription(projectId, descriptionTextarea.value));
    if (addChatBtn) addChatBtn.addEventListener('click', () => openAddChatModal(projectId, null));
    if (addSubfolderBtn) addSubfolderBtn.addEventListener('click', () => openAddSubfolderModal(projectId));
}

// FIX: CSS uses .project-card.expanded → add/remove 'expanded' on card
// FIX: .project-details does not exist in HTML → removed
function toggleProjectExpand(card, projectId) {
    const isExpanded = card.classList.contains('expanded');
    if (isExpanded) {
        card.classList.remove('expanded');
        hubData.projects[projectId].expanded = false;
    } else {
        card.classList.add('expanded');
        hubData.projects[projectId].expanded = true;
        hubData.projects[projectId].lastAccessed = Date.now();
        loadProjectData(card, projectId);
    }
    saveDataToStorage();
}

function loadProjectData(card, projectId) {
    const project = hubData.projects[projectId];
    const textarea = card.querySelector('.project-description textarea');
    if (textarea && project.description) textarea.value = project.description;
    renderChats(card, projectId);
    renderSubfolders(card, projectId);
    updateProjectMeta(card, projectId);
}

function updateProjectMeta(card, projectId) {
    const project = hubData.projects[projectId];
    const meta = card.querySelector('.project-meta');
    if (!meta) return;
    const total = project.chats.length + project.subfolders.reduce((s, sf) => s + sf.chats.length, 0);
    const lastStr = project.lastAccessed ? new Date(project.lastAccessed).toLocaleDateString('ja-JP') : '未使用';
    meta.textContent = `${total} チャット · 最終更新: ${lastStr}`;
}

function toggleFavorite(projectId) {
    const project = hubData.projects[projectId];
    project.favorite = !project.favorite;
    // FIX: [data-project-id="..."] → [data-project="..."]
    const card = document.querySelector(`[data-project="${projectId}"]`);
    const icon = card.querySelector('.favorite-btn i');
    if (project.favorite) { icon.classList.replace('far', 'fas'); icon.style.color = '#f59e0b'; }
    else { icon.classList.replace('fas', 'far'); icon.style.color = ''; }
    saveDataToStorage();
}

function updateProjectDescription(projectId, description) {
    if (hubData.projects[projectId]) {
        hubData.projects[projectId].description = description;
        saveDataToStorage();
    }
}

function createChatItemElement(chat, projectId, subfolderId) {
    const chatItem = document.createElement('div');
    chatItem.className = 'chat-item';
    chatItem.innerHTML = `
        <div class="chat-info">
            <div class="chat-icon"><i class="fas fa-comment"></i></div>
            <div class="chat-details">
                <a href="${escapeHtml(chat.url)}" target="_blank" rel="noopener noreferrer" class="chat-title">${escapeHtml(chat.title)}</a>
                ${chat.description ? `<p class="chat-description">${escapeHtml(chat.description)}</p>` : ''}
            </div>
        </div>
        <div class="chat-actions">
            <button class="btn-icon move-chat-btn" title="移動"><i class="fas fa-exchange-alt"></i></button>
            <button class="btn-icon delete-chat-btn" title="削除"><i class="fas fa-trash"></i></button>
        </div>`;
    chatItem.querySelector('.move-chat-btn').addEventListener('click', (e) => { e.stopPropagation(); openMoveChatModal(projectId, subfolderId, chat.id); });
    chatItem.querySelector('.delete-chat-btn').addEventListener('click', (e) => { e.stopPropagation(); deleteChat(projectId, subfolderId, chat.id); });
    return chatItem;
}

function renderChats(card, projectId) {
    const project = hubData.projects[projectId];
    const list = card.querySelector('.chats-list');
    if (!list) return;
    list.innerHTML = '';
    if (project.chats.length === 0) {
        list.innerHTML = '<div class="empty-state"><i class="fas fa-comments"></i><p>まだチャットがありません</p></div>';
        return;
    }
    project.chats.forEach(chat => list.appendChild(createChatItemElement(chat, projectId, null)));
}

function renderSubfolders(card, projectId) {
    const project = hubData.projects[projectId];
    const list = card.querySelector('.subfolders-list');
    if (!list) return;
    list.innerHTML = '';

    project.subfolders.forEach(subfolder => {
        const item = document.createElement('div');
        item.className = 'subfolder-item';
        item.dataset.subfolderId = subfolder.id;
        item.innerHTML = `
            <div class="subfolder-header">
                <div class="subfolder-info">
                    <div class="subfolder-icon"><i class="fas fa-folder"></i></div>
                    <div class="subfolder-text">
                        <span class="subfolder-name">${escapeHtml(subfolder.name)}</span>
                        ${subfolder.description ? `<span class="subfolder-description">${escapeHtml(subfolder.description)}</span>` : ''}
                    </div>
                </div>
                <div class="subfolder-actions">
                    <button class="btn-icon expand-subfolder-btn" title="展開"><i class="fas fa-chevron-down"></i></button>
                    <button class="btn-icon delete-subfolder-btn" title="削除"><i class="fas fa-trash"></i></button>
                </div>
            </div>
            <div class="subfolder-content">
                <div class="subfolder-chats-list"></div>
                <button class="btn-small add-subfolder-chat-btn" style="margin-top:8px;">
                    <i class="fas fa-plus"></i> チャットを追加
                </button>
            </div>`;

        renderSubfolderChats(item, projectId, subfolder);

        const expandBtn = item.querySelector('.expand-subfolder-btn');
        // FIX: CSS uses .subfolder-item.expanded → toggle 'expanded' on item
        const toggleSub = () => {
            const expanded = item.classList.toggle('expanded');
            const icon = expandBtn.querySelector('i');
            icon.classList.toggle('fa-chevron-down', !expanded);
            icon.classList.toggle('fa-chevron-up', expanded);
        };
        expandBtn.addEventListener('click', (e) => { e.stopPropagation(); toggleSub(); });
        item.querySelector('.subfolder-header').addEventListener('click', (e) => {
            if (e.target.closest('.delete-subfolder-btn')) return;
            toggleSub();
        });
        item.querySelector('.delete-subfolder-btn').addEventListener('click', (e) => { e.stopPropagation(); deleteSubfolder(projectId, subfolder.id); });
        item.querySelector('.add-subfolder-chat-btn').addEventListener('click', () => openAddChatModal(projectId, subfolder.id));
        list.appendChild(item);
    });
}

function renderSubfolderChats(subfolderEl, projectId, subfolder) {
    const list = subfolderEl.querySelector('.subfolder-chats-list');
    if (!list) return;
    list.innerHTML = '';
    if (subfolder.chats.length === 0) {
        list.innerHTML = '<div class="empty-state" style="padding:16px 0;"><i class="fas fa-comments"></i><p>まだチャットがありません</p></div>';
        return;
    }
    subfolder.chats.forEach(chat => list.appendChild(createChatItemElement(chat, projectId, subfolder.id)));
}

function setupModalEventListeners() {
    // FIX: .cancel-btn → .modal-cancel / .modal-close
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(modal); });
        modal.querySelectorAll('.modal-close, .modal-cancel').forEach(btn => btn.addEventListener('click', () => closeModal(modal)));
    });

    // FIX: form submit → button click events
    const saveChatBtn = document.getElementById('saveChatBtn');
    if (saveChatBtn) saveChatBtn.addEventListener('click', handleAddChat);

    const saveSubfolderBtn = document.getElementById('saveSubfolderBtn');
    if (saveSubfolderBtn) saveSubfolderBtn.addEventListener('click', handleAddSubfolder);

    const confirmMoveBtn = document.getElementById('confirmMoveBtn');
    if (confirmMoveBtn) confirmMoveBtn.addEventListener('click', handleMoveChat);

    // FIX: register change listener only once (not per modal open) to prevent duplicates
    const moveTargetProject = document.getElementById('moveTargetProject');
    if (moveTargetProject) moveTargetProject.addEventListener('change', updateSubfolderOptions);
}

function openAddChatModal(projectId, subfolderId = null) {
    const modal = document.getElementById('addChatModal');
    currentProjectId = projectId;
    currentSubfolderId = subfolderId;
    document.getElementById('chatTitle').value = '';
    document.getElementById('chatUrl').value = '';
    // FIX: chatDescription → chatNotes  (matches HTML id="chatNotes")
    document.getElementById('chatNotes').value = '';
    modal.classList.add('active');
    document.getElementById('chatTitle').focus();
}

function handleAddChat() {
    const title = document.getElementById('chatTitle').value.trim();
    const url = document.getElementById('chatUrl').value.trim();
    const description = document.getElementById('chatNotes').value.trim();
    if (!title) { alert('タイトルを入力してください'); return; }
    if (!url)   { alert('URLを入力してください'); return; }

    const chat = { id: 'chat-' + Date.now(), title, url, description, createdAt: Date.now() };
    const project = hubData.projects[currentProjectId];
    if (currentSubfolderId) {
        const sf = project.subfolders.find(s => s.id === currentSubfolderId);
        if (sf) sf.chats.push(chat);
    } else {
        project.chats.push(chat);
    }
    project.lastAccessed = Date.now();
    saveDataToStorage();

    const card = document.querySelector(`[data-project="${currentProjectId}"]`);
    if (currentSubfolderId) {
        const sf = project.subfolders.find(s => s.id === currentSubfolderId);
        const sfEl = card.querySelector(`[data-subfolder-id="${currentSubfolderId}"]`);
        if (sfEl) renderSubfolderChats(sfEl, currentProjectId, sf);
    } else {
        renderChats(card, currentProjectId);
    }
    updateProjectMeta(card, currentProjectId);
    closeModal(document.getElementById('addChatModal'));
}

function deleteChat(projectId, subfolderId, chatId) {
    if (!confirm('このチャットを削除しますか？')) return;
    const project = hubData.projects[projectId];
    const card = document.querySelector(`[data-project="${projectId}"]`);
    if (subfolderId) {
        const sf = project.subfolders.find(s => s.id === subfolderId);
        if (sf) {
            sf.chats = sf.chats.filter(c => c.id !== chatId);
            const sfEl = card.querySelector(`[data-subfolder-id="${subfolderId}"]`);
            if (sfEl) renderSubfolderChats(sfEl, projectId, sf);
        }
    } else {
        project.chats = project.chats.filter(c => c.id !== chatId);
        renderChats(card, projectId);
    }
    updateProjectMeta(card, projectId);
    saveDataToStorage();
}

function openAddSubfolderModal(projectId) {
    const modal = document.getElementById('addSubfolderModal');
    currentProjectId = projectId;
    document.getElementById('subfolderName').value = '';
    document.getElementById('subfolderDescription').value = '';
    modal.classList.add('active');
    document.getElementById('subfolderName').focus();
}

function handleAddSubfolder() {
    const name = document.getElementById('subfolderName').value.trim();
    const description = document.getElementById('subfolderDescription').value.trim();
    if (!name) { alert('フォルダ名を入力してください'); return; }
    const subfolder = { id: 'subfolder-' + Date.now(), name, description, chats: [], createdAt: Date.now() };
    hubData.projects[currentProjectId].subfolders.push(subfolder);
    saveDataToStorage();
    const card = document.querySelector(`[data-project="${currentProjectId}"]`);
    renderSubfolders(card, currentProjectId);
    closeModal(document.getElementById('addSubfolderModal'));
}

function deleteSubfolder(projectId, subfolderId) {
    const project = hubData.projects[projectId];
    const sf = project.subfolders.find(s => s.id === subfolderId);
    const msg = (sf && sf.chats.length > 0)
        ? `「${sf.name}」にはチャットが含まれています。本当に削除しますか？`
        : `「${sf ? sf.name : 'このフォルダ'}」を削除しますか？`;
    if (!confirm(msg)) return;
    project.subfolders = project.subfolders.filter(s => s.id !== subfolderId);
    saveDataToStorage();
    const card = document.querySelector(`[data-project="${projectId}"]`);
    renderSubfolders(card, projectId);
    updateProjectMeta(card, projectId);
}

function openMoveChatModal(projectId, subfolderId, chatId) {
    const modal = document.getElementById('moveChatModal');
    const project = hubData.projects[projectId];
    let chat;
    if (subfolderId) {
        const sf = project.subfolders.find(s => s.id === subfolderId);
        chat = sf ? sf.chats.find(c => c.id === chatId) : null;
    } else {
        chat = project.chats.find(c => c.id === chatId);
    }
    if (!chat) return;

    movingSourceProjectId = projectId;
    movingSourceSubfolderId = subfolderId;
    movingChatId = chatId;
    document.getElementById('moveChatTitle').textContent = chat.title;

    // FIX: targetProject → moveTargetProject  (matches HTML id)
    const sel = document.getElementById('moveTargetProject');
    sel.innerHTML = '<option value="">プロジェクトを選択...</option>';
    Object.values(hubData.projects).forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.id; opt.textContent = p.name;
        sel.appendChild(opt);
    });
    updateSubfolderOptions();
    modal.classList.add('active');
}

function updateSubfolderOptions() {
    const selectedId = document.getElementById('moveTargetProject').value;
    // FIX: targetSubfolder → moveTargetSubfolder  (matches HTML id)
    const subSel = document.getElementById('moveTargetSubfolder');
    const subGroup = document.getElementById('moveTargetSubfolderGroup');
    subSel.innerHTML = '<option value="">プロジェクトのルート</option>';
    if (selectedId && hubData.projects[selectedId] && hubData.projects[selectedId].subfolders.length > 0) {
        hubData.projects[selectedId].subfolders.forEach(sf => {
            const opt = document.createElement('option');
            opt.value = sf.id; opt.textContent = sf.name;
            subSel.appendChild(opt);
        });
        subGroup.style.display = 'block';
    } else {
        subGroup.style.display = 'none';
    }
}

function handleMoveChat() {
    const targetProjectId = document.getElementById('moveTargetProject').value;
    const targetSubfolderId = document.getElementById('moveTargetSubfolder').value;
    if (!targetProjectId) { alert('移動先のプロジェクトを選択してください'); return; }
    if (movingSourceProjectId === targetProjectId && (movingSourceSubfolderId || '') === (targetSubfolderId || '')) {
        alert('移動先が同じです'); return;
    }
    const srcProject = hubData.projects[movingSourceProjectId];
    let chat;
    if (movingSourceSubfolderId) {
        const srcSf = srcProject.subfolders.find(s => s.id === movingSourceSubfolderId);
        if (srcSf) { chat = srcSf.chats.find(c => c.id === movingChatId); srcSf.chats = srcSf.chats.filter(c => c.id !== movingChatId); }
    } else {
        chat = srcProject.chats.find(c => c.id === movingChatId);
        srcProject.chats = srcProject.chats.filter(c => c.id !== movingChatId);
    }
    if (!chat) { alert('チャットが見つかりません'); return; }
    const tgtProject = hubData.projects[targetProjectId];
    if (targetSubfolderId) {
        const tgtSf = tgtProject.subfolders.find(s => s.id === targetSubfolderId);
        if (tgtSf) tgtSf.chats.push(chat);
    } else {
        tgtProject.chats.push(chat);
    }
    saveDataToStorage();
    renderAllProjects();
    closeModal(document.getElementById('moveChatModal'));
}

function renderAllProjects() {
    document.querySelectorAll('.project-card').forEach(card => {
        const projectId = card.dataset.project;
        const project = hubData.projects[projectId];
        if (!project) return;
        const icon = card.querySelector('.favorite-btn i');
        if (icon) {
            if (project.favorite) { icon.classList.replace('far', 'fas'); icon.style.color = '#f59e0b'; }
            else { icon.classList.replace('fas', 'far'); icon.style.color = ''; }
        }
        if (project.expanded) { card.classList.add('expanded'); loadProjectData(card, projectId); }
        else { card.classList.remove('expanded'); }
        updateProjectMeta(card, projectId);
    });
}

function closeModal(modal) { if (modal) modal.classList.remove('active'); }

function handleSearch(e) {
    const query = e.target.value.toLowerCase().trim();
    document.querySelectorAll('.project-card').forEach(card => {
        const project = hubData.projects[card.dataset.project];
        if (!project) return;
        const match = project.name.toLowerCase().includes(query)
            || project.chats.some(c => c.title.toLowerCase().includes(query) || (c.description && c.description.toLowerCase().includes(query)))
            || project.subfolders.some(sf => sf.name.toLowerCase().includes(query)
                || sf.chats.some(c => c.title.toLowerCase().includes(query) || (c.description && c.description.toLowerCase().includes(query))));
        card.style.display = (match || query === '') ? '' : 'none';
    });
}

// FIX: dataset.filter → dataset.section  |  .nav-link → .nav-item
function handleNavigation(e) {
    e.preventDefault();
    const section = e.currentTarget.dataset.section;
    document.querySelectorAll('.nav-item').forEach(l => l.classList.remove('active'));
    e.currentTarget.classList.add('active');
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';
    document.querySelectorAll('.project-card').forEach(card => {
        const project = hubData.projects[card.dataset.project];
        if (!project) return;
        switch (section) {
            case 'all':       card.style.display = ''; break;
            case 'favorites': card.style.display = project.favorite ? '' : 'none'; break;
            case 'recent':    card.style.display = project.lastAccessed ? '' : 'none'; break;
        }
    });
}
