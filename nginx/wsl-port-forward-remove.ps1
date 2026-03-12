# 清除 WSL 端口轉發規則
# 請以系統管理員身分在 Windows PowerShell 中執行此腳本

$ports = @(80)

Write-Host "正在清除端口轉發規則..."

foreach ($port in $ports) {
    Write-Host "清除端口 $port 的轉發..."
    netsh interface portproxy delete v4tov4 listenport=$port listenaddress=0.0.0.0
    
    # 刪除防火牆規則
    $ruleName = "WSL-9Jang-Port-$port"
    Remove-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue
    Write-Host "已刪除防火牆規則 $ruleName"
}

Write-Host "`n目前的端口轉發規則:"
netsh interface portproxy show all

Write-Host "`n清除完成！"
