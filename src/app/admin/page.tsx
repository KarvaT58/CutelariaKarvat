'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabaseBrowser } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2 } from 'lucide-react';
import { Item, Settings, ItemWithImageUrl } from '@/types/database';
import { formatBRL } from '@/lib/formatters';
import { toast } from 'sonner';
import { AdminItemCard } from '@/components/AdminItemCard';

export default function AdminPage() {
  const supabase = supabaseBrowser();
  const [items, setItems] = useState<ItemWithImageUrl[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    price_cents: '',
    whatsapp_message: '',
    position: 0,
    published: true,
    files: [] as File[]
  });
  const [loading, setLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null);

  const fetchAll = useCallback(async () => {
    const { data: itemsData } = await supabase
      .from('items')
      .select('*')
      .order('position');
    
    const { data: settingsData } = await supabase
      .from('settings')
      .select('*')
      .limit(1)
      .single();

    if (itemsData) {
      const itemsWithUrls = itemsData.map(item => {
        // Get image URLs from both old and new fields
        const imagePaths = item.image_paths && item.image_paths.length > 0 
          ? item.image_paths 
          : (item.image_path ? [item.image_path] : []);
        
        const imageUrls = imagePaths.map(path => 
          supabase.storage.from('items').getPublicUrl(path).data.publicUrl
        );
        
        return {
        ...item,
          image_url: imageUrls[0] || '', // Keep for backward compatibility
          image_urls: imageUrls
        };
      });
      setItems(itemsWithUrls);
    }
    
    setSettings(settingsData);
  }, [supabase]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Cleanup object URLs when component unmounts or files change
  useEffect(() => {
    return () => {
      form.files.forEach(file => {
        const url = URL.createObjectURL(file);
        URL.revokeObjectURL(url);
      });
    };
  }, [form.files]);

  async function saveItem() {
    if (!form.title || !form.description || !form.price_cents) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    let image_paths: string[] = editingItem?.image_paths || [];

    // Upload new files
    if (form.files.length > 0) {
      const uploadPromises = form.files.map(async (file) => {
        const path = `items/${crypto.randomUUID()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('items')
          .upload(path, file, { cacheControl: '3600', upsert: false });
      
      if (uploadError) {
          throw new Error(`Erro no upload de ${file.name}: ${uploadError.message}`);
        }
        return path;
      });

      try {
        const newPaths = await Promise.all(uploadPromises);
        image_paths = [...image_paths, ...newPaths];
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Erro no upload das imagens');
        setLoading(false);
        return;
      }
    }

    // Limit to 10 images
    if (image_paths.length > 10) {
      toast.error('Máximo de 10 imagens por item');
      setLoading(false);
      return;
    }

    const payload = {
      title: form.title,
      description: form.description,
      price_cents: parseInt(form.price_cents, 10),
      image_path: image_paths[0] || '', // Keep for backward compatibility
      image_paths: image_paths,
      whatsapp_message: form.whatsapp_message || null,
      published: form.published,
      position: form.position
    };

    const { error } = editingItem
      ? await supabase.from('items').update(payload).eq('id', editingItem.id)
      : await supabase.from('items').insert(payload);

    if (error) {
      toast.error('Erro ao salvar item');
    } else {
      toast.success(editingItem ? 'Item atualizado!' : 'Item criado!');
      setOpen(false);
      setEditingItem(null);
      setForm({ title: '', description: '', price_cents: '', position: 0, published: true, files: [] });
      fetchAll();
    }
    setLoading(false);
  }

  function openDeleteModal(item: Item) {
    setItemToDelete(item);
    setDeleteModalOpen(true);
  }

  async function confirmDelete() {
    if (!itemToDelete) return;
    
    const { error } = await supabase.from('items').delete().eq('id', itemToDelete.id);
    if (error) {
      toast.error('Erro ao excluir item');
    } else {
      toast.success('Item excluído!');
      fetchAll();
    }
    
    setDeleteModalOpen(false);
    setItemToDelete(null);
  }

  function cancelDelete() {
    setDeleteModalOpen(false);
    setItemToDelete(null);
  }

  async function togglePublished(id: string, currentStatus: boolean) {
    const { error } = await supabase
      .from('items')
      .update({ published: !currentStatus })
      .eq('id', id);
    
    if (error) {
      toast.error('Erro ao alterar status');
    } else {
      toast.success(`Item ${!currentStatus ? 'publicado' : 'despublicado'}!`);
      fetchAll();
    }
  }

  async function saveSettings() {
    if (!settings) return;
    
    const { error } = await supabase.from('settings').upsert({
      id: settings.id,
      whatsapp_number: settings.whatsapp_number
    });
    
    if (error) {
      toast.error('Erro ao salvar configurações');
    } else {
      toast.success('Configurações salvas!');
      fetchAll();
    }
  }

  function openEditDialog(item: Item) {
    setEditingItem(item);
    setForm({
      title: item.title,
      description: item.description,
      price_cents: item.price_cents.toString(),
      whatsapp_message: item.whatsapp_message || '',
      position: item.position,
      published: item.published,
      files: []
    });
    setOpen(true);
  }

  return (
        <main className="mx-auto max-w-6xl px-3 sm:px-6 py-6 sm:py-10 bg-neutral-900 min-h-screen scrollbar-thin">
          {/* Logo */}
          <div className="flex flex-col items-center mb-6">
            <img 
              src="/images/logo-cutelaria-karvat.png" 
              alt="CUTELARIA KARVAT" 
              className="w-24 h-24 sm:w-32 sm:h-32 mb-3"
            />
            <h2 className="text-lg sm:text-xl font-bold text-neutral-100">
              Cutelaria Karvat
            </h2>
          </div>
          
      <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-neutral-100">Administração</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
                <Button
                  onClick={() => {
              setEditingItem(null); 
                    setForm({ title: '', description: '', price_cents: '', whatsapp_message: '', position: 0, published: true, files: [] });
                  }}
                  className="bg-neutral-700 hover:bg-neutral-600 text-neutral-100"
                >
              Novo Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] bg-neutral-800 border-neutral-700 flex flex-col">
            <DialogHeader className="flex-shrink-0 bg-neutral-800 border-b border-neutral-700 pb-4">
              <DialogTitle className="text-neutral-100">{editingItem ? 'Editar Item' : 'Novo Item'}</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto p-1 scrollbar-thin">
            <div className="grid gap-4">
              <Input
                placeholder="Título"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                className="bg-neutral-700 border-neutral-600 text-neutral-100 placeholder:text-neutral-400"
              />
              <Textarea
                placeholder="Descrição"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="bg-neutral-700 border-neutral-600 text-neutral-100 placeholder:text-neutral-400"
              />
              <Input
                type="number"
                placeholder="Preço em centavos (ex: 5000 = R$ 50,00)"
                value={form.price_cents}
                onChange={e => setForm({ ...form, price_cents: e.target.value })}
                className="bg-neutral-700 border-neutral-600 text-neutral-100 placeholder:text-neutral-400"
              />
              <Textarea
                placeholder="Mensagem personalizada do WhatsApp (ex: nesta faca artesanal)"
                value={form.whatsapp_message}
                onChange={e => setForm({ ...form, whatsapp_message: e.target.value })}
                rows={2}
                className="bg-neutral-700 border-neutral-600 text-neutral-100 placeholder:text-neutral-400"
              />
              <Input
                type="number"
                placeholder="Posição (ordem)"
                value={form.position}
                onChange={e => setForm({ ...form, position: parseInt(e.target.value) || 0 })}
                className="bg-neutral-700 border-neutral-600 text-neutral-100 placeholder:text-neutral-400"
              />
               <div className="space-y-2">
                 <label className="text-sm font-medium text-neutral-300">
                   Imagens (máximo 10)
                 </label>
                 
                 {/* Upload Area */}
                 <div className="relative">
                   <input
                type="file"
                accept="image/*"
                     multiple
                     onChange={e => {
                       const files = Array.from(e.target.files || []);
                       const totalFiles = form.files.length + files.length;
                       
                       if (totalFiles > 10) {
                         toast.error('Máximo de 10 imagens por item');
                         return;
                       }
                       
                       setForm({ ...form, files: [...form.files, ...files] });
                     }}
                     className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                     id="image-upload"
                   />
                   <label 
                     htmlFor="image-upload"
                     className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-neutral-600 rounded-lg cursor-pointer bg-neutral-700 hover:bg-neutral-600 hover:border-neutral-500 transition-colors"
                   >
                     <div className="flex flex-col items-center justify-center pt-5 pb-6">
                       <svg className="w-8 h-8 mb-4 text-neutral-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                         <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                       </svg>
                       <p className="mb-2 text-sm text-neutral-300">
                         <span className="font-semibold">Clique para selecionar imagens</span>
                       </p>
                       <p className="text-xs text-neutral-400">PNG, JPG ou WEBP (Máximo 5 MB cada)</p>
                     </div>
                   </label>
                 </div>
      {form.files.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-neutral-400">
            {form.files.length} arquivo(s) selecionado(s):
          </p>
          
          {/* Preview das imagens */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {form.files.map((file, index) => {
              const imageUrl = URL.createObjectURL(file);
              return (
                <div key={index} className="relative group">
                  <div className="relative w-full aspect-square bg-neutral-600 rounded-lg overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newFiles = form.files.filter((_, i) => i !== index);
                        setForm({ ...form, files: newFiles });
                        URL.revokeObjectURL(imageUrl);
                      }}
                      className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1 truncate px-1">
                    {file.name}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
               </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="published"
                  checked={form.published}
                  onChange={e => setForm({ ...form, published: e.target.checked })}
                  className="bg-neutral-700 border-neutral-600"
                />
                <label htmlFor="published" className="text-neutral-300">Publicado</label>
              </div>
              </div>
            </div>
            <div className="flex-shrink-0 bg-neutral-800 pt-4 border-t border-neutral-700">
              <Button 
                onClick={saveItem} 
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
              >
                {loading ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <section className="mb-10">
            <Card className="bg-neutral-800 border-neutral-700">
          <CardHeader>
                <CardTitle className="text-neutral-100">Configurações WhatsApp</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Número (+5541999999999)"
              value={settings?.whatsapp_number || ''}
              onChange={e => setSettings({ ...settings!, whatsapp_number: e.target.value })}
                  className="bg-neutral-700 border-neutral-600 text-neutral-100 placeholder:text-neutral-400"
                />
                <Button
                  onClick={saveSettings}
                  className="bg-neutral-700 hover:bg-neutral-600 text-neutral-100"
                >
                  Salvar Configurações
                </Button>
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4 text-neutral-100">Itens ({items.length})</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(item => (
            <AdminItemCard
              key={item.id}
              item={item}
              onEdit={openEditDialog}
              onTogglePublished={togglePublished}
              onDelete={openDeleteModal}
            />
          ))}
        </div>
      </section>

      {/* Modal de Confirmação de Exclusão */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="max-w-md max-h-[90vh] bg-neutral-800 border-neutral-700 flex flex-col">
          <DialogHeader className="flex-shrink-0 bg-neutral-800 border-b border-neutral-700 pb-4">
            <DialogTitle className="text-xl font-bold text-red-400">Confirmar Exclusão</DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 py-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-900/50 rounded-full flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <p className="font-medium text-neutral-100">Tem certeza que deseja excluir este item?</p>
                <p className="text-sm text-neutral-400">Esta ação não pode ser desfeita.</p>
              </div>
            </div>

            {itemToDelete && (
              <div className="bg-neutral-700 rounded-lg p-3 mb-4">
                <p className="font-medium text-neutral-100">{itemToDelete.title}</p>
                <p className="text-sm text-neutral-300 line-clamp-2">{itemToDelete.description}</p>
                <p className="text-sm font-semibold text-green-400 mt-1">
                  {formatBRL(itemToDelete.price_cents)}
                </p>
              </div>
            )}
          </div>
          
          <div className="flex-shrink-0 bg-neutral-800 pt-4 border-t border-neutral-700">
            <div className="flex gap-3 justify-end">
              <Button 
                variant="outline" 
                onClick={cancelDelete}
                className="px-6 border-neutral-600 text-neutral-300 hover:bg-neutral-700"
              >
                Cancelar
              </Button>
              <Button 
                variant="destructive" 
                onClick={confirmDelete}
                className="px-6 bg-red-600 hover:bg-red-700 text-white"
              >
                Excluir
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
