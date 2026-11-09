param([switch]$ServicesOnly, [switch]$NoBrowser, [switch]$Status, [switch]$Terminal)
$ErrorActionPreference = 'Stop'
$apolloRoot = 'C:\Users\Ryan\Documents\Codex\2026-11-07\oq-x20\outputs\apollo-jarvis'
$nodeRoot = Join-Path $env:APPDATA 'fnm\node-versions\v26.13.0\installation'
$node = Join-Path $nodeRoot 'node.exe'
$omni = Join-Path $nodeRoot 'node_modules\omniroute\bin\omniroute.mjs'
$voice = Join-Path $env:LOCALAPPDATA 'Programs\VoiceStudio\VoiceStudio.exe'
$previewRoot = 'C:\Users\Ryan\.codex\visualizations\2026\11\08\01a1bb7c-bde0-7a20-891c-0c2ff2a271b0\apollo-design-preview'
$logRoot = Join-Path $PSScriptRoot 'logs'
function Test-Port([int]$Port) {
    $client = New-Object Net.Sockets.TcpClient
    try { $task = $client.ConnectAsync('127.0.0.1', $Port); if (-not $task.Wait(400)) { return $false }; return $client.Connected } catch { return $false } finally { $client.Dispose() }
}
function Wait-Service([int]$Port, [int]$Seconds, [string]$Name) {
    $timer = [Diagnostics.Stopwatch]::StartNew()
    while ($timer.Elapsed.TotalSeconds -lt $Seconds) {
        if (Test-Port $Port) { Write-Host "$Name pronto (porta $Port)."; return }
        Start-Sleep -Milliseconds 500
    }
    throw "$Name nao respondeu na porta $Port. Consulte os logs em $logRoot. Nao inicie outra copia."
}
function Wait-Http([string]$Uri, [int]$Seconds) {
    $timer = [Diagnostics.Stopwatch]::StartNew()
    while ($timer.Elapsed.TotalSeconds -lt $Seconds) {
        try { $null = Invoke-WebRequest -Uri $Uri -UseBasicParsing -TimeoutSec 4; return } catch { Start-Sleep -Milliseconds 500 }
    }
    throw 'OmniRoute abriu a porta, mas nao responde por HTTP. A chave ainda nao foi testada. Consulte os logs e tente novamente quando o painel abrir.'
}
function Start-Node([string]$Name, [string]$Root, [string[]]$Arguments) {
    $stamp = Get-Date -Format 'yyyyMMdd-HHmmss-fff'
    $null = Start-Process -FilePath $node -WorkingDirectory $Root -ArgumentList $Arguments -WindowStyle Hidden -RedirectStandardOutput (Join-Path $logRoot "$Name-$stamp.out.log") -RedirectStandardError (Join-Path $logRoot "$Name-$stamp.err.log") -PassThru
}
if ($Status) {
    foreach ($item in @(@('OmniRoute',20128),@('Apollo',3210),@('VoiceStudio',3900),@('Previa',3211))) {
        Write-Host ("{0}: {1}" -f $item[0], $(if (Test-Port $item[1]) {'ativo'} else {'desligado'}))
    }
    exit 0
}
$mutex = New-Object Threading.Mutex($false, 'Local\RyanApolloLauncher')
$locked = $false
try {
    $locked = $mutex.WaitOne(0)
    if (-not $locked) { throw 'Outro iniciador ja esta aberto. Termine a entrada da chave naquela janela.' }
    foreach ($required in @($node,$omni,$voice,(Join-Path $apolloRoot 'server.mjs'))) { if (-not (Test-Path -LiteralPath $required)) { throw "Arquivo necessario ausente: $required" } }
    $null = New-Item -ItemType Directory -Path $logRoot -Force
    if (-not (Test-Port 20128)) {
        Write-Host 'Iniciando OmniRoute...'
        $previousHost = $env:OMNIROUTE_SERVER_HOST
        try { $env:OMNIROUTE_SERVER_HOST = '127.0.0.1'; Start-Node 'omniroute' (Split-Path -Parent $omni) @(('"'+$omni+'"'),'serve','--no-open','--no-tray','--ready-timeout','120000') }
        finally { $env:OMNIROUTE_SERVER_HOST = $previousHost }
    }
    Wait-Service 20128 90 'OmniRoute'
    Write-Host 'Aguardando OmniRoute responder por HTTP...'
    Wait-Http 'http://127.0.0.1:20128/api/monitoring/health' 120
    if (-not (Test-Port 3900)) {
        if (-not (Get-Process -Name VoiceStudio -ErrorAction SilentlyContinue)) {
            Write-Host 'Iniciando VoiceStudio...'
            $null = Start-Process -FilePath $voice -WorkingDirectory (Split-Path -Parent $voice) -WindowStyle Hidden -PassThru
        }
        try { Wait-Service 3900 45 'VoiceStudio' } catch { Write-Warning 'VoiceStudio ainda carregando. Apollo pode funcionar por texto; a voz depende da porta 3900.' }
    } else { Write-Host 'VoiceStudio ja esta ativo.' }
    if ((Test-Path -LiteralPath (Join-Path $previewRoot 'server.mjs')) -and -not (Test-Port 3211)) {
        $previousPort = $env:APOLLO_PORT
        try { $env:APOLLO_PORT = '3211'; Start-Node 'previa' $previewRoot @(('"'+(Join-Path $previewRoot 'server.mjs')+'"')) }
        finally { $env:APOLLO_PORT = $previousPort }
        Wait-Service 3211 15 'Previa'
    }
    if (-not $ServicesOnly -and -not (Test-Port 3210)) {
        Write-Host 'Cole a API key do OmniRoute. Entrada oculta; chave somente na memoria.'
        $secret = Read-Host 'API key' -AsSecureString
        $pointer = [IntPtr]::Zero
        $previous = [Environment]::GetEnvironmentVariable('OMNIROUTE_API_KEY','Process')
        try {
            $pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secret)
            $plain = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)
            if ([string]::IsNullOrWhiteSpace($plain)) { throw 'Chave vazia.' }
            $plain = $plain.Trim()
            $headers = @{Authorization = "Bearer $plain"}
            try { $null = Invoke-RestMethod -Uri 'http://127.0.0.1:20128/v1/models' -Headers $headers -TimeoutSec 45 }
            catch {
                $code = $null
                if ($_.Exception.Response) { $code = [int]$_.Exception.Response.StatusCode }
                if ($code -in 401,403) { throw "OmniRoute recusou a chave (HTTP $code). Confira se copiou a API key completa." }
                if ($code) { throw "OmniRoute respondeu HTTP $code. A chave nao foi confirmada; nao e necessariamente invalida." }
                throw 'OmniRoute nao respondeu a validacao. Falha de conexao ou tempo excedido; nao significa chave invalida.'
            } finally { $headers.Clear() }
            [Environment]::SetEnvironmentVariable('OMNIROUTE_API_KEY',$plain,'Process')
            Start-Node 'apollo' $apolloRoot @(('"'+(Join-Path $apolloRoot 'server.mjs')+'"'))
        } finally {
            [Environment]::SetEnvironmentVariable('OMNIROUTE_API_KEY',$previous,'Process')
            $plain = $null
            if ($pointer -ne [IntPtr]::Zero) { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer) }
            if ($secret) { $secret.Dispose() }
        }
        Wait-Service 3210 20 'Apollo'
    }
    if (Test-Port 3210) {
        $page = Invoke-WebRequest -UseBasicParsing -Uri 'http://127.0.0.1:3210/' -TimeoutSec 5
        if ($page.Content -notmatch 'apollo-token') { throw 'A porta 3210 responde, mas nao foi reconhecida como Apollo.' }
        Write-Host 'Apollo pronto: http://127.0.0.1:3210'
        if (-not $NoBrowser -and -not $Terminal) { Start-Process 'http://127.0.0.1:3210' }
    }
    Write-Host 'Pode fechar esta janela. Servicos continuam em segundo plano.'
    if ($Terminal -and -not $ServicesOnly) {
        $terminalPath = Join-Path $PSScriptRoot '..\terminal\terminal.mjs'
        if (-not (Test-Path -LiteralPath $terminalPath)) { throw "Terminal ausente: $terminalPath" }
        # Release the startup lock before an interactive session; servers are ready.
        $mutex.ReleaseMutex()
        $locked = $false
        & $node $terminalPath
        if ($LASTEXITCODE -ne 0) { throw 'O terminal encerrou com erro. Servidores permanecem ativos.' }
    }
} catch { Write-Host $_.Exception.Message -ForegroundColor Red; exit 1 }
finally { if ($locked) { $mutex.ReleaseMutex() }; $mutex.Dispose() }
