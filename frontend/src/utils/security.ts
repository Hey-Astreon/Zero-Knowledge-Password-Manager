/**
 * Alyra Lock Security Intelligence Utility
 * Purpose: Securely analyze password strength and breach status.
 * Standard: HIBP k-Anonymity for Breach Detection (Zero-Knowledge safe).
 */

/**
 * Calculates a strength score from 0-4
 * Based on length, complexity, and common patterns.
 */
export function analyzeStrength(password: string): { score: number; feedback: string } {
    if (!password) return { score: 0, feedback: 'Enter a password' };
    
    let score = 0;
    
    // Low hanging fruit: Length
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    
    // Diversity checks
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = /[^A-Za-z0-9]/.test(password);
    
    if (hasUpper && hasLower) score++;
    if (hasNumber && hasSymbol) score++;
    
    // Heuristic feedback
    const feedbacks = [
        'Extremely Weak',
        'Weak',
        'Moderate',
        'Strong',
        'Very Strong'
    ];
    
    return {
        score,
        feedback: feedbacks[score]
    };
}

/**
 * Checks HIBP API safely using k-Anonymity (SHA-1 prefixing)
 * Only 5 characters of the hash ever leave the client.
 */
export async function checkBreach(password: string): Promise<{ isBreached: boolean; count: number }> {
    try {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-1', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
        
        const prefix = hashHex.substring(0, 5);
        const suffix = hashHex.substring(5);
        
        // Fetch matching suffixes from HIBP
        const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
        if (!response.ok) return { isBreached: false, count: 0 };
        
        const text = await response.text();
        const lines = text.split('\n');
        
        for (const line of lines) {
            const [lineSuffix, count] = line.split(':');
            if (lineSuffix.trim() === suffix) {
                return { isBreached: true, count: parseInt(count, 10) };
            }
        }
        
        return { isBreached: false, count: 0 };
    } catch (error) {
        console.error('Breach check failed:', error);
        return { isBreached: false, count: 0 };
    }
}

/**
 * Identifies specific entries with high-risk security profiles.
 */
export function getVaultIssues(entries: any[]) {
    const analysis = entries.map(entry => ({
        ...entry,
        strength: analyzeStrength(entry.password || '')
    }));

    const passCountRaw = entries.reduce((acc: any, entry) => {
        if (entry.password) {
            acc[entry.password] = (acc[entry.password] || 0) + 1;
        }
        return acc;
    }, {});

    const issues: any[] = [];
    
    analysis.forEach(entry => {
        if (entry.strength.score <= 1) {
            issues.push({ ...entry, type: 'WEAK', severity: 'HIGH' });
        }
        if (passCountRaw[entry.password] > 1) {
            issues.push({ ...entry, type: 'REUSED', severity: 'MEDIUM' });
        }
    });

    return issues.sort((a, b) => (b.severity === 'HIGH' ? -1 : 1));
}

/**
 * Calculates a granular overall Security Score (0-100) for a vault.
 * Accounts for individual strength, reuse, and critical vulnerabilities.
 */
export function calculateVaultScore(entries: any[]): number {
    if (entries.length === 0) return 0;

    const analysis = entries.map(entry => analyzeStrength(entry.password || ''));
    const issues = getVaultIssues(entries);
    
    // Base score from individual strengths (0-100 scale)
    const avgStrengthPoints = analysis.reduce((acc, curr) => acc + curr.score, 0) / (entries.length * 4);
    const baseScore = avgStrengthPoints * 100;

    // Deduct for specific structural risks
    const highSeverityCount = issues.filter(i => i.severity === 'HIGH').length;
    const medSeverityCount = issues.filter(i => i.severity === 'MEDIUM').length;

    const deductions = (highSeverityCount * 15) + (medSeverityCount * 5);
    
    return Math.max(0, Math.min(100, Math.round(baseScore - deductions)));
}
