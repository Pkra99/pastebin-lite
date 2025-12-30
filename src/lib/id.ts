import { customAlphabet } from 'nanoid';

// URL-safe alphabet (no ambiguous characters like 0/O, 1/l/I)
const alphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz';
const nanoid = customAlphabet(alphabet, 12);

export function generatePasteId(): string {
    return nanoid();
}
