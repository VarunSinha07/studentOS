const fs = require('fs');
const content = fs.readFileSync('c:/Users/Varun/AppData/Roaming/Code/User/workspaceStorage/10f084884781255ef1e8d3ea0e3945b1/GitHub.copilot-chat/chat-session-resources/c0739170-f23b-439d-b184-5e4d80740eb9/call_MHxnR0lTWWFVZExGOVphU1dlYzc__vscode-1775272898127/content.txt', 'utf8');
const blocks = content.split('`').filter((_, i) => i % 2 !== 0);
const f1 = blocks[0].replace(/^typescript\n/,'');
const f2 = blocks[1].replace(/^tsx\n/,'');
const f3 = blocks[2].replace(/^tsx\n/,'');
fs.writeFileSync('e:/placement-training/studentos/actions/stats.ts', f1);
fs.writeFileSync('e:/placement-training/studentos/components/os-windows/DashboardApp.tsx', f2);
fs.writeFileSync('e:/placement-training/studentos/components/os-windows/StudyPlannerApp.tsx', f3);
