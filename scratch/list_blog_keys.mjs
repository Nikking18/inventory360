import { BLOG_POST_TRANSLATIONS } from '../lib/blogI18n.ts';
import { BLOG_POSTS } from '../lib/blogData.ts';

console.log('--- BLOG POSTS IN BLOG_DATA ---');
BLOG_POSTS.forEach((p, i) => console.log(`${i + 1}. [${p.slug}] -> "${p.title}"`));

console.log('\n--- KEYS IN BLOG_POST_TRANSLATIONS ---');
Object.keys(BLOG_POST_TRANSLATIONS).forEach(k => console.log(`- ${k}`));
