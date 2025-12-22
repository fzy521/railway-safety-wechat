#!/usr/bin/env node

/**
 * 梁邹铁路安全监控系统 - 统一启动脚本
 * Unified Startup Script for Railway Safety Monitoring System
 *
 * 使用方法：
 *   node start.js              # 默认启动（带数据库）
 *   node start.js --demo       # 演示模式（无数据库）
 *   node start.js --simple     # 简单模式
 *   node start.js --native     # 原生模式
 *
 * 环境变量：
 *   MODE=demo node start.js    # 通过环境变量设置模式
 */

const { spawn } = require('child_process');
const path = require('path');

// 解析命令行参数
const args = process.argv.slice(2);
const flags = {
  demo: args.includes('--demo'),
  simple: args.includes('--simple'),
  native: args.includes('--native'),
  help: args.includes('--help') || args.includes('-h')
};

// 显示帮助信息
if (flags.help) {
  console.log(`
🚂 梁邹铁路安全监控系统 - 统一启动脚本

使用方法：
  node start.js [选项]

选项：
  --demo     启动演示模式（无数据库依赖）
  --simple   启动简单模式
  --native   启动原生模式（零依赖）
  --help, -h 显示帮助信息

环境变量：
  MODE=demo  通过环境变量设置启动模式

示例：
  node start.js --demo     # 启动演示模式
  MODE=native node start.js # 启动原生模式
`);
  process.exit(0);
}

// 确定启动模式
let mode = 'server'; // 默认模式

if (flags.demo || process.env.MODE === 'demo') {
  mode = 'demo';
} else if (flags.simple || process.env.MODE === 'simple') {
  mode = 'simple';
} else if (flags.native || process.env.MODE === 'native') {
  mode = 'native';
}

// 模式配置
const modes = {
  server: {
    script: 'start-server.js',
    description: '完整服务器模式（含数据库）',
    color: '\x1b[32m' // 绿色
  },
  demo: {
    script: 'start-without-db.js',
    description: '演示模式（无数据库）',
    color: '\x1b[33m' // 黄色
  },
  simple: {
    script: 'start-simple.js',
    description: '简单模式',
    color: '\x1b[36m' // 青色
  },
  native: {
    script: 'start-native.js',
    description: '原生模式（零依赖）',
    color: '\x1b[35m' // 紫色
  }
};

const currentMode = modes[mode];

console.log(`\n🚂 梁邹铁路安全监控系统`);
console.log(`🎯 启动模式: ${currentMode.color}${currentMode.description}\x1b[0m`);
console.log(`📁 启动脚本: ${currentMode.script}\n`);

// 启动对应的脚本
const scriptPath = path.join(__dirname, currentMode.script);
const child = spawn('node', [scriptPath], {
  stdio: 'inherit',
  shell: true
});

child.on('error', (err) => {
  console.error(`❌ 启动失败: ${err.message}`);
  process.exit(1);
});

child.on('exit', (code) => {
  if (code !== 0) {
    console.error(`\n❌ 程序异常退出，退出码: ${code}`);

    // 如果是数据库相关错误，提示用户使用演示模式
    if (mode === 'server' && code === 1) {
      console.log(`\n💡 提示: 数据库连接失败，可以尝试使用演示模式:`);
      console.log(`   node start.js --demo\n`);
    }
  }
  process.exit(code);
});

// 处理进程终止
process.on('SIGINT', () => {
  console.log('\n👋 正在关闭服务器...');
  child.kill('SIGINT');
});

process.on('SIGTERM', () => {
  child.kill('SIGTERM');
});