/**
 * Google Play Store (TWA - Trusted Web Activity) Build Script
 * 
 * Este script automatiza e documenta o processo de empacotamento oficial
 * do Missão Fronteiras para publicação na Google Play Store usando Bubblewrap CLI.
 * 
 * Como executar:
 *   node scripts/build-android-twa.js
 */

const fs = require("fs");
const path = require("path");

console.log("==================================================");
console.log("🎮 MISSÃO FRONTEIRAS - EMPACOTAMENTO GOOGLE PLAY (TWA)");
console.log("==================================================");

const twaManifestPath = path.join(__dirname, "..", "twa-manifest.json");
const assetlinksPath = path.join(__dirname, "..", "public", ".well-known", "assetlinks.json");

if (!fs.existsSync(twaManifestPath)) {
  console.error("❌ Erro: twa-manifest.json não encontrado.");
  process.exit(1);
}

if (!fs.existsSync(assetlinksPath)) {
  console.error("❌ Erro: assetlinks.json não encontrado em public/.well-known/");
  process.exit(1);
}

const twaManifest = JSON.parse(fs.readFileSync(twaManifestPath, "utf8"));
console.log("✅ Configuração TWA carregada com sucesso:");
console.log(`   - Pacote: ${twaManifest.packageId}`);
console.log(`   - Nome do App: ${twaManifest.name}`);
console.log(`   - Orientação Fixa: ${twaManifest.orientation}`);
console.log(`   - Modo de Exibição: ${twaManifest.display}`);
console.log(`   - Host de Origem: ${twaManifest.host}`);
console.log("");
console.log("📋 PASSOS PARA GERAR O APK / AAB FINAL PARA A GOOGLE PLAY STORE:");
console.log("1. Instale a ferramenta oficial da Google (Bubblewrap):");
console.log("   npm install -g @bubblewrap/cli");
console.log("");
console.log("2. Inicialize o projeto Android TWA a partir do manifesto:");
console.log("   bubblewrap init --manifest=https://missao-fronteiras.vercel.app/manifest.webmanifest");
console.log("");
console.log("3. Compile o arquivo Android App Bundle (.aab) assinado:");
console.log("   bubblewrap build");
console.log("");
console.log("4. Faça o upload do arquivo .aab gerado no Google Play Console");
console.log("   (Seção: Versão de Produção / Teste Aberto).");
console.log("==================================================");
