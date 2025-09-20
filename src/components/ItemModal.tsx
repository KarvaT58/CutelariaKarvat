'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MessageCircle, X, ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { ItemWithImageUrl } from '@/types/database';
import { formatBRL } from '@/lib/formatters';
import { useImageDimensions, getModalImageHeight } from '@/hooks/useImageDimensions';

interface ItemModalProps {
  item: ItemWithImageUrl & {
    whatsapp_number: string;
    whatsapp_message: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

export function ItemModal({ item, isOpen, onClose }: ItemModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);
  const thumbnailsRef = useRef<HTMLDivElement>(null);
  
  // Get images from both old and new fields
  const images = item.image_urls && item.image_urls.length > 0 
    ? item.image_urls 
    : (item.image_url ? [item.image_url] : []);
  
  // Get dimensions for current image
  const currentImageUrl = images[currentImageIndex] || '';
  const imageDimensions = useImageDimensions(currentImageUrl);

  // Scroll para a thumbnail ativa sempre que currentImageIndex mudar
  useEffect(() => {
    if (isOpen && images.length > 1) {
      scrollToActiveThumbnail(currentImageIndex);
    }
  }, [currentImageIndex, isOpen, images.length]);

  const buildWhatsAppLink = (title: string) => {
    const clean = (item.whatsapp_number || '').replace(/\D/g, '');
    const text = encodeURIComponent(`Olá! Tenho interesse, ${item.whatsapp_message || ''}`);
    return `https://wa.me/${clean}?text=${text}`;
  };

  const handleImageError = (index: number) => {
    setImageErrors(prev => new Set(prev).add(index));
  };

  // Swipe functions
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && images.length > 1) {
      nextImage();
    } else if (isRightSwipe && images.length > 1) {
      prevImage();
    }
  };

  const nextImage = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
      setTimeout(() => setIsTransitioning(false), 150);
    }, 150);
  };

  const prevImage = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
      setTimeout(() => setIsTransitioning(false), 150);
    }, 150);
  };

  const goToImage = (index: number) => {
    if (isTransitioning || index === currentImageIndex) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentImageIndex(index);
      setTimeout(() => setIsTransitioning(false), 150);
    }, 150);
  };

  // Função para fazer scroll automático das thumbnails
  const scrollToActiveThumbnail = (index: number) => {
    if (thumbnailsRef.current) {
      const thumbnailWidth = 80; // 64px + 8px gap = ~80px por thumbnail
      const containerWidth = thumbnailsRef.current.clientWidth;
      const scrollPosition = (index * thumbnailWidth) - (containerWidth / 2) + (thumbnailWidth / 2);
      
      thumbnailsRef.current.scrollTo({
        left: Math.max(0, scrollPosition),
        behavior: 'smooth'
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
      }
    }}>
        <DialogContent 
          className="max-w-5xl max-h-[95vh] p-0 gap-0 sm:max-w-4xl bg-neutral-800 border-neutral-700 flex flex-col z-50 w-[95vw] sm:w-full"
          showCloseButton={false}
        >
        <DialogHeader className="flex-shrink-0 p-4 sm:p-6 pb-2 sm:pb-4 bg-neutral-800 border-b border-neutral-700">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl sm:text-2xl font-bold pr-4 text-neutral-100">{item.title}</DialogTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-8 w-8 flex-shrink-0 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-700"
                >
                  <X className="h-4 w-4" />
                </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-4 sm:pb-6">
          {/* Image Gallery Section */}
          <div className="mb-4 sm:mb-6">
            <div 
              ref={imageRef}
                  className={`relative w-full ${getModalImageHeight(imageDimensions?.orientation)} bg-neutral-700 rounded-lg overflow-hidden shadow-lg`}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
                  {images.length > 0 && images[currentImageIndex] && !imageErrors.has(currentImageIndex) ? (
                    <>
                      <Image
                        src={images[currentImageIndex]}
                        alt={`${item.title} - Imagem ${currentImageIndex + 1}`}
                        fill
                        className={`object-cover transition-all duration-300 ease-in-out ${
                          isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                        }`}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 60vw"
                        onError={() => handleImageError(currentImageIndex)}
                        unoptimized={true}
                      />
                  
                  
                  {/* Navigation arrows - Hidden on mobile */}
                  {images.length > 1 && (
                    <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={prevImage}
                            disabled={isTransitioning}
                            className="hidden sm:flex absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white transition-all duration-200 hover:scale-110 disabled:opacity-50"
                          >
                            <ChevronLeft className="h-6 w-6" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={nextImage}
                            disabled={isTransitioning}
                            className="hidden sm:flex absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white transition-all duration-200 hover:scale-110 disabled:opacity-50"
                          >
                            <ChevronRight className="h-6 w-6" />
                          </Button>
                    </>
                  )}
                  
                  {/* Image counter */}
                  {images.length > 1 && (
                    <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                      {currentImageIndex + 1} / {images.length}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center h-full bg-neutral-600">
                  <div className="text-center text-neutral-400">
                    <ImageIcon className="w-16 h-16 mx-auto mb-4" />
                    <p className="text-lg">Imagem não encontrada</p>
                  </div>
                </div>
              )}
            </div>
            
                {/* Thumbnail navigation */}
                {images.length > 1 && (
                  <div ref={thumbnailsRef} className="flex gap-2 mt-4 overflow-x-auto pb-2">
                      {images.map((image, index) => (
                        image && (
                        <button
                          key={index}
                          onClick={() => goToImage(index)}
                          className={`relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all duration-200 cursor-pointer ${
                            index === currentImageIndex
                              ? 'border-blue-500 ring-2 ring-blue-200 scale-105'
                              : 'border-neutral-600 hover:border-neutral-500 hover:scale-105'
                          }`}
                        >
                            <Image
                              src={image}
                              alt={`Thumbnail ${index + 1}`}
                              fill
                              className="object-cover"
                              sizes="64px"
                              onError={() => handleImageError(index)}
                              unoptimized={true}
                            />
                          </button>
                        )
                      ))}
                    </div>
                  )}
          </div>

          {/* Content Section */}
          <div className="space-y-4 sm:space-y-6">
            {/* Description */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-neutral-100">Descrição</h3>
              <p className="text-neutral-300 leading-relaxed text-sm sm:text-base">
                {item.description}
              </p>
            </div>

              {/* Price */}
              <div className="bg-neutral-700 rounded-lg p-4 border border-neutral-600">
                <div className="flex items-center justify-between">
                  <span className="text-base sm:text-lg font-medium text-neutral-300">Preço:</span>
                  <span className="text-2xl sm:text-3xl font-bold text-neutral-100">
                    {formatBRL(item.price_cents)}
                  </span>
                </div>
              </div>

          </div>
        </div>
        
        {/* Footer Fixo */}
        <div className="flex-shrink-0 bg-neutral-800 border-t border-neutral-700 p-4 sm:p-6">
          {/* WhatsApp Button */}
          <div className="mb-3">
            <Button
              asChild
              size="lg"
              className="w-full gap-3 text-base sm:text-lg py-4 sm:py-6 px-6 sm:px-8 bg-green-600 hover:bg-green-700 transition-all duration-200 hover:scale-105"
            >
              <a
                href={buildWhatsAppLink(item.title)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3"
              >
                <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
                <span>Conversar no WhatsApp</span>
              </a>
            </Button>
          </div>

        </div>
        </DialogContent>
      </Dialog>
    );
}
