/**
 * Chat Interface JavaScript
 * Handles chat UI, API communication, and message rendering
 */

// ============================================
// CONFIGURATION
// ============================================

const CONFIG = {
    API_URL: window.location.hostname === 'localhost' 
        ? 'http://localhost:8000/api' 
        : 'https://portfolio-backend-deepanshu-malik.koyeb.app/api',
    SESSION_KEY: 'portfolio_chat_session',
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000
};

// ============================================
// STATE MANAGEMENT
// ============================================

const chatState = {
    isOpen: false,
    isLoading: false,
    sessionId: null,
    messages: [],
    currentSection: null,
    previousTopic: null
};

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initChat();
    initSessionId();
});

function initChat() {
    // Chat button handlers
    const chatBtn = document.getElementById('chat-btn');
    const chatCtaBtn = document.getElementById('chat-cta-btn');
    const chatCloseBtn = document.getElementById('chat-close-btn');
    const clearChatBtn = document.getElementById('clear-chat-btn');
    const chatWindow = document.getElementById('chat-window');
    const chatForm = document.getElementById('chat-form');
    const togglePanelBtn = document.getElementById('toggle-panel-btn');
    const closePanelBtn = document.getElementById('close-panel-btn');

    // Toggle chat window
    if (chatBtn) {
        chatBtn.addEventListener('click', toggleChat);
    }

    // CTA button opens chat
    if (chatCtaBtn) {
        chatCtaBtn.addEventListener('click', () => {
            openChat();
        });
    }

    // Close button
    if (chatCloseBtn) {
        chatCloseBtn.addEventListener('click', closeChat);
    }

    // Clear chat button
    if (clearChatBtn) {
        clearChatBtn.addEventListener('click', clearChatHistory);
    }

    // Form submission
    if (chatForm) {
        chatForm.addEventListener('submit', handleSubmit);
    }

    // Toggle detail panel
    if (togglePanelBtn) {
        togglePanelBtn.addEventListener('click', toggleDetailPanel);
    }

    // Close detail panel
    if (closePanelBtn) {
        closePanelBtn.addEventListener('click', () => {
            hideDetailPanel();
        });
    }

    // Initialize suggestion chip handlers
    initSuggestionChips();

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Escape to close chat
        if (e.key === 'Escape' && chatState.isOpen) {
            closeChat();
        }
    });
}

function initSessionId() {
    // Check for existing session
    let sessionId = localStorage.getItem(CONFIG.SESSION_KEY);

    if (!sessionId) {
        sessionId = generateSessionId();
        localStorage.setItem(CONFIG.SESSION_KEY, sessionId);
    }

    chatState.sessionId = sessionId;
}

function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// ============================================
// CHAT TOGGLE FUNCTIONS
// ============================================

function toggleChat() {
    if (chatState.isOpen) {
        closeChat();
    } else {
        openChat();
    }
}

function openChat() {
    const chatWindow = document.getElementById('chat-window');
    const chatBtn = document.getElementById('chat-btn');
    const chatIcon = document.getElementById('chat-icon');
    const closeIcon = document.getElementById('close-icon');

    chatWindow.classList.remove('hidden');
    chatIcon.classList.add('hidden');
    closeIcon.classList.remove('hidden');
    chatBtn.classList.remove('animate-pulse-glow');
    chatState.isOpen = true;

    // Focus on input
    setTimeout(() => {
        const input = document.getElementById('chat-input');
        if (input) input.focus();
    }, 100);
}

function closeChat() {
    const chatWindow = document.getElementById('chat-window');
    const chatBtn = document.getElementById('chat-btn');
    const chatIcon = document.getElementById('chat-icon');
    const closeIcon = document.getElementById('close-icon');

    chatWindow.classList.add('hidden');
    chatIcon.classList.remove('hidden');
    closeIcon.classList.add('hidden');
    chatBtn.classList.add('animate-pulse-glow');
    chatState.isOpen = false;
}

async function clearChatHistory() {
    if (!confirm('Clear chat history? This will start a new conversation.')) {
        return;
    }

    try {
        // Call API to delete session
        await fetch(`${CONFIG.API_URL}/chat/v2/session/${chatState.sessionId}`, {
            method: 'DELETE'
        });

        // Clear local state
        chatState.messages = [];
        chatState.previousTopic = null;

        // Clear UI - keep only welcome message
        const messagesContainer = document.getElementById('chat-messages');
        const welcomeMessage = messagesContainer.querySelector('.flex.gap-3');
        messagesContainer.innerHTML = '';
        if (welcomeMessage) {
            messagesContainer.appendChild(welcomeMessage);
        }

        // Generate new session ID
        initSessionId();

    } catch (error) {
        console.error('Error clearing chat:', error);
        alert('Failed to clear chat history. Please try again.');
    }
}

// Open chat with context (called from deep dive buttons)
window.openChatWithContext = function(context, type) {
    openChat();

    // Set context
    chatState.previousTopic = context;

    // Generate appropriate message based on type
    let message = '';
    if (type === 'project') {
        message = `Tell me more about the ${context.replace(/-/g, ' ')} project`;
    } else if (type === 'experience') {
        message = `What was your experience at ${context}?`;
    }

    // Send the message
    if (message) {
        setTimeout(() => {
            sendMessage(message);
        }, 300);
    }
};

// ============================================
// MESSAGE HANDLING
// ============================================

async function handleSubmit(e) {
    e.preventDefault();

    const input = document.getElementById('chat-input');
    const message = input.value.trim();

    if (!message || chatState.isLoading) return;

    input.value = '';
    await sendMessage(message);
}

async function sendMessage(message) {
    if (chatState.isLoading) return;

    // Add user message to UI
    addMessageToUI(message, 'user');

    // Show typing indicator
    showTypingIndicator();
    chatState.isLoading = true;

    try {
        await streamChatResponse(message);
    } catch (error) {
        console.error('Chat error:', error);
        hideTypingIndicator();
        addMessageToUI('Sorry, I encountered an error. Please try again.', 'bot');
    } finally {
        chatState.isLoading = false;
    }
}

async function streamChatResponse(message) {
    const response = await fetch(`${CONFIG.API_URL}/chat/v2/stream`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            message: message,
            session_id: chatState.sessionId,
            context: {
                current_section: chatState.currentSection,
                previous_topic: chatState.previousTopic
            }
        })
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    hideTypingIndicator();

    // Create message container for streaming
    const messagesContainer = document.getElementById('chat-messages');
    const messageWrapper = document.createElement('div');
    messageWrapper.className = 'flex gap-3';
    
    messageWrapper.innerHTML = `
        <div class="w-8 h-8 rounded-full bg-gradient-to-r from-accent-primary to-accent-secondary flex items-center justify-center flex-shrink-0">
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
        </div>
        <div class="flex-1 max-w-[85%]">
            <div class="message-bot px-4 py-3 text-sm streaming-content"></div>
        </div>
    `;
    
    messagesContainer.appendChild(messageWrapper);
    const contentDiv = messageWrapper.querySelector('.streaming-content');

    // Read stream
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';
    let buffer = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
            if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') continue;
                
                fullResponse += data;
                contentDiv.innerHTML = formatBotMessage(fullResponse);
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }
        }
    }

    // Get metadata from final response
    try {
        const metadataResponse = await fetch(`${CONFIG.API_URL}/chat/v2`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: '__GET_LAST_METADATA__',
                session_id: chatState.sessionId
            })
        });
        
        if (metadataResponse.ok) {
            const metadata = await metadataResponse.json();
            
            // Add sources and suggestions
            const containerDiv = messageWrapper.querySelector('.flex-1');
            if (metadata.sources) {
                containerDiv.innerHTML += renderSources(metadata.sources);
            }
            if (metadata.suggestions) {
                containerDiv.innerHTML += renderSuggestions(metadata.suggestions);
                initSuggestionChips();
            }
            
            chatState.previousTopic = metadata.intent;
        }
    } catch (e) {
        console.warn('Could not fetch metadata:', e);
    }
}

async function callChatAPI(message, retries = 0) {
    try {
        const response = await fetch(`${CONFIG.API_URL}/chat/v2`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                session_id: chatState.sessionId,
                context: {
                    current_section: chatState.currentSection,
                    previous_topic: chatState.previousTopic
                }
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();

    } catch (error) {
        if (retries < CONFIG.MAX_RETRIES) {
            await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY));
            return callChatAPI(message, retries + 1);
        }
        throw error;
    }
}

// ============================================
// UI RENDERING
// ============================================

function addMessageToUI(content, type, suggestions = null, detailPanel = null, sources = null) {
    const messagesContainer = document.getElementById('chat-messages');

    const messageWrapper = document.createElement('div');
    messageWrapper.className = `flex gap-3 ${type === 'user' ? 'justify-end' : ''}`;

    if (type === 'user') {
        // User message
        messageWrapper.innerHTML = `
            <div class="max-w-[80%]">
                <div class="message-user px-4 py-3 text-sm">
                    ${escapeHtml(content)}
                </div>
            </div>
        `;
    } else {
        // Bot message
        const formattedContent = formatBotMessage(content);

        messageWrapper.innerHTML = `
            <div class="w-8 h-8 rounded-full bg-gradient-to-r from-accent-primary to-accent-secondary flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                </svg>
            </div>
            <div class="flex-1 max-w-[85%]">
                <div class="message-bot px-4 py-3 text-sm">
                    ${formattedContent}
                </div>
                ${sources ? renderSources(sources) : ''}
                ${suggestions ? renderSuggestions(suggestions) : ''}
            </div>
        `;
    }

    messagesContainer.appendChild(messageWrapper);

    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Handle detail panel if provided
    if (detailPanel) {
        showDetailPanel(detailPanel);
    }

    // Re-initialize suggestion chip handlers
    if (suggestions) {
        initSuggestionChips();
    }
}

function formatBotMessage(content) {
    // Convert markdown-like formatting
    let formatted = escapeHtml(content);

    // Bold text
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Italic text
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Code inline
    formatted = formatted.replace(/`(.*?)`/g, '<code class="px-1 py-0.5 bg-bg-tertiary rounded text-accent-tertiary">$1</code>');

    // Line breaks
    formatted = formatted.replace(/\n/g, '<br>');

    // Checkmarks
    formatted = formatted.replace(/✅/g, '<span class="text-green-500">✅</span>');
    formatted = formatted.replace(/🔄/g, '<span class="text-yellow-500">🔄</span>');
    formatted = formatted.replace(/⚠️/g, '<span class="text-orange-500">⚠️</span>');

    return formatted;
}

function renderSources(sources) {
    if (!sources || sources.length === 0) return '';

    const uniqueSources = [...new Set(sources)];
    const sourceTags = uniqueSources.map(s => {
        const fileName = s.split('/').pop().replace('.md', '');
        return `<span class="inline-block px-2 py-1 text-xs rounded bg-accent-primary/10 text-accent-primary border border-accent-primary/20">${escapeHtml(fileName)}</span>`;
    }).join('');

    return `
        <div class="mt-2 pt-2 border-t border-white/5">
            <span class="text-xs text-text-secondary">Sources: </span>
            <div class="flex flex-wrap gap-1.5 mt-1">
                ${sourceTags}
            </div>
        </div>
    `;
}

function renderSuggestions(suggestions) {
    if (!suggestions || suggestions.length === 0) return '';

    const chips = suggestions.map(s => `
        <button class="suggestion-chip px-3 py-1.5 rounded-full text-xs bg-bg-tertiary/50 hover:bg-accent-primary/20 border border-white/10 hover:border-accent-primary/50 transition-all duration-300"
                data-action="${s.action}"
                data-target="${s.target}">
            ${escapeHtml(s.label)}
        </button>
    `).join('');

    return `
        <div class="flex flex-wrap gap-2 mt-3">
            ${chips}
        </div>
    `;
}

function initSuggestionChips() {
    document.querySelectorAll('.suggestion-chip').forEach(chip => {
        chip.addEventListener('click', async function() {
            const action = this.dataset.action;
            const target = this.dataset.target;
            const label = this.textContent.trim();

            if (action && target) {
                // Handle action-based chips (from API responses)
                await handleSuggestionAction(action, target);
            } else {
                // Handle text-based chips (like initial suggestions)
                await sendMessage(label);
            }
        });
    });
}

async function handleSuggestionAction(action, target) {
    if (action === 'code') {
        // Fetch and display code
        await fetchDetailContent('code', target);
    } else if (action === 'deepdive') {
        // Send as a question
        await sendMessage(`Tell me more about ${target.replace(/_/g, ' ')}`);
    } else if (action === 'compare') {
        // Fetch and display comparison table
        await fetchDetailContent('compare', target);
    }
}

// ============================================
// TYPING INDICATOR
// ============================================

function showTypingIndicator() {
    const messagesContainer = document.getElementById('chat-messages');

    const indicator = document.createElement('div');
    indicator.id = 'typing-indicator';
    indicator.className = 'flex gap-3';
    indicator.innerHTML = `
        <div class="w-8 h-8 rounded-full bg-gradient-to-r from-accent-primary to-accent-secondary flex items-center justify-center flex-shrink-0">
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
        </div>
        <div class="message-bot rounded-2xl rounded-tl-none typing-indicator">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;

    messagesContainer.appendChild(indicator);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function hideTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) {
        indicator.remove();
    }
}

// ============================================
// DETAIL PANEL
// ============================================

function toggleDetailPanel() {
    const panel = document.getElementById('detail-panel');
    const chatWindow = document.getElementById('chat-window');

    if (panel.classList.contains('hidden')) {
        panel.classList.remove('hidden');
        chatWindow.classList.add('panel-open');
    } else {
        panel.classList.add('hidden');
        chatWindow.classList.remove('panel-open');
    }
}

function showDetailPanel(data) {
    const panel = document.getElementById('detail-panel');
    const content = document.getElementById('detail-content');
    const chatWindow = document.getElementById('chat-window');

    // Show panel
    panel.classList.remove('hidden');
    chatWindow.classList.add('panel-open');

    // Render content based on type
    if (data.type === 'code') {
        content.innerHTML = renderCodeContent(data);
    } else if (data.type === 'table') {
        content.innerHTML = renderTableContent(data);
    } else {
        content.innerHTML = renderGenericContent(data);
    }

    // Highlight code if Prism is available
    if (window.Prism) {
        Prism.highlightAllUnder(content);
    }
}

function hideDetailPanel() {
    const panel = document.getElementById('detail-panel');
    const chatWindow = document.getElementById('chat-window');

    panel.classList.add('hidden');
    chatWindow.classList.remove('panel-open');
}

function renderCodeContent(data) {
    return `
        <div class="space-y-4">
            <h4 class="font-heading font-semibold text-accent-primary">${escapeHtml(data.title || 'Code')}</h4>

            <pre class="!m-0"><code class="language-${data.language || 'python'}">${escapeHtml(data.content)}</code></pre>

            ${data.explanation ? `
                <div class="mt-4">
                    <h5 class="font-semibold text-sm mb-2">Explanation</h5>
                    <p class="text-text-secondary text-sm">${escapeHtml(data.explanation)}</p>
                </div>
            ` : ''}

            <div class="flex gap-2 mt-4">
                <button onclick="copyToClipboard(\`${escapeHtml(data.content).replace(/`/g, '\\`')}\`)"
                        class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg-tertiary hover:bg-accent-primary/20 border border-white/10 text-sm transition-all">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                    </svg>
                    Copy
                </button>
                ${data.links?.github ? `
                    <a href="${data.links.github}" target="_blank"
                       class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg-tertiary hover:bg-accent-primary/20 border border-white/10 text-sm transition-all">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                        GitHub
                    </a>
                ` : ''}
            </div>
        </div>
    `;
}

function renderTableContent(data) {
    // Parse table data if it's a string
    let tableData = data.content;
    if (typeof tableData === 'string') {
        // Try to parse markdown table
        return `
            <div class="space-y-4">
                <h4 class="font-heading font-semibold text-accent-primary">${escapeHtml(data.title || 'Comparison')}</h4>
                <div class="overflow-x-auto">
                    <pre class="text-sm text-text-secondary whitespace-pre-wrap">${escapeHtml(tableData)}</pre>
                </div>
            </div>
        `;
    }

    return `
        <div class="space-y-4">
            <h4 class="font-heading font-semibold text-accent-primary">${escapeHtml(data.title || 'Comparison')}</h4>
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead>
                        <tr class="border-b border-white/10">
                            ${tableData.headers.map(h => `<th class="py-2 px-3 text-left text-text-secondary">${escapeHtml(h)}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${tableData.rows.map(row => `
                            <tr class="border-b border-white/5">
                                ${row.map(cell => `<td class="py-2 px-3">${escapeHtml(cell)}</td>`).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function renderGenericContent(data) {
    return `
        <div class="space-y-4">
            <h4 class="font-heading font-semibold text-accent-primary">${escapeHtml(data.title || 'Details')}</h4>
            <div class="text-sm text-text-secondary prose prose-invert max-w-none">
                ${formatBotMessage(data.content || '')}
            </div>
        </div>
    `;
}

async function fetchDetailContent(type, target) {
    showTypingIndicator();

    try {
        const response = await fetch(`${CONFIG.API_URL}/detail`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: type,
                target: target,
                session_id: chatState.sessionId
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        hideTypingIndicator();
        showDetailPanel(data);

    } catch (error) {
        console.error('Detail fetch error:', error);
        hideTypingIndicator();

        if (window.portfolioUtils?.showToast) {
            window.portfolioUtils.showToast('Failed to load details', 'error');
        }
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

window.copyToClipboard = async function(text) {
    try {
        await navigator.clipboard.writeText(text);
        if (window.portfolioUtils?.showToast) {
            window.portfolioUtils.showToast('Copied to clipboard!', 'success');
        }
    } catch (err) {
        console.error('Failed to copy:', err);
        if (window.portfolioUtils?.showToast) {
            window.portfolioUtils.showToast('Failed to copy', 'error');
        }
    }
};

// Track current section for context
document.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    let currentSection = null;

    sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 200 && rect.bottom >= 200) {
            currentSection = section.id;
        }
    });

    if (currentSection !== chatState.currentSection) {
        chatState.currentSection = currentSection;
    }
});
