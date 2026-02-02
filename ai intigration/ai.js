// ====================
// SMART AI INTEGRATION (Multi-Provider Support)
// ====================

const AI_PROVIDERS = {
    anthropic: {
        name: 'Anthropic',
        getEndpoint: () => {
            if (typeof state !== 'undefined' && state.settings?.proxyUrl) return state.settings.proxyUrl;
            return 'https://api.anthropic.com/v1/messages';
        },
        headers: (apiKey) => ({
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerously-allow-browser': 'true'
        }),
        createBody: (model, prompt, systemPrompt) => {
            const body = {
                model: model,
                max_tokens: 4000,
                temperature: 0.7,
                messages: [{ role: 'user', content: prompt }]
            };
            if (systemPrompt) body.system = systemPrompt;
            return body;
        },
        extractContent: (data) => data.content[0].text,
        extractUsage: (data) => data.usage || { input_tokens: 0, output_tokens: 0 }
    },
    openai: {
        name: 'OpenAI',
        getEndpoint: () => {
            if (typeof state !== 'undefined' && state.settings?.proxyUrl) return state.settings.proxyUrl;
            return 'https://api.openai.com/v1/chat/completions';
        },
        headers: (apiKey) => ({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        }),
        createBody: (model, prompt, systemPrompt) => ({
            model: model,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 4000
        }),
        extractContent: (data) => data.choices[0].message.content,
        extractUsage: (data) => data.usage || { input_tokens: 0, output_tokens: 0 }
    },
    groq: {
        name: 'Groq',
        getEndpoint: () => {
            if (typeof state !== 'undefined' && state.settings?.proxyUrl) return state.settings.proxyUrl;
            return 'https://api.groq.com/openai/v1/chat/completions';
        },
        headers: (apiKey) => ({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        }),
        createBody: (model, prompt, systemPrompt) => ({
            model: model,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 4000
        }),
        extractContent: (data) => data.choices[0].message.content,
        extractUsage: (data) => data.usage || { input_tokens: 0, output_tokens: 0 }
    }
};

const SmartAI = {
    async callAPI(providerName, apiKey, model, prompt, systemPrompt, retries = 3) {
        const provider = AI_PROVIDERS[providerName] || AI_PROVIDERS['anthropic'];
        const cleanKey = apiKey ? apiKey.trim() : '';
        const endpoint = provider.getEndpoint ? provider.getEndpoint() : provider.endpoint;
        
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                console.log(`[SmartAI] Sending request to ${provider.name} (${model}) at ${endpoint} - Attempt ${attempt}`);
                
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: provider.headers(cleanKey),
                    body: JSON.stringify(provider.createBody(model, prompt, systemPrompt))
                });

                if (!response.ok) {
                    if (response.status === 429 && attempt < retries) {
                        const delay = Math.pow(2, attempt) * 1000;
                        await new Promise(resolve => setTimeout(resolve, delay));
                        continue;
                    }
                    
                    const errorText = await response.text();
                    throw new Error(`API Error ${response.status}: ${errorText}`);
                }

                const data = await response.json();
                return {
                    content: provider.extractContent(data),
                    usage: provider.extractUsage(data)
                };
                
            } catch (error) {
                if (error.name === 'TypeError' && (error.message.includes('NetworkError') || error.message.includes('Failed to fetch'))) {
                    console.warn(`[SmartAI] Network request failed (Attempt ${attempt}/${retries}). Likely CORS error or invalid endpoint.`);
                    if (attempt === retries) {
                        throw new Error('Connection failed. Check API Key, Model, and CORS settings.');
                    }
                }

                if (attempt === retries) throw error;
                console.warn(`API call failed, retrying (${attempt}/${retries}):`, error.message);
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            }
        }
    },

    async generate(intent, apiKey, model, provider = 'anthropic') {
        if (!apiKey || apiKey.length < 20) {
            throw new Error('Invalid API key. Please check your settings.');
        }

        const prompt = `As a code generation AI, create a complete, production-ready implementation for: "${intent}"

Generate ONLY valid JSON in this exact format (no markdown, no extra text):
{
    "description": "Brief description of what was generated",
    "files": [
        {
            "path": "src/file/path.js",
            "language": "javascript",
            "lines": 45,
            "code": "// Complete code here..."
        }
    ],
    "validations": {
        "tests_passed": 5,
        "tests_total": 5,
        "coverage": 95
    },
    "assumptions": [
        "Key assumption 1",
        "Key assumption 2"
    ]
}

Requirements:
- Generate complete, working code (not placeholders)
- Include error handling and validation
- Follow best practices for the language/framework
- Add helpful comments
- Make it production-ready`;

        const systemPrompt = `You are an expert code generator. Always return valid JSON in the specified format. 
        Generate production-ready, complete code with comments and error handling.`;

        try {
            updateStatus(`Calling ${AI_PROVIDERS[provider]?.name || provider}...`, 'pending');
            
            const data = await this.callAPI(provider, apiKey, model, prompt, systemPrompt);
            const content = data.content;
            
            // Try to parse JSON from response
            let result;
            try {
                // Remove markdown if present
                const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
                result = JSON.parse(cleanContent);
            } catch (e) {
                // If parsing fails, try to extract JSON
                const jsonMatch = content.match(/{[\s\S]*}/);
                if (jsonMatch) {
                    try {
                        result = JSON.parse(jsonMatch[0]);
                    } catch (inner) {
                        throw new Error('Parsed JSON structure is invalid');
                    }
                } else {
                    throw new Error('Could not parse JSON from API response');
                }
            }
            
            if (!result || !Array.isArray(result.files)) {
                throw new Error('Invalid response format: missing files array');
            }
            
            // Update credits and analytics
            state.credits.used += data.usage.input_tokens + data.usage.output_tokens;
            state.credits.apiCalls++;
            state.analytics.totalTokens += data.usage.input_tokens + data.usage.output_tokens;
            
            updateStatus('Ready', 'online');
            
            return result;

        } catch (error) {
            updateStatus('API Error', 'offline');
            console.error('Smart AI error:', error);
            
            // Show error to user
            addMessage({
                type: 'system',
                content: `⚠️ Smart AI failed: ${error.message}. Falling back to rule-based generation.`,
                timestamp: Date.now(),
                role: 'system'
            });
            
            // Fallback to rule-based
            return RuleBasedAI.generate(intent);
        }
    },

    async refineSnippet(code, instruction, apiKey, model, provider = 'anthropic') {
        if (!apiKey) throw new Error('API key required for refinement');

        const prompt = `You are an expert code refactorer.

INSTRUCTION: ${instruction}

ORIGINAL CODE:
${code}

TASK: Rewrite the code above based on the instruction. Return ONLY the updated code snippet. Do not include markdown formatting (like \`\`\`) or explanations. Just the raw code.`;

        const systemPrompt = "You are an expert code refactorer. Return only the code.";

        try {
            updateStatus('Refining snippet...', 'pending');
            const data = await this.callAPI(provider, apiKey, model, prompt, systemPrompt);
            updateStatus('Ready', 'online');
            
            let result = data.content.trim();
            // Strip markdown if present
            result = result.replace(/^```[a-z]*\n?|\n?```$/g, '');
            return result;
        } catch (error) {
            updateStatus('Refinement Error', 'offline');
            throw error;
        }
    }
};

// Expose globally
if (typeof window !== 'undefined') {
    window.SmartAI = SmartAI;
}
if (typeof module !== 'undefined') {
    module.exports = SmartAI;
}