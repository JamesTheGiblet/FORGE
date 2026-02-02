// ====================
// STATE MANAGEMENT
// ====================
const state = {
    currentSessionId: null,
    sessions: [],
    messages: [],
    aiMode: 'rule',
    settings: {
        autoValidate: true,
        showSuggestions: true,
        saveConversations: true,
        showPatternSuggestions: true,
        apiKey: '',
        model: 'claude-3-5-sonnet-20241022',
        provider: 'anthropic'
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
    contextGathering: {
        active: false,
        phase: 0,
        questionIndex: 0,
        data: {}
    },
    isGenerating: false,
    isSettingsOpen: false,
    currentOverlay: null,
    activeTests: new Map(),
    originalCodeCache: new Map()
};