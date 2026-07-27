# Mise en place du serveur de déploiement (Windows Server, sans SSH)

À exécuter directement sur le serveur via RDP.

## 1. Installer WSL2 + Ubuntu-24.04 (PowerShell, en Administrateur)

```powershell
wsl --install Ubuntu-24.04
```

Redémarrer le serveur si demandé (première activation des fonctionnalités WSL/Hyper-V).
Relancer ensuite `Ubuntu-24.04` depuis le menu Démarrer une première fois : ça demande de créer
un utilisateur Linux (ex: `deploy`) et un mot de passe. Le noter, servira pour `sudo`.

## 2. Installer Docker Engine dans Ubuntu (pas Docker Desktop)

Dans un terminal Ubuntu-24.04 (`wsl -d Ubuntu-24.04`) :

```bash
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
```

Fermer et rouvrir le terminal WSL pour que l'appartenance au groupe `docker` prenne effet.

## 3. Activer systemd dans WSL (nécessaire pour que Docker démarre automatiquement)

```bash
sudo tee /etc/wsl.conf > /dev/null << 'EOF'
[boot]
systemd=true
EOF
```

Puis, **depuis PowerShell** (pas dans WSL) :

```powershell
wsl --shutdown
wsl -d Ubuntu-24.04
```

Vérifier que systemd tourne :

```bash
systemctl status docker
```

Si Docker n'est pas actif :

```bash
sudo systemctl enable docker
sudo systemctl start docker
```

## 4. Installer le runner GitHub Actions self-hosted

Sur GitHub : `Settings > Actions > Runners > New self-hosted runner` (choisir Linux x64) pour
obtenir l'URL et le token d'enregistrement (le token est à usage unique, à générer au moment de
l'installation).

Dans Ubuntu-24.04 :

```bash
mkdir ~/actions-runner && cd ~/actions-runner
curl -o actions-runner-linux-x64.tar.gz -L https://github.com/actions/runner/releases/latest/download/actions-runner-linux-x64-2.321.0.tar.gz
tar xzf actions-runner-linux-x64.tar.gz

./config.sh --url https://github.com/Andryrkt/docker-informix --token <TOKEN_A_COPIER_DEPUIS_GITHUB> --labels self-hosted,prod --unattended

sudo ./svc.sh install
sudo ./svc.sh start
```

Vérifier qu'il apparaît "Idle" dans GitHub (`Settings > Actions > Runners`).

## 5. Cloner le repo et préparer les secrets sur le serveur

```bash
git clone https://github.com/Andryrkt/docker-informix.git ~/docker-informix
cd ~/docker-informix
cp .env.prod.example .env.prod
nano .env.prod   # remplir les vraies valeurs (mots de passe, hosts, cles JWT...)
```

Copier aussi les clés JWT (elles ne sont pas dans git, gitignorées) :
`config/jwt/private.pem` et `config/jwt/public.pem` doivent être placés dans
`~/docker-informix/backend/config/jwt/` sur le serveur (les générer avec
`php bin/console lexik:jwt:generate-keypair` si elles n'existent pas encore, ou les copier
depuis un environnement existant).

## 6. Faire en sorte que WSL démarre automatiquement avec le serveur

Par défaut, une distro WSL ne démarre pas toute seule au boot de Windows. Créer une tâche
planifiée (PowerShell, en Administrateur) :

```powershell
$action = New-ScheduledTaskAction -Execute "wsl.exe" -Argument "-d Ubuntu-24.04 -u root -- true"
$trigger = New-ScheduledTaskTrigger -AtStartup
$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest
Register-ScheduledTask -TaskName "WSL-Ubuntu-AutoStart" -Action $action -Trigger $trigger -Principal $principal
```

Cette tâche réveille juste la distro au démarrage de Windows ; une fois réveillée, systemd
(activé à l'étape 3) démarre automatiquement `docker.service` et le runner GitHub Actions
(installé comme service systemd à l'étape 4).

## 7. Vérification finale

```bash
docker compose -f ~/docker-informix/docker-compose.prod.yml pull
docker compose -f ~/docker-informix/docker-compose.prod.yml up -d
docker compose -f ~/docker-informix/docker-compose.prod.yml ps
```

Puis tester `http://<ip-ou-nom-du-serveur>/` (frontend), `/api/doc` (backend), `/docs/` (docs).

---

Une fois ces étapes faites, le job `deploy` du pipeline GitHub Actions (déclenché sur push vers
`main`) prendra le relais automatiquement : `git pull` n'est pas nécessaire côté serveur pour les
déploiements suivants, le workflow fait lui-même `docker compose pull && up -d` avec les
nouvelles images.
