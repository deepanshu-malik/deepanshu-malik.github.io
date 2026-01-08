const CONFIG = {
    API_URL: window.location.hostname === 'localhost' 
        ? 'http://localhost:8000/api' 
        : 'https://portfolio-backend-deepanshu-malik.koyeb.app/api',
};

const state = {
    currentConversationId: null,
    conversations: [],
    isLoading: false,
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadConversations();
    startNewConversation();
    
    document.getElementById('chat-form').addEventListener('submit', handleSubmit);
    document.getElementById('new-chat-btn').addEventListener('click', startNewConversation);
    document.getElementById('history-btn').addEventListener('click', toggleHistory);
    document.getElementById('message-input').addEventListener('input', autoResize);
    
    // Configure marked
    marked.setOptions({
        highlight: (code, lang) => {
            if (lang && hljs.getLanguage(lang)) {
                return hljs.highlight(code, { language: lang }).value;
            }
            return hljs.highlightAuto(code).value;
        },
        breaks: true,
        gfm: true
    });
    
    // Add welcome message
    addMessage('Hi! I\'m Deepanshu\'s AI assistant. Ask me about his projects, skills, or experience!', 'bot');
});

function loadConversations() {
    const saved = localStorage.getItem('chat_conversations');
    state.conversations = saved ? JSON.parse(saved) : [];
    renderHistory();
}

function saveConversations() {
    localStorage.setItem('chat_conversations', JSON.stringify(state.conversations));
}

function startNewConversation() {
    state.currentConversationId = `conv_${Date.now()}`;
    document.getElementById('messages').innerHTML = '';
    addMessage('Hi! I\'m Deepanshu\'s AI assistant. Ask me about his projects, skills, or experience!', 'bot');
    document.getElementById('message-input').focus();
}

function getCurrentConversation() {
    return state.conversations.find(c => c.id === state.currentConversationId);
}

function saveMessage(role, content, metadata = {}) {
    let conv = getCurrentConversation();
    if (!conv) {
        conv = {
            id: state.currentConversationId,
            title: 'New Conversation',
            messages: [],
            created_at: Date.now(),
            updated_at: Date.now(),
        };
        state.conversations.unshift(conv);
    }
    
    conv.messages.push({ role, content, ...metadata, timestamp: Date.now() });
    conv.updated_at = Date.now();
    
    // Generate title from first user message
    if (conv.messages.length === 2 && role === 'user') {
        conv.title = content.slice(0, 50) + (content.length > 50 ? '...' : '');
    }
    
    saveConversations();
    renderHistory();
}

async function handleSubmit(e) {
    e.preventDefault();
    if (state.isLoading) return;

    const input = document.getElementById('message-input');
    const message = input.value.trim();
    if (!message) return;

    input.value = '';
    autoResize({ target: input });
    
    addMessage(message, 'user');
    saveMessage('user', message);
    
    state.isLoading = true;
    showTyping();

    try {
        const response = await fetch(`${CONFIG.API_URL}/chat/v2`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message,
                session_id: state.currentConversationId
            })
        });

        const data = await response.json();
        hideTyping();
        addMessage(data.response, 'bot', data.sources, data.suggestions);
        saveMessage('bot', data.response, { sources: data.sources, suggestions: data.suggestions });
    } catch (error) {
        console.error('Error:', error);
        hideTyping();
        addMessage('Sorry, I encountered an error. Please try again.', 'bot');
    } finally {
        state.isLoading = false;
    }
}

function addMessage(content, type, sources = [], suggestions = []) {
    const container = document.getElementById('messages');
    const wrapper = document.createElement('div');
    wrapper.className = 'message';
    
    if (type === 'user') {
        wrapper.innerHTML = `<div class="message-user">${escapeHtml(content)}</div>`;
    } else {
        const renderedContent = marked.parse(content);
        const sourcesHtml = sources.length ? `
            <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid rgba(255, 255, 255, 0.1);">
                <span style="font-size: 0.75rem; color: #9ca3af;">Sources:</span>
                <div style="margin-top: 0.5rem;">
                    ${sources.map(s => `<span class="source-tag">${s.split('/').pop().replace('.md', '')}</span>`).join('')}
                </div>
            </div>
        ` : '';
        
        const suggestionsHtml = suggestions.length ? `
            <div style="margin-top: 1rem;">
                ${suggestions.map(s => `
                    <button class="suggestion-chip" data-action="${s.action}" data-target="${s.target}">
                        ${escapeHtml(s.label)}
                    </button>
                `).join('')}
            </div>
        ` : '';
        
        wrapper.innerHTML = `<div class="message-bot">${renderedContent}${sourcesHtml}${suggestionsHtml}</div>`;
    }
    
    container.appendChild(wrapper);
    container.scrollTop = container.scrollHeight;
    
    // Attach suggestion handlers
    if (type === 'bot' && suggestions.length) {
        wrapper.querySelectorAll('.suggestion-chip').forEach(btn => {
            btn.addEventListener('click', () => handleSuggestion(btn.dataset.action, btn.dataset.target));
        });
    }
}

async function handleSuggestion(action, target) {
    if (action === 'code' || action === 'compare') {
        try {
            const response = await fetch(`${CONFIG.API_URL}/detail`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, target, session_id: state.currentConversationId })
            });
            const data = await response.json();
            addMessage(data.content || data.title, 'bot');
            saveMessage('bot', data.content || data.title);
        } catch (error) {
            console.error('Error:', error);
        }
    } else {
        document.getElementById('message-input').value = `Tell me more about ${target}`;
        document.getElementById('chat-form').dispatchEvent(new Event('submit'));
    }
}

function showTyping() {
    const container = document.getElementById('messages');
    const typing = document.createElement('div');
    typing.id = 'typing-indicator';
    typing.className = 'message';
    typing.innerHTML = `
        <div class="typing-indicator">
            <span>Thinking</span>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        </div>
    `;
    container.appendChild(typing);
    container.scrollTop = container.scrollHeight;
}

function hideTyping() {
    const typing = document.getElementById('typing-indicator');
    if (typing) typing.remove();
}

function autoResize(e) {
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 192) + 'px';
}

function toggleHistory() {
    document.getElementById('history-sidebar').classList.toggle('open');
}

function renderHistory() {
    const list = document.getElementById('history-list');
    list.innerHTML = state.conversations.map(conv => `
        <div class="history-item" onclick="loadConversation('${conv.id}')">
            <div style="font-weight: 500; margin-bottom: 0.25rem;">${escapeHtml(conv.title)}</div>
            <div style="font-size: 0.75rem; color: #9ca3af;">${new Date(conv.updated_at).toLocaleDateString()}</div>
        </div>
    `).join('');
}

function loadConversation(id) {
    const conv = state.conversations.find(c => c.id === id);
    if (!conv) return;
    
    state.currentConversationId = id;
    document.getElementById('messages').innerHTML = '';
    
    conv.messages.forEach(msg => {
        addMessage(msg.content, msg.role, msg.sources || [], msg.suggestions || []);
    });
    
    toggleHistory();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
