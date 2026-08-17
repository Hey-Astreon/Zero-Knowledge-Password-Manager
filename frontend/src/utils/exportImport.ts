/**
 * Alyra Lock Vault Export & Import Utility
 * Securely handles exporting decrypted vault items to CSV/JSON and importing external credential files.
 */

export function exportVaultToCSV(entries: any[]) {
    if (!entries || entries.length === 0) return;

    const headers = ['title', 'username', 'password', 'notes', 'url'];
    const rows = entries.map(entry => [
        `"${(entry.site || '').replace(/"/g, '""')}"`,
        `"${(entry.username || '').replace(/"/g, '""')}"`,
        `"${(entry.password || '').replace(/"/g, '""')}"`,
        `"${(entry.notes || '').replace(/"/g, '""')}"`,
        `"${(entry.url || entry.site || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `alyra-lock-vault-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

export function exportVaultToJSON(entries: any[]) {
    if (!entries || entries.length === 0) return;

    const cleanEntries = entries.map(e => ({
        site: e.site,
        username: e.username,
        password: e.password,
        notes: e.notes || '',
        createdAt: e.createdAt || new Date().toISOString()
    }));

    const payload = {
        app: 'Alyra Lock',
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        entriesCount: cleanEntries.length,
        entries: cleanEntries
    };

    const jsonContent = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `alyra-lock-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

export async function parseImportFile(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                if (!content) return resolve([]);

                // Check if JSON
                if (file.name.endsWith('.json') || content.trim().startsWith('{')) {
                    const parsed = JSON.parse(content);
                    const items = parsed.entries || parsed.items || (Array.isArray(parsed) ? parsed : []);
                    const mapped = items.map((item: any) => ({
                        site: item.site || item.title || item.name || 'Imported Entry',
                        username: item.username || item.login?.username || item.email || '',
                        password: item.password || item.login?.password || '',
                        notes: item.notes || item.notesText || ''
                    }));
                    return resolve(mapped.filter((m: any) => m.password));
                }

                // Otherwise parse CSV
                const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
                if (lines.length < 2) return resolve([]);

                const headers = lines[0].toLowerCase().split(',').map(h => h.replace(/"/g, '').trim());
                const siteIdx = headers.findIndex(h => h.includes('title') || h.includes('name') || h.includes('url') || h.includes('site'));
                const userIdx = headers.findIndex(h => h.includes('user') || h.includes('login') || h.includes('email'));
                const passIdx = headers.findIndex(h => h.includes('pass') || h.includes('secret'));
                const noteIdx = headers.findIndex(h => h.includes('note') || h.includes('comment'));

                const imported: any[] = [];
                for (let i = 1; i < lines.length; i++) {
                    const cols = lines[i].split(',').map(c => c.replace(/^"|"$/g, '').trim());
                    const password = cols[passIdx >= 0 ? passIdx : 2] || '';
                    if (password) {
                        imported.push({
                            site: cols[siteIdx >= 0 ? siteIdx : 0] || 'Imported Password',
                            username: cols[userIdx >= 0 ? userIdx : 1] || '',
                            password,
                            notes: cols[noteIdx >= 0 ? noteIdx : 3] || ''
                        });
                    }
                }

                resolve(imported);
            } catch (err) {
                reject(new Error('Failed to parse file. Make sure it is a valid CSV or JSON password export.'));
            }
        };

        reader.onerror = () => reject(new Error('Error reading file.'));
        reader.readAsText(file);
    });
}
