// c:\Users\gilbe\OneDrive\Desktop\FORGE\ai intigration\context-ai.js
const ContextAI = {
    config: {
        phase_1_questions: [
            "🚀 **Project Foundation**: What type of application are you building? (Web, Mobile, Desktop, API, Library, CLI, etc.)",
            "⚙️ **Tech Stack**: What languages, frameworks, and databases are you using? (Include versions if specific)",
            "🎯 **Current Goal**: What specific task are you working on right now? (Debugging, new feature, optimization, learning, etc.)",
            "📁 **File Context**: Which file or module are you currently editing? What's its purpose?",
            "🔧 **Build & Tools**: What build tools, package managers, or development tools are you using?"
        ],
        phase_2_questions: [
            "🏗️ **Architecture**: Any specific architecture patterns? (MVC, Microservices, Serverless, etc.)",
            "📏 **Scale**: What are your performance/scale requirements?",
            "🛡️ **Constraints**: Any specific constraints? (Security, compliance, legacy code, etc.)",
            "👥 **Team**: Is this solo or team development? Any coding standards to follow?",
            "🎨 **Preferences**: How do you prefer your code? (Verbose/comments, concise, functional/OOP, etc.)"
        ],
        phase_3_dynamic_questions: [
            "Would you like me to analyze this for potential improvements?",
            "Should I consider edge cases or specific error scenarios?",
            "Do you want test examples alongside the implementation?",
            "Are there any existing patterns in your codebase I should match?",
            "What's your priority: speed of development, performance, or maintainability?"
        ]
    },

    start() {
        state.contextGathering = {
            active: true,
            phase: 1,
            questionIndex: 0,
            data: {}
        };
        
        addMessage({
            type: 'system',
            content: "🧠 **Starting Context Gathering**\nI'll ask a few questions to better understand your project.",
            timestamp: Date.now(),
            role: 'system'
        });
        
        this.askNext();
    },

    isActive() {
        return state.contextGathering && state.contextGathering.active;
    },

    askNext() {
        const phaseKey = `phase_${state.contextGathering.phase}_questions`;
        const questions = state.contextGathering.phase === 3 
            ? this.config.phase_3_dynamic_questions 
            : this.config[phaseKey];
        
        if (!questions || state.contextGathering.questionIndex >= questions.length) {
            this.nextPhase();
            return;
        }

        const question = questions[state.contextGathering.questionIndex];
        addMessage({
            type: 'ai',
            content: question,
            timestamp: Date.now(),
            role: 'assistant'
        });
    },

    handleInput(input) {
        // Store answer
        const phaseKey = `phase_${state.contextGathering.phase}`;
        const qIndex = state.contextGathering.questionIndex;
        
        if (!state.contextGathering.data[phaseKey]) state.contextGathering.data[phaseKey] = [];
        
        // Get question text for record keeping
        const questions = state.contextGathering.phase === 3 
            ? this.config.phase_3_dynamic_questions 
            : this.config[`phase_${state.contextGathering.phase}_questions`];
            
        state.contextGathering.data[phaseKey].push({
            question: questions[qIndex],
            answer: input
        });

        // Advance
        state.contextGathering.questionIndex++;
        this.askNext();
    },

    nextPhase() {
        state.contextGathering.phase++;
        state.contextGathering.questionIndex = 0;
        
        if (state.contextGathering.phase > 3) {
            this.finish();
        } else {
            this.askNext();
        }
    },

    finish() {
        state.contextGathering.active = false;
        addMessage({
            type: 'system',
            content: "✅ **Context Gathering Complete!**\nI now have a deep understanding of your project requirements. You can start building.",
            timestamp: Date.now(),
            role: 'system'
        });
    },

    getContext() {
        if (!state.contextGathering || !state.contextGathering.data) return '';
        let text = '';
        
        ['phase_1', 'phase_2', 'phase_3'].forEach(p => {
            if (state.contextGathering.data[p]) {
                state.contextGathering.data[p].forEach(item => {
                    text += `Q: ${item.question}\nA: ${item.answer}\n\n`;
                });
            }
        });
        return text.trim();
    }
};

if (typeof window !== 'undefined') {
    window.ContextAI = ContextAI;
}
