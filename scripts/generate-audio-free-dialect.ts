/**
 * generate-audio-free-dialect.ts
 *
 * Downloads Arabic audio files from Google Translate TTS (no API key needed)
 * for MSA AND all natively supported dialects.
 */
import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

import { DIALECT_OVERRIDES } from '../src/data/course';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_BASE = path.join(__dirname, '../public', 'audio');
const DIALECTS = ['msa', 'egyptian', 'levantine', 'maghrebi', 'gulf'];

// ─── Content Lists (Abridged for brevity in the script, we will import or copy them)
// We will simply read them from the original mjs file to avoid duplicating the huge lists.
