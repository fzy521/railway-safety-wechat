require('dotenv').config();
const DatabaseManager = require('../models/database-manager');
const fs = require('fs');
const path = require('path');
const logger = require('./logger');

/**
 * 数据库备份工具
 */
class DatabaseBackup {
    constructor() {
        this.dbManager = new DatabaseManager();
        this.backupDir = process.env.DB_BACKUP_DIR || './backups';
        this.retentionDays = parseInt(process.env.BACKUP_RETENTION_DAYS) || 30;
    }

    /**
     * 执行数据库备份
     */
    async backup() {
        try {
            console.log('💾 开始数据库备份...');
            
            // 确保备份目录存在
            this.ensureBackupDirectory();
            
            // 执行备份
            const backupResult = this.dbManager.backup();
            
            if (backupResult.success) {
                console.log(`✅ 数据库备份成功: ${backupResult.backupPath}`);
                
                // 清理过期备份
                await this.cleanupOldBackups();
                
                // 记录备份日志
                logger.info('数据库备份成功', {
                    backupPath: backupResult.backupPath,
                    timestamp: backupResult.timestamp
                });
                
                return backupResult;
            } else {
                throw new Error('数据库备份失败');
            }
        } catch (error) {
            console.error('❌ 数据库备份失败:', error);
            logger.error('数据库备份失败', { error: error.message });
            throw error;
        } finally {
            this.dbManager.close();
        }
    }

    /**
     * 确保备份目录存在
     */
    ensureBackupDirectory() {
        if (!fs.existsSync(this.backupDir)) {
            fs.mkdirSync(this.backupDir, { recursive: true });
            console.log(`📁 创建备份目录: ${this.backupDir}`);
        }
    }

    /**
     * 清理过期备份
     */
    async cleanupOldBackups() {
        console.log('🧹 清理过期备份文件...');
        
        try {
            const files = fs.readdirSync(this.backupDir);
            const dbFiles = files.filter(file => file.endsWith('.db'));
            
            let deletedCount = 0;
            const now = new Date();
            
            for (const file of dbFiles) {
                const filePath = path.join(this.backupDir, file);
                const stats = fs.statSync(filePath);
                
                // 计算文件年龄（天）
                const fileAge = (now - stats.mtime) / (1000 * 60 * 60 * 24);
                
                if (fileAge > this.retentionDays) {
                    fs.unlinkSync(filePath);
                    deletedCount++;
                    console.log(`🗑️  删除过期备份: ${file}`);
                }
            }
            
            if (deletedCount > 0) {
                console.log(`✅ 清理完成，删除了 ${deletedCount} 个过期备份文件`);
                logger.info('清理过期备份文件', { deletedCount });
            } else {
                console.log('ℹ️  没有过期备份文件需要清理');
            }
        } catch (error) {
            console.warn('⚠️  清理过期备份失败:', error.message);
            logger.warn('清理过期备份失败', { error: error.message });
        }
    }

    /**
     * 列出所有备份文件
     */
    listBackups() {
        try {
            if (!fs.existsSync(this.backupDir)) {
                return { success: true, backups: [] };
            }
            
            const files = fs.readdirSync(this.backupDir);
            const dbFiles = files.filter(file => file.endsWith('.db'));
            
            const backups = dbFiles.map(file => {
                const filePath = path.join(this.backupDir, file);
                const stats = fs.statSync(filePath);
                
                return {
                    filename: file,
                    path: filePath,
                    size: stats.size,
                    created: stats.birthtime.toISOString(),
                    modified: stats.mtime.toISOString(),
                    sizeMB: (stats.size / (1024 * 1024)).toFixed(2)
                };
            }).sort((a, b) => new Date(b.modified) - new Date(a.modified));
            
            return {
                success: true,
                backups,
                total: backups.length,
                totalSize: backups.reduce((sum, backup) => sum + backup.size, 0)
            };
        } catch (error) {
            console.error('列出备份文件失败:', error);
            return { success: false, message: error.message };
        }
    }

    /**
     * 恢复数据库备份
     */
    async restore(backupFilename) {
        try {
            console.log(`🔄 开始恢复数据库备份: ${backupFilename}`);
            
            const backupPath = path.join(this.backupDir, backupFilename);
            
            if (!fs.existsSync(backupPath)) {
                throw new Error(`备份文件不存在: ${backupFilename}`);
            }
            
            // 执行恢复
            const restoreResult = this.dbManager.restore(backupPath);
            
            if (restoreResult.success) {
                console.log(`✅ 数据库恢复成功: ${backupFilename}`);
                logger.info('数据库恢复成功', {
                    backupFile: backupFilename,
                    timestamp: restoreResult.timestamp
                });
                
                return restoreResult;
            } else {
                throw new Error('数据库恢复失败');
            }
        } catch (error) {
            console.error('❌ 数据库恢复失败:', error);
            logger.error('数据库恢复失败', { 
                error: error.message,
                backupFile: backupFilename 
            });
            throw error;
        } finally {
            this.dbManager.close();
        }
    }

    /**
     * 验证备份文件完整性
     */
    async verifyBackup(backupFilename) {
        try {
            console.log(`🔍 验证备份文件完整性: ${backupFilename}`);
            
            const backupPath = path.join(this.backupDir, backupFilename);
            
            if (!fs.existsSync(backupPath)) {
                throw new Error(`备份文件不存在: ${backupFilename}`);
            }
            
            // 创建临时数据库连接来验证备份
            const tempDbManager = new DatabaseManager(backupPath);
            const healthCheck = tempDbManager.healthCheck();
            
            tempDbManager.close();
            
            if (healthCheck.success) {
                console.log(`✅ 备份文件验证通过: ${backupFilename}`);
                return { success: true, message: '备份文件完整性验证通过' };
            } else {
                throw new Error('备份文件完整性验证失败');
            }
        } catch (error) {
            console.error(`❌ 备份文件验证失败: ${backupFilename}`, error);
            return { success: false, message: error.message };
        }
    }

    /**
     * 获取备份统计信息
     */
    getBackupStats() {
        try {
            const listResult = this.listBackups();
            
            if (!listResult.success) {
                return listResult;
            }
            
            const { backups } = listResult;
            
            if (backups.length === 0) {
                return {
                    success: true,
                    stats: {
                        totalBackups: 0,
                        totalSize: 0,
                        oldestBackup: null,
                        newestBackup: null,
                        averageSize: 0
                    }
                };
            }
            
            const totalSize = backups.reduce((sum, backup) => sum + backup.size, 0);
            const oldestBackup = backups[backups.length - 1];
            const newestBackup = backups[0];
            const averageSize = totalSize / backups.length;
            
            return {
                success: true,
                stats: {
                    totalBackups: backups.length,
                    totalSize,
                    totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
                    oldestBackup: oldestBackup.modified,
                    newestBackup: newestBackup.modified,
                    averageSize,
                    averageSizeMB: (averageSize / (1024 * 1024)).toFixed(2)
                }
            };
        } catch (error) {
            console.error('获取备份统计信息失败:', error);
            return { success: false, message: error.message };
        }
    }
}

// 命令行接口
async function main() {
    const command = process.argv[2];
    const backup = new DatabaseBackup();
    
    try {
        switch (command) {
            case 'backup':
                await backup.backup();
                break;
                
            case 'list':
                const listResult = backup.listBackups();
                if (listResult.success) {
                    console.log('📋 备份文件列表:');
                    console.table(listResult.backups);
                    console.log(`\n总计: ${listResult.total} 个文件`);
                } else {
                    console.error('获取备份列表失败:', listResult.message);
                }
                break;
                
            case 'restore':
                const filename = process.argv[3];
                if (!filename) {
                    console.error('请指定要恢复的备份文件名');
                    process.exit(1);
                }
                await backup.restore(filename);
                break;
                
            case 'verify':
                const verifyFilename = process.argv[3];
                if (!verifyFilename) {
                    console.error('请指定要验证的备份文件名');
                    process.exit(1);
                }
                const verifyResult = await backup.verifyBackup(verifyFilename);
                console.log(verifyResult.message);
                break;
                
            case 'stats':
                const statsResult = backup.getBackupStats();
                if (statsResult.success) {
                    console.log('📊 备份统计信息:');
                    console.log(JSON.stringify(statsResult.stats, null, 2));
                } else {
                    console.error('获取备份统计失败:', statsResult.message);
                }
                break;
                
            default:
                console.log('用法:');
                console.log('  node backup-database.js backup          # 创建备份');
                console.log('  node backup-database.js list            # 列出备份');
                console.log('  node backup-database.js restore <file> # 恢复备份');
                console.log('  node backup-database.js verify <file>  # 验证备份');
                console.log('  node backup-database.js stats           # 备份统计');
                break;
        }
    } catch (error) {
        console.error('操作失败:', error.message);
        process.exit(1);
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    main();
}

module.exports = DatabaseBackup;