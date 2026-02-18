/**
 * Super Admin 初始化 Script
 * 用於在生產環境安全地建立第一個超級管理員帳號
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function initSuperAdmin() {
  console.log('🔧 初始化超級管理員...');
  console.log('');

  try {
    // 1. 建立或取得 SUPERADMIN 角色
    let superadminRole = await prisma.accountRole.findFirst({
      where: { code: 'SUPERADMIN' },
    });

    if (!superadminRole) {
      console.log('📝 建立 SUPERADMIN 角色...');
      superadminRole = await prisma.accountRole.create({
        data: {
          code: 'SUPERADMIN',
          name: '超級管理員',
          description: '系統最高權限擁有者,不受任何權限限制',
          isActive: true,
        },
      });
      console.log('✅ SUPERADMIN 角色已建立');
    } else {
      console.log('ℹ️  SUPERADMIN 角色已存在');
    }

    console.log('');

    // 2. 檢查是否已有超級管理員
    const existingSuperAdmin = await prisma.accountCustomUser.findFirst({
      where: { customRoleId: superadminRole.id },
    });

    if (existingSuperAdmin) {
      console.log('ℹ️  超級管理員已存在:');
      console.log(`   使用者名稱: ${existingSuperAdmin.username}`);
      console.log(`   Email: ${existingSuperAdmin.email}`);
      console.log(`   狀態: ${existingSuperAdmin.isActive ? '啟用' : '停用'}`);
      console.log('');
      console.log('如需重置密碼,請使用以下方式:');
      console.log('1. 透過後台 API: POST /account/users/:id/reset-password');
      console.log('2. 或直接在資料庫中更新密碼欄位');
      return;
    }

    // 3. 從環境變數讀取設定
    const username = process.env.SUPERADMIN_USERNAME || 'superadmin';
    const password = process.env.SUPERADMIN_PASSWORD || 'ChangeMe123!';
    const email = process.env.SUPERADMIN_EMAIL || 'admin@example.com';

    // 驗證密碼強度
    if (password.length < 8) {
      throw new Error('密碼長度不足 8 個字元');
    }

    console.log('📝 建立超級管理員帳號...');
    console.log(`   使用者名稱: ${username}`);
    console.log(`   Email: ${email}`);
    console.log('');

    // 4. 加密密碼
    console.log('🔒 加密密碼...');
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. 建立帳號
    await prisma.accountCustomUser.create({
      data: {
        username,
        password: hashedPassword,
        email,
        firstName: 'Super',
        lastName: 'Admin',
        customRoleId: superadminRole.id,
        role: 'ADMIN', // 保留舊的 role 欄位作為備用
        isActive: true,
        isStaff: true,
        isSuperuser: false,
        mustChangePassword: true, // 強制首次登入修改密碼
      },
      include: {
        customRole: true,
      },
    });

    console.log('✅ 超級管理員已建立!');
    console.log('');
    console.log('╔════════════════════════════════════════════╗');
    console.log('║       請務必記住以下登入資訊                 ║');
    console.log('╠════════════════════════════════════════════╣');
    console.log(`║ 使用者名稱: ${username.padEnd(28)}║`);
    console.log(`║ 密碼: ${password.padEnd(34)}║`);
    console.log(`║ Email: ${email.padEnd(33)}║`);
    console.log('╚════════════════════════════════════════════╝');
    console.log('');
    console.log('🔒 安全提醒:');
    console.log('   1. 請在首次登入後立即修改密碼');
    console.log('   2. 使用強密碼(至少 12 字元,包含大小寫、數字、特殊字元)');
    console.log('   3. 定期更換密碼');
    console.log('   4. 不要與他人分享此帳號');
    console.log('');
    
  } catch (error: any) {
    console.error('');
    console.error('❌ 初始化失敗:');
    console.error(`   ${error.message}`);
    console.error('');
    if (error.code === 'P2002') {
      console.error('💡 可能原因:');
      console.error('   - 使用者名稱已存在');
      console.error('   - 請嘗試使用不同的 SUPERADMIN_USERNAME');
    }
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 主程序
initSuperAdmin()
  .then(() => {
    console.log('🎉 初始化完成!');
    console.log('');
    process.exit(0);
  })
  .catch(() => {
    console.error('❌ 執行失敗');
    process.exit(1);
  });
