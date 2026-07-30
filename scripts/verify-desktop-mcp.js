// Launch every server from claude_desktop_config.json exactly as Claude Desktop
// will - all at once, same as a cold app start - and measure time to tools/list
// against Desktop's 60s initialize deadline.
const { spawn } = require('child_process');
const fs = require('fs');

const CFG = process.env.APPDATA + '\\Claude\\claude_desktop_config.json';
const servers = JSON.parse(fs.readFileSync(CFG, 'utf8')).mcpServers;
const DEADLINE = 60000;

function run(name, spec) {
  return new Promise(resolve => {
    const t0 = Date.now();
    const child = spawn(spec.command, spec.args, {
      stdio: ['pipe', 'pipe', 'pipe'], shell: false,
      env: Object.assign({}, process.env, spec.env || {})
    });
    let buf = '', settled = false;
    const finish = r => { if (!settled) { settled = true; try { child.kill(); } catch (e) {} resolve(r); } };

    child.on('error', e => finish({ name, ok: false, detail: 'spawn failed: ' + e.message }));

    child.stdout.on('data', d => {
      buf += d.toString();
      let i;
      while ((i = buf.indexOf('\n')) >= 0) {
        const line = buf.slice(0, i).trim(); buf = buf.slice(i + 1);
        if (!line) continue;
        let m; try { m = JSON.parse(line); } catch (e) { continue; }
        if (m.id === 0 && m.result) {
          child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n');
          child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list', params: {} }) + '\n');
        }
        if (m.id === 1) {
          const tools = ((m.result || {}).tools || []).map(t => t.name);
          finish({ name, ok: true, ms: Date.now() - t0, tools });
        }
      }
    });

    // Claude Desktop's exact initialize
    setTimeout(() => child.stdin.write(JSON.stringify({
      jsonrpc: '2.0', id: 0, method: 'initialize',
      params: {
        protocolVersion: '2025-11-25',
        capabilities: { extensions: { 'io.modelcontextprotocol/ui': { mimeTypes: ['text/html;profile=mcp-app'] } } },
        clientInfo: { name: 'claude-ai', version: '0.1.0' }
      }
    }) + '\n'), 300);

    setTimeout(() => finish({ name, ok: false, detail: 'no tools/list within ' + DEADLINE / 1000 + 's' }), DEADLINE);
  });
}

(async () => {
  console.log('launching all ' + Object.keys(servers).length + ' servers simultaneously (cold-start simulation)\n');
  const results = await Promise.all(Object.entries(servers).map(([n, s]) => run(n, s)));
  let allOk = true;
  for (const r of results.sort((a, b) => a.name.localeCompare(b.name))) {
    if (r.ok) {
      console.log('PASS  ' + r.name.padEnd(24) + (r.ms / 1000).toFixed(1) + 's  ' +
        r.tools.length + ' tools' + (r.tools.length <= 8 ? ': ' + r.tools.join(', ') : ''));
    } else {
      allOk = false;
      console.log('FAIL  ' + r.name.padEnd(24) + r.detail);
    }
  }
  console.log('\n' + (allOk ? 'ALL SERVERS READY well inside the 60s window.'
    : 'SOME SERVERS STILL FAILING.'));
  process.exit(allOk ? 0 : 1);
})();
