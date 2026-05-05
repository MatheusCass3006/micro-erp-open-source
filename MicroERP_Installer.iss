; ============================================================
; MicroERP — Instalador Windows
; Gerado automaticamente — Inno Setup 6
; ============================================================

#define AppName      "MicroERP"
#define AppVersion   "1.0.0"
#define AppPublisher "MicroERP"
#define AppURL       "https://micro-erp-production.digital"
#define AppExeName   "MicroERP.exe"

[Setup]
AppId={{E8A3F2B1-4C7D-4E5A-9F2B-1D3C6E8A0B2F}
AppName={#AppName}
AppVersion={#AppVersion}
AppPublisher={#AppPublisher}
AppPublisherURL={#AppURL}
AppSupportURL={#AppURL}
AppUpdatesURL={#AppURL}
DefaultDirName={autopf}\{#AppName}
DefaultGroupName={#AppName}
DisableProgramGroupPage=yes
LicenseFile=
OutputDir=C:\Users\Matheus\Desktop\Site MicroERP\installer_output
OutputBaseFilename=MicroERP_Setup_v1.0.0
SetupIconFile=C:\Users\Matheus\Desktop\Site MicroERP\icon.ico
Compression=lzma
SolidCompression=yes
WizardStyle=modern
UninstallDisplayIcon={app}\MicroERP.ico
UninstallDisplayName={#AppName}

; Exibe no Painel de Controle como programa instalado
AppContact=suporte@micro-erp-production.digital

[Languages]
Name: "brazilianportuguese"; MessagesFile: "compiler:Languages\BrazilianPortuguese.isl"

[Files]
; Copia o ícone para a pasta de instalação
Source: "C:\Users\Matheus\Desktop\Site MicroERP\icon.ico"; DestDir: "{app}"; DestName: "MicroERP.ico"; Flags: ignoreversion

; Copia o launcher (abre o browser com o URL do app)
Source: "C:\Users\Matheus\Desktop\Site MicroERP\MicroERP_launcher.vbs"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
; Atalho no Menu Iniciar
Name: "{group}\{#AppName}"; Filename: "{sys}\wscript.exe"; \
  Parameters: """{app}\MicroERP_launcher.vbs"""; \
  IconFilename: "{app}\MicroERP.ico"; \
  Comment: "Abrir MicroERP — Gestão Financeira"

; Atalho na Área de Trabalho
Name: "{autodesktop}\{#AppName}"; Filename: "{sys}\wscript.exe"; \
  Parameters: """{app}\MicroERP_launcher.vbs"""; \
  IconFilename: "{app}\MicroERP.ico"; \
  Comment: "Abrir MicroERP — Gestão Financeira"

; Atalho de desinstalação no Menu Iniciar
Name: "{group}\Desinstalar {#AppName}"; Filename: "{uninstallexe}"

[Run]
; Abre o app no browser ao finalizar a instalação
Filename: "{sys}\wscript.exe"; \
  Parameters: """{app}\MicroERP_launcher.vbs"""; \
  Description: "Abrir MicroERP agora"; \
  Flags: postinstall nowait skipifsilent

[Code]
// Verifica se o .NET / Navegador está disponível (opcional)
function InitializeSetup(): Boolean;
begin
  Result := True;
end;
