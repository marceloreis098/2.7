# Gerenciador de Inventário Pro

Este é um guia completo para a instalação e configuração do sistema Gerenciador de Inventário Pro em um ambiente de produção interno. A aplicação utiliza uma arquitetura full-stack com um frontend em React, um backend em Node.js (Express) e um banco de dados MariaDB rodando em um servidor Ubuntu.

## Arquitetura

A aplicação é dividida em dois componentes principais dentro do mesmo repositório. Para evitar qualquer confusão, aqui está a estrutura de diretórios do projeto:

```
/var/www/Inventario/
├── inventario-api/         <-- Backend (API Node.js)
│   ├── node_modules/
│   ├── mockData.js
│   ├── package.json
│   └── server.js
│
├── node_modules/           <-- Dependências do Frontend
├── dist/                   <-- Pasta de produção do Frontend (criada após o build)
├── components/
├── services/
├── index.html              <-- Arquivos do Frontend (React)
├── package.json
└── ... (outros arquivos do frontend)
```

**Componentes:**

1.  **Frontend (Diretório Raiz: `/var/www/Inventario`)**: Uma aplicação React (Vite + TypeScript) responsável pela interface do usuário. **Todos os comandos do frontend devem ser executados a partir daqui.**
2.  **Backend (Pasta `inventario-api`)**: Um servidor Node.js/Express que recebe as requisições do frontend, aplica a lógica de negócio e se comunica com o banco de dados. **Todos os comandos do backend devem ser executados a partir de `Inventario/inventario-api/`.**

---

## Passo a Passo para Instalação

Siga estes passos para configurar e executar a aplicação.

### Passo 0: Obtendo os Arquivos da Aplicação com Git

Antes de configurar o banco de dados ou o servidor, você precisa obter os arquivos da aplicação no seu servidor.

1.  **Crie o Diretório de Trabalho (se não existir):**
    O diretório `/var/www` é a convenção para hospedar aplicações web.
    ```bash
    sudo mkdir -p /var/www
    sudo chown -R $USER:$USER /var/www
    ```

2.  **Instale o Git:**
    ```bash
    sudo apt update && sudo apt install git
    ```

3.  **Clone o Repositório da Aplicação:**
    Navegue até o diretório preparado e clone o repositório. **Substitua a URL abaixo pela URL real do seu repositório Git.**
    ```bash
    cd /var/www/
    git clone https://github.com/marceloreis098/teste4.git Inventario
    ```
    Isso criará a pasta `Inventario` com todos os arquivos do projeto.

### Passo 1: Configuração do Banco de Dados (MariaDB)

1.  **Instale e Proteja o MariaDB Server:**
    ```bash
    sudo apt install mariadb-server
    sudo mysql_secure_installation
    ```

2.  **Crie o Banco de Dados e o Usuário:**
    Acesse o console do MariaDB com o usuário root (`sudo mysql -u root -p`). Execute os comandos SQL a seguir. **Substitua `'sua_senha_forte'` por uma senha segura.**
    ```sql
    CREATE DATABASE inventario_pro CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    CREATE USER 'inventario_user'@'localhost' IDENTIFIED BY 'sua_senha_forte';
    GRANT ALL PRIVILEGES ON inventario_pro.* TO 'inventario_user'@'localhost';
    FLUSH PRIVILEGES;
    EXIT;
    ```
    
### Passo 2: Configuração do Firewall (UFW)

1.  **Adicione as Regras e Habilite:**
    ```bash
    sudo ufw allow ssh          # Permite acesso SSH
    sudo ufw allow 3000/tcp     # Permite acesso ao Frontend
    sudo ufw allow 3001/tcp     # Permite acesso à API
    sudo ufw enable
    ```

### Passo 3: Configuração do Backend (API)

1.  **Instale o Node.js (se não tiver):**
    ```bash
    curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
    sudo apt-get install -y nodejs
    ```

2.  **Instale as Dependências da API:**
    ```bash
    # Navegue até a pasta da API
    cd /var/www/Inventario/inventario-api
    
    # Instale as dependências (incluindo otplib, bcryptjs e mysql2)
    npm install
    ```
    **Nota:** O servidor da API irá criar as tabelas necessárias no banco de dados automaticamente na primeira vez que for iniciado.

3.  **Crie o Arquivo de Variáveis de Ambiente (`.env`):**
    ```bash
    # Certifique-se de estar em /var/www/Inventario/inventario-api
    nano .env
    ```
    Adicione o seguinte conteúdo, usando a senha que você definiu:
    ```
    DB_HOST=localhost
    DB_USER=inventario_user
    DB_PASSWORD=sua_senha_forte
    DB_DATABASE=inventario_pro
    API_PORT=3001
    BCRYPT_SALT_ROUNDS=10
    ```

### Passo 4: Configuração do Frontend

1.  **Instale `serve` e `pm2` globalmente:**
    ```bash
    sudo npm install -g serve pm2
    ```

2.  **Instale as Dependências do Frontend:**
    ```bash
    # Navegue até a pasta raiz do projeto
    cd /var/www/Inventario
    npm install 
    ```

3.  **Compile a Aplicação para Produção:**
    Este passo é crucial. Ele cria uma pasta `dist` com a versão otimizada do site.
    ```bash
    # Certifique-se de estar em /var/www/Inventario
    npm run build
    ```

### Passo 5: Executando a Aplicação com PM2

`pm2` irá garantir que a API e o frontend rodem continuamente. Usamos `npx` para garantir que o comando `pm2` seja encontrado.

1.  **Inicie a API com o PM2:**
    ```bash
    # Navegue para a pasta da API
    cd /var/www/Inventario/inventario-api
    npx pm2 start server.js --name inventario-api
    ```

2.  **Inicie o Frontend com o PM2:**
    **Atenção:** O comando abaixo deve ser executado da pasta raiz do projeto.
    ```bash
    # Navegue para a pasta raiz do projeto
    cd /var/www/Inventario
    
    # O comando serve o conteúdo da pasta de produção 'dist' na porta 3000.
    npx pm2 start serve --name inventario-frontend -- -s dist -l 3000
    ```

3.  **Configure o PM2 para Iniciar com o Servidor:**
    ```bash
    npx pm2 startup
    ```
    O comando acima irá gerar um outro comando que você precisa copiar e executar. **Execute o comando que ele fornecer.**

4.  **Salve a Configuração de Processos do PM2:**
    ```bash
    npx pm2 save
    ```

5.  **Gerencie os Processos:**
    -   Ver status: `npx pm2 list`
    -   Ver logs da API: `npx pm2 logs inventario-api`
    -   Ver logs do Frontend: `npx pm2 logs inventario-frontend`
    -   Reiniciar a API: `npx pm2 restart inventario-api`
    -   Reiniciar o Frontend: `npx pm2 restart inventario-frontend`

### Passo 6: Acesso à Aplicação

Abra o navegador no endereço do seu servidor Ubuntu, na porta do frontend: `http://<ip-do-servidor>:3000`.

A aplicação deve carregar a tela de login. Use as credenciais `admin` / `marceloadmin` para acessar o sistema.

---

## Configuração Adicional

### Garantindo a Inicialização Automática

Para garantir que tanto o frontend quanto o backend iniciem automaticamente sempre que o servidor for reiniciado, siga estes passos. Este processo utiliza o `pm2` para registrar as aplicações como um serviço do sistema.

**Pré-requisito:** Certifique-se de que seus processos (`inventario-api` e `inventario-frontend`) já foram iniciados pelo menos uma vez com o `pm2`, conforme o Passo 5. Você pode verificar com `npx pm2 list`.

#### 1. Gerar o Script de Inicialização

Execute o seguinte comando. O `pm2` irá detectar seu sistema operacional e gerar um comando específico para configurar o serviço de inicialização.

```bash
npx pm2 startup
```

A saída será algo como:

```
[PM2] To setup the Startup Script, copy/paste the following command:
sudo env PATH=$PATH:/usr/bin /.../pm2 startup systemd -u <seu_usuario> --hp /home/<seu_usuario>
```

#### 2. Executar o Comando Gerado

**Copie e cole o comando exato** que foi exibido no seu terminal. É fundamental executar este comando com `sudo` (se for o caso) para que o `pm2` tenha as permissões necessárias para criar o serviço.

#### 3. Salvar a Lista de Processos

Após executar o comando anterior, salve a lista de processos que o `pm2` deve gerenciar. Isso fará com que o `pm2` "lembre" quais aplicações iniciar no boot.

```bash
npx pm2 save
```

Pronto! Agora, sempre que o servidor for reiniciado, o `pm2` será iniciado automaticamente e, em seguida, iniciará a `inventario-api` e o `inventario-frontend`.

**Para testar:** Você pode reiniciar o servidor (`sudo reboot`) e, após o reinício, verificar o status com `npx pm2 list`. Ambos os processos devem estar com o status `online`.

### Atualizando a Aplicação com Git

Para atualizar a aplicação com as últimas alterações do repositório, siga estes passos.

#### 1. Baixar as Atualizações

Primeiro, navegue até a pasta raiz do projeto e use o `git` para baixar as novidades.

```bash
# Navegue para a pasta raiz
cd /var/www/Inventario

# Baixe as atualizações do repositório (branch 'main' ou 'master')
git pull origin main
```

#### 2. Aplicar as Mudanças

Após baixar os arquivos, pode ser necessário reinstalar dependências (se o `package.json` mudou) e reconstruir o frontend.

**Para o Backend (API):**

```bash
# Navegue para a pasta da API
cd /var/www/Inventario/inventario-api

# Instale quaisquer novas dependências
npm install

# Reinicie la aplicação com pm2 para aplicar as mudanças
npx pm2 restart inventario-api
```

**Para o Frontend:**

```bash
# Navegue para a pasta raiz do projeto
cd /var/www/Inventario

# Instale quaisquer novas dependências
npm install

# Recompile os arquivos do frontend
npm run build

# Reinicie o servidor do frontend com pm2
npx pm2 restart inventario-frontend
```

Após esses passos, sua aplicação estará atualizada e rodando com a versão mais recente. Verifique os logs com `npx pm2 logs` se encontrar algum problema.