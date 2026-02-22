require("dotenv").config();
const Irys = require("@irys/sdk");
const fs = require("fs");
const path = require("path");

// === 解析命令行参数 ===
function parseArgs() {
  const args = process.argv.slice(2);
  const config = {
    file: null,
    type: null,
    version: "0.1.0",
    tag: "web4-test",
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (!arg.startsWith("--")) {
      config.file = arg;
    } else if (arg.startsWith("--type=")) {
      config.type = arg.split("=")[1];
    } else if (arg.startsWith("--version=")) {
      config.version = arg.split("=")[1];
    } else if (arg.startsWith("--tag=")) {
      config.tag = arg.split("=")[1];
    }
  }

  return config;
}

// === Lazy Funding (Simplified or via SDK) ===
// Irys V1 SDK handles funding nicely, but we can verify balance.
const checkBalance = async (irys, size) => {
  try {
    const price = await irys.getPrice(size);
    const balance = await irys.getLoadedBalance();
    console.log(`💰 费用: ${irys.utils.fromAtomic(price)} | 余额: ${irys.utils.fromAtomic(balance)}`);

    if (balance.lt(price)) {
      console.log("💳 余额不足，尝试自动充值...");
      try {
        await irys.fund(price);
        console.log("✅ 充值完成");
      } catch (err) {
        console.error("❌ 充值失败 (可能需要手动充值):", err.message);
        // Don't exit, try upload anyway just in case
      }
    }
    return true;
  } catch (e) {
    console.error("⚠️  Balance check failed:", e.message);
    return true; // Proceed anyway
  }
};

// === 初始化 Irys Uploader ===
const getIrysUploader = async () => {
  try {
    if (!process.env.PRIVATE_KEY) {
      throw new Error("请在 .env 文件中设置 PRIVATE_KEY");
    }
    const irys = new Irys({
      url: "https://uploader.irys.xyz", // Mainnet
      token: "bnb", // Verified token from previous successful scripts
      key: process.env.PRIVATE_KEY,
    });
    console.log("✅ Irys 初始化完成 (Mainnet/BNB)");
    return irys;
  } catch (error) {
    console.error("❌ Irys 初始化失败:", error.message);
    return null;
  }
};

// === 上传文件 ===
async function uploadFile(irys, filePath, tags) {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`文件不存在: ${filePath}`);
    }

    const buffer = fs.readFileSync(filePath);
    const fileSize = buffer.length;
    const fileSizeKB = (fileSize / 1024).toFixed(2);

    console.log(`\n📄 文件信息:`);
    console.log(`   路径: ${filePath}`);
    console.log(`   大小: ${fileSizeKB} KB`);
    console.log(`   标签:`, tags);

    // Check Balance
    await checkBalance(irys, fileSize);

    console.log("\n⏳ 正在上传到 Irys 网络...");
    const receipt = await irys.upload(buffer, { tags });

    const uploadUrl = `https://uploader.irys.xyz/${receipt.id}`;
    console.log(`\n✅ 上传成功!`);
    console.log(`📍 Transaction ID: ${receipt.id}`);
    console.log(`🔗 访问链接: ${uploadUrl}`);

    return { status: "ok", id: receipt.id, url: uploadUrl };
  } catch (error) {
    console.error(`\n❌ 上传失败: ${error.message}`);
    return { status: "fail", error: error.message };
  }
}

// === 主函数 ===
async function main() {
  console.log("🚀 Web4 CLI - 文件上传工具 (SDK V1)\n");

  const config = parseArgs();

  if (!config.file) {
    console.log("使用方法:");
    console.log("  node upload.cjs <file> --type=<type> [--version=<version>] [--tag=<tag>]\n");
    process.exit(1);
  }

  // 检查文件类型
  const ext = path.extname(config.file);
  let contentType = "application/json";
  let tags = [];

  if (ext === ".html" || ext === ".htm") {
    contentType = "text/html";
    tags = [
      { name: "Content-Type", value: contentType },
      { name: "App-Name", value: "Web4-CLI" },
      { name: "Version", value: config.version },
    ];
  } else if (ext === ".json") {
    // JSON 组件
    if (!config.type) {
      console.error("❌ 错误: 上传 JSON 组件需要指定 --type 参数");
      process.exit(1);
    }
    tags = [
      { name: "Content-Type", value: contentType },
      { name: config.tag, value: config.type }, // e.g. W4AP: layout
      { name: "Version", value: config.version },
    ];
  } else {
    console.error(`❌ 不支持的文件类型: ${ext}`);
    process.exit(1);
  }

  // 初始化 Irys
  const irys = await getIrysUploader();
  if (!irys) {
    process.exit(1);
  }

  // 上传文件
  const result = await uploadFile(irys, config.file, tags);

  if (result.status === "ok") {
    console.log("\n🎉 完成!");
  } else {
    process.exit(1);
  }
}

// 运行
main().catch((error) => {
  console.error("❌ 发生错误:", error.message);
  process.exit(1);
});
