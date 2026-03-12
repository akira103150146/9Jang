Write-Host "🔍 正在檢查 9Jang 補習班系統網路設定狀態..." -ForegroundColor Cyan
Write-Host "=================================================="

# 1. 檢查 Windows 防火牆規則
Write-Host "`n🛡️ [1/2] Windows 防火牆規則 (Inbound Rules):" -ForegroundColor Yellow
$fwRules = Get-NetFirewallRule -DisplayName "Allow_Vite*" , "*3000*" -ErrorAction SilentlyContinue | 
           Get-NetFirewallPortFilter | 
           Where-Object { $_.LocalPort -eq "5173" -or $_.LocalPort -eq "3000" }

if ($fwRules) {
    Get-NetFirewallRule -Name ($fwRules.InstanceID) | Select-Object DisplayName, Enabled, Direction, Action | Format-Table -AutoSize
} else {
    Write-Host "❌ 找不到與 3000 或 5173 相關的防火牆規則。" -ForegroundColor Red
}

# 2. 檢查 netsh 端口轉發 (Port Proxy)
Write-Host "`n🌐 [2/2] Netsh 端口轉發設定 (Windows -> WSL):" -ForegroundColor Yellow
$proxy = netsh interface portproxy show v4tov4 | Select-String "5173|3000"

if ($proxy) {
    netsh interface portproxy show v4tov4
} else {
    Write-Host "❌ 目前沒有設定任何連接埠轉發規則。" -ForegroundColor Red
}

Write-Host "`n=================================================="
Write-Host "💡 提示："
Write-Host "1. 如果防火牆 Enabled 為 False，請執行: Enable-NetFirewallRule -DisplayName '規則名稱'"
Write-Host "2. 如果轉發的位址與目前的 WSL IP 不符，請執行: netsh interface portproxy reset 並重新執行專案腳本。"