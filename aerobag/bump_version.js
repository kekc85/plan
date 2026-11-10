// Автоматический инкремент сборки SemVer (Major.Minor.Patch) AeroBag Predictor
const fs = require('fs');
const path = require('path');

const versionFilePath = path.join(__dirname, 'version.json');
const appJsPath = path.join(__dirname, 'app.js');
const indexHtmlPath = path.join(__dirname, 'index.html');

try {
    let versionData = { major: 12, minor: 0, patch: 78, lastBuildTime: "" };
    if (fs.existsSync(versionFilePath)) {
        try {
            const raw = JSON.parse(fs.readFileSync(versionFilePath, 'utf-8'));
            if (raw.major !== undefined) versionData.major = raw.major;
            if (raw.minor !== undefined) versionData.minor = raw.minor;
            if (raw.patch !== undefined) versionData.patch = raw.patch;
            else if (raw.build !== undefined) versionData.patch = raw.build;
        } catch (e) {}
    }

    versionData.patch = (parseInt(versionData.patch, 10) || 0) + 1;
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const dateFormatted = `${pad(now.getDate())}.${pad(now.getMonth() + 1)}.${now.getFullYear()}`;
    const timeFormatted = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    versionData.lastBuildTime = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${timeFormatted}`;

    fs.writeFileSync(versionFilePath, JSON.stringify(versionData, null, 2), 'utf-8');

    const vStr = `v${versionData.major}.${versionData.minor}.${versionData.patch}`;

    // Обновление app.js
    if (fs.existsSync(appJsPath)) {
        let appJs = fs.readFileSync(appJsPath, 'utf-8');
        appJs = appJs.replace(/const APP_VERSION = '[^']+';/, `const APP_VERSION = '${vStr}';`);
        appJs = appJs.replace(/const APP_BUILD_DATE = '[^']+';/, `const APP_BUILD_DATE = '${dateFormatted}';`);
        fs.writeFileSync(appJsPath, appJs, 'utf-8');
    }

    // Обновление index.html
    if (fs.existsSync(indexHtmlPath)) {
        let html = fs.readFileSync(indexHtmlPath, 'utf-8');
        html = html.replace(/<span id="app-version-tag">[^<]*<\/span>/, `<span id="app-version-tag">${vStr}</span>`);
        html = html.replace(/<span id="app-build-date">[^<]*<\/span>/, `<span id="app-build-date">${dateFormatted}</span>`);
        html = html.replace(/src="app\.js\?v=[^"]*"/, `src="app.js?v=${vStr}"`);
        html = html.replace(/src="dcs_sync\.js\?v=[^"]*"/, `src="dcs_sync.js?v=${vStr}"`);
        html = html.replace(/href="style\.css\?v=[^"]*"/, `href="style.css?v=${vStr}"`);
        fs.writeFileSync(indexHtmlPath, html, 'utf-8');
    }

    console.log(`[Version Bump] Successfully updated to ${vStr} (${dateFormatted})`);
} catch (err) {
    console.error('[Version Bump Error]:', err.message);
}
