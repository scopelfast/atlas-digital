# Cria o utilizador e a base (a partir do backend\.env), corre migracoes e seeds.
# Requer a password do superutilizador PostgreSQL (normalmente o utilizador "postgres").
#
# Uso (PowerShell):
#   $env:PG_POSTGRES_PASSWORD = "a_senha_que_definiste_na_instalacao"
#   Set-Location C:\gitHub\atlas-digital
#   .\scripts\Setup-AtlasDigitalDatabase.ps1
#
# Ou, numa so linha:
#   $env:PG_POSTGRES_PASSWORD='...'; .\scripts\Setup-AtlasDigitalDatabase.ps1

param(
    [string]$PostgresPassword = $env:PG_POSTGRES_PASSWORD
)

$ErrorActionPreference = "Stop"

function Find-PsqlPath {
    foreach ($root in @(
        "C:\Program Files\PostgreSQL",
        "C:\Program Files (x86)\PostgreSQL"
    )) {
        if (-not (Test-Path $root)) { continue }
        $candidates = Get-ChildItem $root -Directory -ErrorAction SilentlyContinue |
            ForEach-Object {
                $exe = Join-Path $_.FullName "bin\psql.exe"
                if (Test-Path $exe) {
                    [PSCustomObject]@{
                        Path = $exe
                        Ver  = try { [version]($_.Name -replace '^(\d+).*', '$1.0') } catch { [version]'0.0' }
                    }
                }
            }
        $best = $candidates | Sort-Object { $_.Ver } -Descending | Select-Object -First 1
        if ($best) { return $best.Path }
    }
    return $null
}

$psql = Find-PsqlPath
if (-not $psql) {
    Write-Error "psql.exe nao encontrado em Program Files\PostgreSQL. Adiciona o bin do PostgreSQL ao PATH ou reinstala o cliente."
    exit 1
}

if (-not $PostgresPassword) {
    Write-Host ""
    Write-Host "Nao foi definida a senha do utilizador postgres (superutilizador)." -ForegroundColor Yellow
    Write-Host "No pgAdmin e a mesma password com que te ligas ao servidor como postgres." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Executa antes (substitui pela tua senha):" -ForegroundColor Cyan
    Write-Host '  $env:PG_POSTGRES_PASSWORD = "sua_senha_postgres"' -ForegroundColor White
    Write-Host '  .\scripts\Setup-AtlasDigitalDatabase.ps1' -ForegroundColor White
    Write-Host ""
    exit 1
}

$backendEnv = Join-Path $PSScriptRoot "..\backend\.env"
if (-not (Test-Path $backendEnv)) {
    Write-Error "Ficheiro backend\.env nao encontrado. Copia backend\.env.example para backend\.env primeiro."
    exit 1
}

$DB_NAME = "atlas_digital"
$DB_USER = "atlas"
$DB_PASS = "atlas_dev_secret"
$DB_PORT = "5432"
$DB_HOST = "localhost"

Get-Content $backendEnv | ForEach-Object {
    $line = $_.Trim()
    if ($line -match '^DB_NAME=(.+)$') { $script:DB_NAME = $matches[1].Trim() }
    if ($line -match '^DB_USER=(.+)$') { $script:DB_USER = $matches[1].Trim() }
    if ($line -match '^DB_PASS=(.+)$') { $script:DB_PASS = $matches[1].Trim() }
    if ($line -match '^DB_PORT=(.+)$') { $script:DB_PORT = $matches[1].Trim() }
    if ($line -match '^DB_HOST=(.+)$') { $script:DB_HOST = $matches[1].Trim() }
}

if ([string]::IsNullOrWhiteSpace($DB_NAME)) { $DB_NAME = "atlas_digital" }
if ([string]::IsNullOrWhiteSpace($DB_USER)) { $DB_USER = "atlas" }
if ([string]::IsNullOrWhiteSpace($DB_PASS)) { $DB_PASS = "atlas_dev_secret" }
if ([string]::IsNullOrWhiteSpace($DB_PORT)) { $DB_PORT = "5432" }
if ([string]::IsNullOrWhiteSpace($DB_HOST)) { $DB_HOST = "localhost" }

# Evita ::1 quando pg_hba so lista 127.0.0.1 (comum no Windows)
$psqlHost = if ($DB_HOST -eq "localhost") { "127.0.0.1" } else { $DB_HOST }

$passSql = $DB_PASS.Replace("'", "''")

$sqlRole = @"
DO `$`$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '$DB_USER') THEN
    CREATE ROLE $DB_USER WITH LOGIN PASSWORD '$passSql';
  ELSE
    ALTER ROLE $DB_USER WITH PASSWORD '$passSql';
  END IF;
END
`$`$;
"@

Write-Host ">> psql: $psql" -ForegroundColor DarkGray
Write-Host ">> Host: ${DB_HOST}:${DB_PORT} (psql: $psqlHost)  Base: $DB_NAME  Utilizador app: $DB_USER" -ForegroundColor DarkGray

$env:PGPASSWORD = $PostgresPassword
& $psql -U postgres -h $psqlHost -p $DB_PORT -d postgres -v ON_ERROR_STOP=1 -c $sqlRole
if ($LASTEXITCODE -ne 0) {
    Write-Error "Falha ao criar/atualizar o role $DB_USER. Verifica PG_POSTGRES_PASSWORD e se o servico PostgreSQL esta a correr."
    exit $LASTEXITCODE
}

# Nao aninhar aspas duplas dentro da string do psql (quebra o parser e $DB_NAME fica $null)
$dbNameSql = $DB_NAME.Replace("'", "''")
$sqlCheckDb = "SELECT 1 FROM pg_database WHERE datname='$dbNameSql'"
$checkOut = & $psql -U postgres -h $psqlHost -p $DB_PORT -d postgres -tAc $sqlCheckDb 2>&1
$checkExit = $LASTEXITCODE
if ($checkExit -ne 0) {
    Write-Error "psql falhou ao verificar se a base existe (codigo $checkExit). Saida: $checkOut"
    exit $checkExit
}
# stdout vazio => $null; .Trim() em $null rebenta no Windows PowerShell 5.1
$exists = (@($checkOut) | Where-Object { $null -ne $_ } | ForEach-Object { $_.ToString() }) -join ""
$exists = $exists.Trim()
if ($exists -ne "1") {
    Write-Host ">> A criar base de dados $DB_NAME ..." -ForegroundColor Cyan
    & $psql -U postgres -h $psqlHost -p $DB_PORT -d postgres -v ON_ERROR_STOP=1 -c "CREATE DATABASE `"$DB_NAME`" OWNER $DB_USER;"
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Falha ao criar a base $DB_NAME"
        exit $LASTEXITCODE
    }
} else {
    Write-Host ">> Base $DB_NAME ja existe." -ForegroundColor DarkGreen
}

$env:PGPASSWORD = $DB_PASS
& $psql -U $DB_USER -h $psqlHost -p $DB_PORT -d $DB_NAME -v ON_ERROR_STOP=1 -c "SELECT current_database(), current_user;"
if ($LASTEXITCODE -ne 0) {
    Write-Error "Nao foi possivel ligar com $DB_USER. Verifica DB_* no backend\.env."
    exit $LASTEXITCODE
}

Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue

$backendDir = Resolve-Path (Join-Path $PSScriptRoot "..\backend")
Write-Host ">> Sequelize: migracoes ..." -ForegroundColor Cyan
Push-Location $backendDir
if (-not (Test-Path "node_modules")) {
    npm install --legacy-peer-deps
}
if (-not (Test-Path "dist\config\database.js")) {
    npm run build
}
npm run db:migrate
if ($LASTEXITCODE -ne 0) {
    Pop-Location
    Write-Error "db:migrate falhou."
    exit $LASTEXITCODE
}
Write-Host ">> Sequelize: seeds ..." -ForegroundColor Cyan
npm run db:seed
if ($LASTEXITCODE -ne 0) {
    Pop-Location
    Write-Error "db:seed falhou."
    exit $LASTEXITCODE
}
Pop-Location

Write-Host ""
Write-Host "Concluido. Login inicial (seed): admin@admin.com / 123456" -ForegroundColor Green
Write-Host "Altera JWT_SECRET e JWT_REFRESH_SECRET no backend\.env antes de producao." -ForegroundColor Yellow
