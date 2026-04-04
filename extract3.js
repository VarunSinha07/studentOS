const fs = require('fs');
const content = fs.readFileSync('c:/Users/Varun/AppData/Roaming/Code/User/workspaceStorage/10f084884781255ef1e8d3ea0e3945b1/GitHub.copilot-chat/chat-session-resources/c0739170-f23b-439d-b184-5e4d80740eb9/call_MHxnR0lTWWFVZExGOVphU1dlYzc__vscode-1775272898127/content.txt', 'utf8');
const regex = /`(typescript|tsx)\n([\s\S]*?)\n`/g;
const blocks = Array.from(content.matchAll(regex));
fs.writeFileSync('e:/placement-training/studentos/actions/stats.ts', blocks[0][2]);
fs.writeFileSync('e:/placement-training/studentos/components/os-windows/DashboardApp.tsx', blocks[1][2]);
fs.writeFileSync('e:/placement-training/studentos/components/os-windows/StudyPlannerApp.tsx', blocks[2][2]);
