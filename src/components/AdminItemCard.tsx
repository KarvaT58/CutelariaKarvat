'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Eye, EyeOff, ImageIcon } from 'lucide-react';
import { ItemWithImageUrl } from '@/types/database';
import { formatBRL } from '@/lib/formatters';
import { useImageDimensions, getImageContainerClasses } from '@/hooks/useImageDimensions';

interface AdminItemCardProps {
  item: ItemWithImageUrl;
  onEdit: (item: ItemWithImageUrl) => void;
  onTogglePublished: (id: string, published: boolean) => void;
  onDelete: (item: ItemWithImageUrl) => void;
}

export function AdminItemCard({ item, onEdit, onTogglePublished, onDelete }: AdminItemCardProps) {
  const imageDimensions = useImageDimensions(item.image_url);

  return (
    <Card className="overflow-hidden bg-neutral-800 border-neutral-700">
      <div className={`relative w-full ${getImageContainerClasses(imageDimensions?.orientation)}`}>
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-neutral-600 flex items-center justify-center">
            <div className="text-center text-neutral-400">
              <ImageIcon className="w-12 h-12 mx-auto mb-2" />
              <p className="text-sm">Sem imagem</p>
            </div>
          </div>
        )}
        <Badge className={`absolute top-2 right-2 ${item.published ? 'bg-green-600' : 'bg-neutral-600'}`}>
          {item.published ? 'Publicado' : 'Rascunho'}
        </Badge>
      </div>
      <CardContent className="p-4 bg-neutral-800">
        <h3 className="font-semibold line-clamp-1 text-neutral-100">{item.title}</h3>
        <p className="text-sm text-neutral-300 line-clamp-2">{item.description}</p>
        <p className="font-semibold mt-2 text-green-400">{formatBRL(item.price_cents)}</p>
        <div className="flex gap-2 mt-3">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => onEdit(item)}
            className="border-neutral-600 text-neutral-300 hover:bg-neutral-700"
          >
            <Edit className="size-4" />
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => onTogglePublished(item.id, item.published)}
            className="border-neutral-600 text-neutral-300 hover:bg-neutral-700"
          >
            {item.published ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </Button>
          <Button 
            size="sm" 
            variant="destructive" 
            onClick={() => onDelete(item)}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
