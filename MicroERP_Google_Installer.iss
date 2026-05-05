; ============================================================
; MicroERP — Instalador Windows (Login Google)
; Gerado automaticamente — Inno Setup 6
; ============================================================

#define AppName      "MicroERP Google"
#define AppVersion   "2.0.0"
#define AppPublisher "MicroERP"
#define AppURL       "https://micro-erp-production.digital"
#define AppExeName   "MicroERP.exe"

[Setup]
AppId={{A1B2C3D4-5E6F-7A8B-9C0D-1E2F3A4B5C6D}
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
OutputBaseFilename=MicroERP_Google_Setup_v1.0.0
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
; Copia o icone para a pasta de instalacao
Source: "C:\Users\Matheus\Desktop\Site MicroERP\icon.ico"; DestDir: "{app}"; DestName: "MicroERP.ico"; Flags: ignoreversion

; Copia o launcher Google (abre direto o login do Google)
Source: "C:\Users\Matheus\Desktop\Site MicroERP\MicroERP_Google_launcher.vbs"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
; Atalho no Menu Iniciar
Name: "{group}\{#AppName}"; Filename: "{sys}\wscript.exe"; \
  Parameters: """{app}\MicroERP_Google_launcher.vbs"""; \
  IconFilename: "{app}\MicroERP.ico"; \
  Comment: "Entrar no MicroERP com Google"

; Atalho na Area de Trabalho
Name: "{autodesktop}\{#AppName}"; Filename: "{sys}\wscript.exe"; \
  Parameters: """{app}\MicroERP_Google_launcher.vbs"""; \
  IconFilename: "{app}\MicroERP.ico"; \
  Comment: "Entrar no MicroERP com Google"

; Atalho de desinstalacao no Menu Iniciar
Name: "{group}\Desinstalar {#AppName}"; Filename: "{uninstallexe}"

[Run]
; Abre o login Google ao finalizar a instalacao
Filename: "{sys}\wscript.exe"; \
  Parameters: """{app}\MicroERP_Google_launcher.vbs"""; \
  Description: "Entrar no MicroERP com Google agora"; \
  Flags: postinstall nowait skipifsilent

[Code]
function InitializeSetup(): Boolean;
begin
  Result := True;
end;
