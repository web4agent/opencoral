#!/usr/bin/env node

/**
 * Web4 CLI Query Tool
 * AI Agent 可以查询 Irys 上的组件
 *
 * 使用方法:
 * node query.js --type=<component-type> [--version=<version>]
 *
 * 示例:
 * node query.js --type=nft-market --version=0.1.3
 */

const https = require('https');

class Web4Query {
    constructor() {
        // Default verified deployer from our previous extensive debugging
        this.defaultOwner = '0x686d02c17aa2018a883d2482eda798780aedb7f8';
        this.args = this.parseArgs();
    }

    parseArgs() {
        const args = {
            limit: 5,
            txid: null,
            help: false,
            owner: null,
            tags: [] // Array of { name, values: [] }
        };

        const reservedKeys = ['limit', 'txid', 'help', 'owner', 'from'];

        for (let i = 2; i < process.argv.length; i++) {
            const arg = process.argv[i];

            if (arg === '--help' || arg === '-h') {
                args.help = true;
                continue;
            }

            if (arg.startsWith('--')) {
                const parts = arg.slice(2).split('=');
                const key = parts[0];
                const value = parts.slice(1).join('='); // Handle values that might contain =

                if (reservedKeys.includes(key)) {
                    // Handle reserved config flags
                    if (key === 'limit') args.limit = parseInt(value);
                    if (key === 'txid') args.txid = value;
                    if (key === 'owner') args.owner = value;
                } else {
                    // Handle generic tags (e.g. --App-Name=Web4SNS)
                    if (value) {
                        args.tags.push({ name: key, values: [value] });
                    }
                }
            }
        }

        // If owner is not specified, use default
        if (!args.owner) {
            args.owner = this.defaultOwner;
        }

        return args;
    }

    showHelp() {
        console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🔍 Web4 Generic Query Tool
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

用法:
  node query.cjs [options] --TagName=TagValue ...

核心选项:
  --txid=<id>       直接查询 Transaction ID (忽略其他过滤条件)
  --owner=<addr>    指定发布者地址 (默认: 0x686...f7f8)
  --limit=<n>       返回结果数量 (默认: 5)
  -h, --help        显示本帮助

通用标签查询:
  你可以使用任意 --Key=Value 格式来添加过滤标签。
  
示例:

  # 1. 查询 Web4SNS 协议下的所有 Post (默认 Owner)
  node query.cjs --App-Name=Web4SNS --Object-Type=post

  # 2. 查询特定版本的 Layout
  node query.cjs --W4AP=layout --Version=1.1.0

  # 3. 指定 Owner 查询
  node query.cjs --App-Name=Web4SNS --owner=0xd08...

  # 4. 直接查看 TX 内容
  node query.cjs --txid=9FYSA9...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        `);
    }

    async fetchGraphQL(query) {
        return new Promise((resolve, reject) => {
            const data = JSON.stringify({ query });

            const options = {
                hostname: 'uploader.irys.xyz',
                path: '/graphql',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(data)
                }
            };

            const req = https.request(options, (res) => {
                let body = '';
                res.on('data', (chunk) => body += chunk);
                res.on('end', () => {
                    try {
                        const json = JSON.parse(body);
                        resolve(json);
                    } catch (error) {
                        reject(new Error('Invalid JSON response: ' + body.substring(0, 100)));
                    }
                });
            });

            req.on('error', reject);
            req.write(data);
            req.end();
        });
    }

    async fetchContent(txid) {
        return new Promise((resolve, reject) => {
            const options = {
                hostname: 'uploader.irys.xyz',
                path: `/${txid}`,
                method: 'GET'
            };

            const req = https.request(options, (res) => {
                let body = '';
                res.on('data', (chunk) => body += chunk);
                res.on('end', () => resolve(body));
            });

            req.on('error', reject);
            req.end();
        });
    }

    buildQuery() {
        // Construct tags string for GraphQL
        const tagsStr = this.args.tags.map(tag => {
            return `{ name: "${tag.name}", values: ${JSON.stringify(tag.values)} }`;
        }).join(',\n                ');

        // Allow query without tags if only owner is interesting (though Irys usually needs tags or heavy filtering)
        // But generally we want at least one tag.

        const tagsFilter = tagsStr ? `tags: [ ${tagsStr} ],` : '';

        return `{
            transactions(
                ${tagsFilter}
                owners: ["${this.args.owner}"],
                first: ${this.args.limit},
                order: DESC
            ) {
                edges {
                    node {
                        id
                        tags {
                            name
                            value
                        }
                    }
                }
            }
        }`;
    }

    async query() {
        if (this.args.help) {
            this.showHelp();
            return;
        }

        console.log(`\n🚀 Web4 Query Tool`);
        console.log(`────────────────────────────────────────`);

        // Mode 1: Direct TXID Lookup
        if (this.args.txid) {
            console.log(`📦 Analyzing Transaction: ${this.args.txid}`);
            try {
                const content = await this.fetchContent(this.args.txid);
                console.log(`✅ Fetch Success (${content.length} bytes)`);
                console.log(`────────────────────────────────────────`);
                try {
                    const json = JSON.parse(content);
                    console.log(JSON.stringify(json, null, 2));
                } catch {
                    console.log(content.substring(0, 500) + (content.length > 500 ? '...' : ''));
                }
                console.log(`────────────────────────────────────────`);
                console.log(`🔗 URL: https://uploader.irys.xyz/${this.args.txid}`);
            } catch (error) {
                console.error('❌ Error:', error.message);
            }
            return;
        }

        // Mode 2: Tag Search
        if (this.args.tags.length === 0) {
            console.error('⚠️  Warning: No filter tags provided. Querying by Owner only (may be slow).');
        }

        console.log(`👤 Owner: ${this.args.owner.slice(0, 8)}...`);
        this.args.tags.forEach(t => console.log(`🏷️  ${t.name}: ${t.values.join(', ')}`));
        console.log(`────────────────────────────────────────`);

        try {
            const query = this.buildQuery();
            // console.log("DEBUG QUERY:", query);
            const result = await this.fetchGraphQL(query);

            const edges = result.data?.transactions?.edges || [];

            if (edges.length === 0) {
                console.log('📭 No results found matching these criteria.');
                return;
            }

            console.log(`✅ Found ${edges.length} items:\n`);

            edges.forEach((edge, index) => {
                const node = edge.node;
                const tags = {};
                node.tags.forEach(t => tags[t.name] = t.value);

                // Try to identify the items
                const type = tags['W4AP'] || tags['App-Name'] || tags['Content-Type'] || 'Unknown';
                const ver = tags['Version'] || tags['App-Version'] || '';

                console.log(`[${index + 1}] ${type} ${ver ? 'v' + ver : ''}`);
                console.log(`    ID: ${node.id}`);
                console.log(`    URL: https://uploader.irys.xyz/${node.id}`);
                // Print all tags for debugging
                // console.log('    Tags:', JSON.stringify(tags)); 
                console.log('');
            });

        } catch (error) {
            console.error('❌ Query Failed:', error.message);
        }
    }
}

const querier = new Web4Query();
querier.query().catch(console.error);
