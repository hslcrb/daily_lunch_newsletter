const fs = require('fs');
const path = 'c:/Users/user/Documents/GITCLONES/n8n_workflows/daily_lunch_newsletter/workflows/daily_lunch_newsletter.json';
let w = JSON.parse(fs.readFileSync(path, 'utf8'));
console.log('before mapping', w.nodes.find(n => n.name === 'Create Topics').parameters.functionCode.slice(0,50));
// update mapping
const createNode = w.nodes.find(n => n.name === 'Create Topics');
createNode.parameters.functionCode = "// create one item per topic with RSS url\nconst mapping = {\n  '국내정치': 'https://rss.donga.com/politics.xml',\n  '국외정치': 'https://rss.donga.com/foreign.xml',\n  '호주이민': 'https://www.smh.com.au/rss/feed.xml',\n  '호주': 'https://www.abc.net.au/news/feed/51120/rss.xml',\n  '대한민국': 'https://rss.donga.com/total.xml',\n  'AI및SW': 'https://rss.feedburner.com/TechCrunch/'\n};\nreturn Object.keys(mapping).map(t=>({json:{topic:t,rssUrl:mapping[t]}}));";
console.log('after mapping', createNode.parameters.functionCode.slice(0,50));
// remove map node
w.nodes = w.nodes.filter(n => n.name !== 'Map Topic to RSS');
// adjust connections
if (w.connections['Create Topics']) {
  w.connections['Create Topics'].main = [[{node: 'RSS Feed Read', type: 'main', index: 0}]];
}
delete w.connections['Map Topic to RSS'];
// update filter node
const filterNode = w.nodes.find(n => n.name === 'Filter Items');
filterNode.parameters.functionCode = "// filter items by topic keyword\nconst topic = items[0].json.topic.toLowerCase();\nreturn items.filter(item=>{const title=(item.json.title||'').toLowerCase(); const desc=(item.json.content||item.json.description||'').toLowerCase(); return title.includes(topic)||desc.includes(topic);});";
// update format node
const formatNode = w.nodes.find(n => n.name === 'Format Output');
formatNode.parameters.functionCode = "// propagate topic and pick up title/content\nconst topic = items[0].json.topic||''; return items.map(i=>({json:{topic, title:i.json.title, content:i.json.content||i.json.description}}));";
fs.writeFileSync(path, JSON.stringify(w, null, 2));
console.log('modified');
