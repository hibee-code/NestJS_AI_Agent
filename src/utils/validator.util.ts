export function validateSchema(data: any): string | null {
if (!data || typeof data !== 'object') return 'Invalid request payload';
// extend with rules or per-route schemas
return null;
}