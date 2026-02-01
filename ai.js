// ====================
// SMART AI INTEGRATION (Enhanced with retry logic)
// ====================
const SmartAI = {
    async callClaudeAPI(apiKey, model, prompt, retries = 3) {
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                const response = await fetch('https://api.anthropic.com/v1/messages', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': apiKey,
                        'anthropic-version': '2023-06-01'
                    },
                    body: JSON.stringify({
                        model: model,
                        max_tokens: 4000,
                        temperature: 0.7,
                        messages: [{ role: 'user', content: prompt }],
                        system: `You are an expert code generator. Always return valid JSON in the specified format. 
                        Generate production-ready, complete code with comments and error handling.`
                    })
                });

                if (!response.ok) {
                    if (response.status === 429 && attempt < retries) {
                        // Rate limited - wait and retry
                        const delay = Math.pow(2, attempt) * 1000;
                        await new Promise(resolve => setTimeout(resolve, delay));
                        continue;
                    }
                    
                    const errorText = await response.text();
                    throw new Error(`API Error ${response.status}: ${errorText}`);
                }

                return await response.json();
                
            } catch (error) {
                if (attempt === retries) throw error;
                console.warn(`API call failed, retrying (${attempt}/${retries}):`, error.message);
            }
        }
    },

    async generate(intent, apiKey, model = 'claude-sonnet-4-20250514') {
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

        try {
            updateStatus('Calling Claude API...', 'pending');
            
            const data = await this.callClaudeAPI(apiKey, model, prompt);
            const content = data.content[0].text;
            
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
                    result = JSON.parse(jsonMatch[0]);
                } else {
                    throw new Error('Could not parse JSON from API response');
                }
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

    async refineSnippet(code, instruction, apiKey, model = 'claude-sonnet-4-20250514') {
        if (!apiKey) throw new Error('API key required for refinement');

        const prompt = `You are an expert code refactorer.

INSTRUCTION: ${instruction}

ORIGINAL CODE:
${code}

TASK: Rewrite the code above based on the instruction. Return ONLY the updated code snippet. Do not include markdown formatting (like \`\`\`) or explanations. Just the raw code.`;

        try {
            updateStatus('Refining snippet...', 'pending');
            const data = await this.callClaudeAPI(apiKey, model, prompt);
            updateStatus('Ready', 'online');
            
            let result = data.content[0].text.trim();
            // Strip markdown if present
            result = result.replace(/^```[a-z]*\n?|\n?```$/g, '');
            return result;
        } catch (error) {
            updateStatus('Refinement Error', 'offline');
            throw error;
        }
    }
};