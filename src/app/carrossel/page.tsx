import { supabaseServer } from '@/lib/supabase-server';
import { ItemCard } from '@/components/ItemCard';
import { Instagram, Youtube, Music } from 'lucide-react';

export default async function CarrosselPage() {
  const supabase = await supabaseServer();

  const { data: settings, error: settingsError } = await supabase
    .from('settings')
    .select('*')
    .limit(1)
    .single();

  if (settingsError) {
    console.error('Settings error:', settingsError);
  }

      const { data: items, error: itemsError } = await supabase
        .from('items')
        .select('id,title,description,price_cents,image_path,image_paths,whatsapp_message,published,position,created_at,updated_at')
        .eq('published', true)
        .order('position', { ascending: true });

  if (itemsError) {
    console.error('Items error:', itemsError);
  }

  const urlFor = (path: string) =>
    supabase.storage.from('items').getPublicUrl(path).data.publicUrl;

  return (
    <main className="mx-auto max-w-7xl px-3 sm:px-6 py-6 sm:py-10 bg-neutral-900 min-h-screen">
          <div className="text-center mb-8">
            {/* Logo */}
            <div className="flex flex-col items-center mb-6">
              <img 
                src="/images/logo-cutelaria-karvat.png" 
                alt="CUTELARIA KARVAT" 
                className="w-32 h-32 sm:w-40 sm:h-40 mb-3"
              />
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-100">
                Cutelaria Karvat
              </h2>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-neutral-100">
              Facas Artesanais
            </h1>
            <p className="text-neutral-300 text-lg">
              Qualidade artesanal, feitas à mão com precisão
            </p>
          </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {(items || []).map((item) => {
          // Get image URLs from both old and new fields
          const imagePaths = item.image_paths && item.image_paths.length > 0 
            ? item.image_paths 
            : (item.image_path ? [item.image_path] : []);
          
          const imageUrls = imagePaths.map((path: string) => urlFor(path));
          
          return (
                <ItemCard
                  key={item.id}
                  item={{
                    ...item,
                    image_url: imageUrls[0] || '', // Keep for backward compatibility
                    image_urls: imageUrls,
                    whatsapp_number: settings?.whatsapp_number || '',
                    whatsapp_message: item.whatsapp_message || ''
                  }}
                />
          );
        })}
      </section>

      {(!items || items.length === 0) && (
        <div className="text-center py-12">
          <p className="text-neutral-400">
            Nenhum item disponível no momento.
          </p>
        </div>
      )}

      {/* Footer com redes sociais */}
      <footer className="mt-16 pt-8 border-t border-neutral-800">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-neutral-200 mb-4">
            Siga-nos nas redes sociais
          </h3>
          <div className="flex justify-center gap-6">
            {/* TikTok */}
            <a
              href="https://www.tiktok.com/@cutelaria.karvat"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center gap-2 text-neutral-400 hover:text-white transition-colors duration-200"
            >
              <div className="w-12 h-12 bg-neutral-800 rounded-full flex items-center justify-center group-hover:bg-neutral-700 transition-colors duration-200">
                <Music className="w-6 h-6" />
              </div>
              <span className="text-sm font-medium">TikTok</span>
            </a>

            {/* Instagram */}
            <a
              href="https://www.instagram.com/wanderleykarvat/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center gap-2 text-neutral-400 hover:text-white transition-colors duration-200"
            >
              <div className="w-12 h-12 bg-neutral-800 rounded-full flex items-center justify-center group-hover:bg-neutral-700 transition-colors duration-200">
                <Instagram className="w-6 h-6" />
              </div>
              <span className="text-sm font-medium">Instagram</span>
            </a>

            {/* YouTube */}
            <a
              href="https://www.youtube.com/@CutelariaKarvat/featured"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center gap-2 text-neutral-400 hover:text-white transition-colors duration-200"
            >
              <div className="w-12 h-12 bg-neutral-800 rounded-full flex items-center justify-center group-hover:bg-neutral-700 transition-colors duration-200">
                <Youtube className="w-6 h-6" />
              </div>
              <span className="text-sm font-medium">YouTube</span>
            </a>
          </div>
          
          <p className="text-neutral-500 text-sm mt-6">
            © 2024 Cutelaria Karvat. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </main>
  );
}
