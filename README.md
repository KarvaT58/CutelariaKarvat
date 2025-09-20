# 🗡️ Carrossel de Facas Artesanais

Sistema de vitrine pública para facas artesanais com área administrativa completa.

## ✨ Funcionalidades

- **Página Pública** (`/carrossel`): Cards responsivos com imagem, título, descrição, preço e botão WhatsApp
- **Área Admin** (`/admin`): CRUD completo de itens + configurações do WhatsApp
- **Upload de Imagens**: Integração com Supabase Storage
- **Responsivo**: Mobile-first design
- **Autenticação**: Proteção da área administrativa

## 🛠️ Stack Tecnológica

- **Frontend**: Next.js 14, React 18, TypeScript, TailwindCSS, shadcn/ui
- **Backend**: Supabase (Postgres + Auth + Storage)
- **Segurança**: RLS (Row Level Security)

## 🚀 Setup Rápido

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar Supabase

#### Criar Projeto no Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Anote a URL e a chave anônima

#### Executar SQL no Editor SQL
```sql
-- Tabelas
CREATE TABLE public.settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  whatsapp_number text NOT NULL,
  whatsapp_message text NOT NULL,
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  price_cents int NOT NULL,
  image_path text NOT NULL,
  published boolean DEFAULT true,
  position int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "read_items_public" ON public.items
FOR SELECT USING (published = true);

CREATE POLICY "write_items_authenticated" ON public.items
FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "read_settings_public" ON public.settings
FOR SELECT USING (true);

CREATE POLICY "write_settings_authenticated" ON public.settings
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Inserir configuração inicial
INSERT INTO public.settings (whatsapp_number, whatsapp_message) 
VALUES ('+5541999999999', 'Olá! Tenho interesse nesta faca.');
```

#### Configurar Storage
1. Vá em **Storage** no painel do Supabase
2. Crie um bucket chamado `items`
3. Configure como público para leitura

### 3. Variáveis de Ambiente
```bash
cp .env.example .env.local
```

Edite `.env.local` com suas credenciais:
```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
```

### 4. Executar o Projeto
```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## 📱 Rotas

- **`/`** → Redireciona para `/carrossel`
- **`/carrossel`** → Vitrine pública dos itens
- **`/admin`** → Área administrativa (requer autenticação)

## 🔐 Autenticação Admin

Para acessar a área administrativa, você precisará configurar autenticação no Supabase:

1. Vá em **Authentication** → **Settings**
2. Configure os provedores desejados (Email, Google, etc.)
3. Crie um usuário ou use magic link

## 🎨 Personalização

### Cores e Tema
Edite `src/app/globals.css` para personalizar as cores do tema.

### Layout
- **Grid responsivo**: 1col (xs) → 2col (sm) → 3col (lg) → 4col (xl)
- **Imagens**: Aspect ratio 16:9, otimizadas com Next Image
- **Tipografia**: Mobile-first com line-clamp

## 📦 Deploy

### Vercel (Recomendado)
1. Conecte o repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático

### Outras Plataformas
O projeto é compatível com qualquer plataforma que suporte Next.js.

## 🛡️ Segurança

- **RLS**: Leitura pública apenas para itens publicados
- **Escrita**: Apenas usuários autenticados
- **Upload**: Validação de tipos de arquivo
- **CORS**: Configurado no Supabase

## 📄 Licença

MIT License - veja o arquivo LICENSE para detalhes.

---

**Desenvolvido com ❤️ usando Next.js e Supabase**