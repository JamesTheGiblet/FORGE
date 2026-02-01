// ====================
// STATE MANAGEMENT
// ====================
const state = {
    messages: [],
    aiMode: 'rule',
    settings: {
        autoValidate: true,
        showSuggestions: true,
        saveConversations: true,
        showPatternSuggestions: true,
        apiKey: '',
        model: 'claude-sonnet-4-20250514'
    },
    credits: {
        used: 0,
        apiCalls: 0,
        limit: 100000
    },
    analytics: {
        totalGenerations: 0,
        successfulGenerations: 0,
        failedGenerations: 0,
        averageResponseTime: 0,
        mostUsedPatterns: {},
        dailyUsage: {},
        totalTokens: 0
    },
    isGenerating: false,
    isSettingsOpen: false,
    currentOverlay: null,
    activeTests: new Map(),
    originalCodeCache: new Map()
};