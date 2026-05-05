; ============================================================
;  MicroERP — Script de Instalador (Inno Setup 6)
; ============================================================

#define AppName        "MicroERP"
#define AppVersion     "2.0.0"
#define AppPublisher   "MicroERP Sistemas"
#define AppCopyright   "Copyright (C) 2024-2025 MicroERP Sistemas"
#define AppURL         "http://localhost:3000"
#define AppDescription "Sistema financeiro para pequenas empresas"

[Setup]
AppId={{A1B2C3D4-E5F6-7890-ABCD-EF1234567890}

AppName={#AppName}
AppVersion={#AppVersion}
AppVerName={#AppName} {#AppVersion}
AppPublisher={#AppPublisher}
AppPublisherURL={#AppURL}
AppSupportURL={#AppURL}
AppContact="suporte@microerp.com.br"
AppCopyright={#AppCopyright}

DefaultDirName={autopf}\{#AppName}
DefaultGroupName={#AppName}
AllowNoIcons=yes

SetupIconFile=..\icon.ico
UninstallDisplayIcon={app}\start.bat

OutputDir=.
OutputBaseFilename=MicroERP_Setup

VersionInfoVersion={#AppVersion}.0
VersionInfoCompany={#AppPublisher}
VersionInfoDescription={#AppDescription} — Instalador
VersionInfoCopyright={#AppCopyright}
VersionInfoProductName={#AppName}
VersionInfoProductVersion={#AppVersion}.0

Compression=lzma2/ultra64
SolidCompression=yes

WizardStyle=modern
MinVersion=10.0

PrivilegesRequired=admin

[Languages]
Name: "brazilianportuguese"; MessagesFile: "compiler:Languages\BrazilianPortuguese.isl"

[Messages]
WelcomeLabel1=Bem-vindo ao assistente de instalação do {#AppName}
WelcomeLabel2=Este assistente irá instalar o {#AppName} {#AppVersion} no seu computador.
FinishedHeadingLabel=Instalação do {#AppName} concluída!
FinishedLabel=O {#AppName} foi instalado com sucesso.%n%nClique em Concluir.

[Tasks]
Name: "desktopicon"; Description: "Criar ícone na Área de Trabalho"; GroupDescription: "Ícones adicionais:"; Flags: checkedonce
Name: "startmenuicon"; Description: "Criar atalho no Menu Iniciar"; GroupDescription: "Ícones adicionais:"

[Files]
; Standalone build (já inclui todas dependências)
Source: "..\financeiro-react\.next\standalone\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

; Arquivos extras
Source: "..\financeiro-react\.env.local"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\icon.ico"; DestDir: "{app}"; Flags: ignoreversion

; Script de inicio
Source: "start.bat"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{group}\{#AppName}"; Filename: "{app}\start.bat"; IconFilename: "{app}\icon.ico"
Name: "{group}\Desinstalar {#AppName}"; Filename: "{uninstallexe}"
Name: "{autodesktop}\{#AppName}"; Filename: "{app}\start.bat"; IconFilename: "{app}\icon.ico"; Tasks: desktopicon

[Run]
Filename: "{app}\start.bat"; Description: "Abrir {#AppName} agora"; Flags: nowait postinstall skipifsilent