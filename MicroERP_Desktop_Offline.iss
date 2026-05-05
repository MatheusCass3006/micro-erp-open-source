; ============================================================
; MicroERP Desktop — Instalador Offline
; Inno Setup 6 — Versão 1.0.0
; ============================================================

#define AppName      "MicroERP"
#define AppVersion   "1.0.0"
#define AppPublisher "MicroERP Gestão Financeira"
#define AppURL       "https://micro-erp-production.digital"
#define AppExeName   "microerp.exe"
#define AppId        "{{B7E4A291-3C8D-4F2E-9A61-D5F83E2B1C47}"

[Setup]
AppId={#AppId}
AppName={#AppName}
AppVersion={#AppVersion}
AppVerName={#AppName} {#AppVersion}
AppPublisher={#AppPublisher}
AppPublisherURL={#AppURL}
AppSupportURL={#AppURL}
AppUpdatesURL={#AppURL}

; Instala em AppData do usuário (não precisa de Admin)
DefaultDirName={localappdata}\{#AppName}
DefaultGroupName={#AppName}
PrivilegesRequired=lowest
PrivilegesRequiredOverridesAllowed=dialog

; Saída
OutputDir=installer_output
OutputBaseFilename=MicroERP_Setup_v{#AppVersion}_Offline
SetupIconFile=microerp-pkg\assets\icon.ico

; Compressão máxima
Compression=lzma2/ultra64
SolidCompression=yes
LZMAUseSeparateProcess=yes

; Visual
WizardStyle=modern
WizardImageFile=microerp-pkg\assets\wizard-side.bmp
WizardImageAlphaFormat=none
WizardResizable=no

; Outras configurações
ShowLanguageDialog=no
DisableProgramGroupPage=yes
DisableWelcomePage=no
DisableReadyPage=no
UninstallDisplayIcon={app}\{#AppExeName}
UninstallDisplayName={#AppName}
CloseApplications=yes

[Languages]
Name: "ptbr"; MessagesFile: "compiler:Languages\BrazilianPortuguese.isl"

[Messages]
WelcomeLabel1=Bem-vindo ao instalador do [name]
WelcomeLabel2=Este assistente irá instalar o {#AppName} {#AppVersion} no seu computador.%n%nO {#AppName} é um sistema de gestão financeira que funciona completamente offline — sem necessidade de internet.%n%nClique em Avançar para continuar.
FinishedLabel=A instalação do [name] foi concluída com sucesso.%n%nClique em Concluir para fechar este assistente.
FinishedHeadingLabel=Instalação concluída!

[Tasks]
Name: "desktopicon";  Description: "Criar atalho na &área de trabalho"; GroupDescription: "Atalhos:"; Flags: checked
Name: "startupicon";  Description: "Iniciar com o &Windows (opcional)"; GroupDescription: "Inicialização:"; Flags: unchecked

[Files]
; Executável principal do servidor
Source: "microerp-pkg\microerp.exe"; DestDir: "{app}"; Flags: ignoreversion

; Arquivos estáticos do Next.js (pasta app/)
Source: "microerp-pkg\app\*"; DestDir: "{app}\app"; Flags: ignoreversion recursesubdirs createallsubdirs

; Launcher VBS
Source: "microerp-pkg\launcher.vbs"; DestDir: "{app}"; Flags: ignoreversion

; Ícone
Source: "microerp-pkg\assets\icon.ico"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
; Atalho na área de trabalho
Name: "{commondesktop}\{#AppName}";
  Filename: "{sys}\wscript.exe";
  Parameters: """{app}\launcher.vbs""";
  WorkingDir: "{app}";
  IconFilename: "{app}\icon.ico";
  IconIndex: 0;
  Comment: "Abrir {#AppName} — Gestão Financeira Offline";
  Tasks: desktopicon

; Menu Iniciar
Name: "{group}\{#AppName}";
  Filename: "{sys}\wscript.exe";
  Parameters: """{app}\launcher.vbs""";
  WorkingDir: "{app}";
  IconFilename: "{app}\icon.ico";
  IconIndex: 0;
  Comment: "Abrir {#AppName} — Gestão Financeira Offline"

; Desinstalar no menu Iniciar
Name: "{group}\Desinstalar {#AppName}";
  Filename: "{uninstallexe}"

; Inicialização com Windows (opcional)
Name: "{userstartup}\{#AppName}";
  Filename: "{sys}\wscript.exe";
  Parameters: """{app}\launcher.vbs""";
  WorkingDir: "{app}";
  IconFilename: "{app}\icon.ico";
  Tasks: startupicon

[Run]
; Abre o app após instalar
Filename: "{sys}\wscript.exe";
  Parameters: """{app}\launcher.vbs""";
  Description: "Abrir {#AppName} agora";
  Flags: nowait postinstall skipifsilent;
  WorkingDir: "{app}"

[UninstallRun]
; Para o servidor antes de desinstalar
Filename: "{sys}\taskkill.exe";
  Parameters: "/F /IM microerp.exe";
  Flags: runhidden;
  RunOnceId: "KillServer"

[Code]
// Verifica se o servidor está rodando e para antes de atualizar
procedure CurStepChanged(CurStep: TSetupStep);
begin
  if CurStep = ssInstall then begin
    Exec(ExpandConstant('{sys}\taskkill.exe'), '/F /IM microerp.exe', '',
         SW_HIDE, ewWaitUntilTerminated, ResultCode);
  end;
end;
