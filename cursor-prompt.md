# PROMPT PARA O CURSOR - Carrossel de Facas Artesanais

Crie um projeto Next.js 14 completo com App Router, TypeScript, TailwindCSS, shadcn/ui e Supabase para um carrossel responsivo de facas artesanais com área administrativa.

## 🎯 Objetivo
Sistema de vitrine pública para facas artesanais com:
- **Página pública** (`/carrossel`): Cards responsivos com imagem, título, descrição, preço e botão WhatsApp
- **Área administrativa** (`/admin`): CRUD completo de itens + configurações do WhatsApp (protegida por autenticação)

## 🛠 Stack Tecnológica

### Frontend
- Next.js 14+ (App Router)
- React 18
- TypeScript
- TailwindCSS (mobile-first)
- shadcn/ui (Card, Button, Input, Textarea, Form, Dialog, Sheet, Toast)
- Lucide-react (ícones)
- Next Image (otimização)

### Backend & Infraestrutura
- Supabase (Postgres + Auth + Storage)
- RLS (Row Level Security) habilitado
- Next Server Components + Server Actions
- Zod (validação)

## 📊 Modelo de Dados (Supabase)

### Tabelas
```sql
-- Configurações do sistema (1 linha)
CREATE TABLE public.settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  whatsapp_number text NOT NULL, -- ex: +5545999999999
  whatsapp_message text NOT NULL, -- ex: Olá! Tenho interesse nesta faca.
  updated_at timestamptz DEFAULT now()
);

-- Itens do carrossel
CREATE TABLE public.items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  price_cents int NOT NULL, -- evita vírgula flutuante
  image_path text NOT NULL, -- caminho no Storage (ex: items/abc.jpg)
  published boolean DEFAULT true,
  position int DEFAULT 0, -- ordenação (drag & drop futuro)
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### Storage
- **Bucket**: `items` (público para leitura)
- **Políticas**: Leitura pública, upload apenas autenticado

### RLS (Row Level Security)
```sql
-- Habilitar RLS
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Leitura pública
CREATE POLICY "read_items_public" ON public.items
FOR SELECT USING (published = true);

CREATE POLICY "read_settings_public" ON public.settings
FOR SELECT USING (true);

-- Escrita apenas autenticado
CREATE POLICY "write_items_authenticated" ON public.items
FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "write_settings_authenticated" ON public.settings
FOR ALL TO authenticated USING (true) WITH CHECK (true);
```

## 🌐 Rotas e Funcionalidades

### `/carrossel` (Público)
- **SSR/SSG**: Renderiza itens publicados ordenados por `position`
- **Grid responsivo**: 1col (xs) → 2col (sm) → 3col (lg) → 4col (xl)
- **Cards**: Imagem 16:9, título, descrição (máx 3 linhas), preço BRL, botão WhatsApp
- **WhatsApp**: Link dinâmico com mensagem + título do produto

### `/admin` (Protegido)
- **Autenticação**: Supabase Auth (magic link ou social)
- **CRUD Itens**: Criar, editar, excluir, publicar/despublicar
- **Upload**: Imagens para bucket `items` do Supabase Storage
- **Configurações**: Número e mensagem padrão do WhatsApp
- **UI Responsiva**: Dialog (desktop) + Sheet (mobile) para formulários

## 📱 Design Responsivo

### Grid System
```css
/* Mobile-first approach */
grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
gap-4 sm:gap-6
```

### Imagens
- **Aspect ratio**: 16:9 (`aspect-[16/9]`)
- **Object fit**: `object-cover`
- **Next Image**: `sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"`

### Tipografia
- **Títulos**: `text-base sm:text-lg` com `line-clamp-1`
- **Descrições**: `text-sm` com `line-clamp-3`
- **Container**: `max-w-7xl mx-auto px-3 sm:px-6`

## 🔧 Variáveis de Ambiente
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ey...
```

## 🧩 Componentes Principais

### ItemCard
- Card responsivo com imagem, título, descrição, preço
- Botão WhatsApp com ícone (MessageCircle)
- Formatação BRL automática

### WhatsApp Link Builder
```typescript
function buildWhatsAppLink(phone: string, message: string) {
  const clean = phone.replace(/\D/g, '');
  return (title: string) => {
    const text = encodeURIComponent(`${message} - Produto: ${title}`);
    return `https://wa.me/${clean}?text=${text}`;
  };
}
```

## 🔐 Segurança

### RLS Policies
- **Leitura pública**: Apenas itens `published = true`
- **Escrita**: Apenas usuários autenticados
- **Service Role**: NUNCA expor no cliente (apenas server-side)

### Autenticação Admin
- Supabase Auth com magic link
- Opcional: Role-based access via `auth.users.user_metadata.role = 'admin'`

## 📋 Checklist de Implementação

### Setup Inicial
- [ ] Criar projeto Next.js 14 com TypeScript
- [ ] Instalar dependências (Supabase, shadcn/ui, TailwindCSS)
- [ ] Configurar TailwindCSS com plugins (typography, line-clamp)
- [ ] Inicializar shadcn/ui

### Supabase Setup
- [ ] Criar projeto Supabase
- [ ] Executar SQL das tabelas e políticas RLS
- [ ] Configurar bucket `items` no Storage
- [ ] Configurar políticas de Storage

### Componentes
- [ ] ItemCard responsivo
- [ ] Página `/carrossel` (SSR)
- [ ] Página `/admin` (protegida)
- [ ] Formulários CRUD (Dialog/Sheet)
- [ ] Sistema de upload de imagens

### Funcionalidades
- [ ] WhatsApp link builder
- [ ] Formatação de preços BRL
- [ ] Autenticação admin
- [ ] CRUD completo de itens
- [ ] Configurações WhatsApp
- [ ] Feedback visual (toast)

## 🎨 UX/UI Guidelines

### Acessibilidade
- `aria-label` em botões importantes
- Contraste adequado
- Navegação por teclado

### Performance
- Next Image com otimização
- SSR para SEO
- Lazy loading de imagens

### Mobile-First
- Touch-friendly (botões min 44px)
- Sheet para formulários no mobile
- Grid responsivo fluido

## 🚀 Deploy
- **Plataforma**: Vercel
- **Variáveis**: Configurar `NEXT_PUBLIC_SUPABASE_*` no painel
- **Domínio**: Configurar no Supabase (CORS)

---

**IMPORTANTE**: Use o JSON de especificação fornecido para criar todos os arquivos com a estrutura e código base necessários. O projeto deve estar 100% funcional após a implementação.
