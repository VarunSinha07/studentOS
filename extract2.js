const fs = require('fs');
const content = fs.readFileSync('c:/Users/Varun/AppData/Roaming/Code/User/workspaceStorage/10f084884781255ef1e8d3ea0e3945b1/GitHub.copilot-chat/chat-session-resources/c0739170-f23b-439d-b184-5e4d80740eb9/call_MHxnR0lTWWFVZExGOVphU1dlYzc__vscode-1775272898127/content.txt', 'utf8');
const blocks = content.split('`').filter((_, i) => i % 2 !== 0);
console.log(blocks.map(b => b.substring(0, 15)));
