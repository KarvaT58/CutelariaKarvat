'use client';

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, ImageIcon } from 'lucide-react';
import { ItemWithImageUrl } from '@/types/database';
import { formatBRL } from '@/lib/formatters';
import { useState } from 'react';
import { ItemModal } from './ItemModal';
import { useImageDimensions, getImageContainerClasses } from '@/hooks/useImageDimensions';

interface ItemCardProps {
  item: ItemWithImageUrl & {
    whatsapp_number: string;
    whatsapp_message: string;
  };
}

export function ItemCard({ item }: ItemCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const imageDimensions = useImageDimensions(item.image_url);
  
  const buildWhatsAppLink = (title: string) => {
    const clean = (item.whatsapp_number || '').replace(/\D/g, '');
    const text = encodeURIComponent(`Olá! Tenho interesse, ${item.whatsapp_message || ''}`);
    return `https://wa.me/${clean}?text=${text}`;
  };
  
  return (
    <>
      <Card 
        className="overflow-hidden rounded-2xl hover:shadow-lg transition-shadow bg-neutral-800 border-neutral-700 cursor-pointer hover:scale-105"
        onClick={() => setIsModalOpen(true)}
      >
      <div className={`relative w-full ${getImageContainerClasses(imageDimensions?.orientation)} bg-neutral-700`}>
        {!imageError && item.image_url ? (
          <>
            <Image
              src={item.image_url}
              alt={item.title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              onError={() => setImageError(true)}
              unoptimized={true}
            />
            {/* Multiple images indicator */}
            {item.image_urls && item.image_urls.length > 1 && (
              <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                <ImageIcon className="w-3 h-3" />
                <span>{item.image_urls.length}</span>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full bg-neutral-600">
            <div className="text-center text-neutral-400">
              <ImageIcon className="w-12 h-12 mx-auto mb-2" />
              <p className="text-sm">Imagem não encontrada</p>
            </div>
          </div>
        )}
      </div>
      <CardHeader className="pb-2 bg-neutral-800">
        <CardTitle className="text-base sm:text-lg line-clamp-1 text-neutral-100">
          {item.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 bg-neutral-800">
        <p className="text-sm text-neutral-300 line-clamp-3">
          {item.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="font-semibold text-lg text-neutral-100">
            {formatBRL(item.price_cents)}
          </span>
          <Button 
            asChild 
            className="gap-2 bg-green-600 hover:bg-green-700 text-white" 
            size="sm"
            onClick={(e) => e.stopPropagation()}
          >
            <a 
              href={buildWhatsAppLink(item.title)} 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="Conversar no WhatsApp"
            >
              <MessageCircle className="size-4" />
              WhatsApp
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>

    {/* Item Modal */}
    <ItemModal
      item={item}
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
    />
    </>
  );
}
