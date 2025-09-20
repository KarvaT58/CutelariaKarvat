'use client';

import { useState, useEffect } from 'react';

interface ImageDimensions {
  width: number;
  height: number;
  aspectRatio: number;
  orientation: 'landscape' | 'portrait' | 'square';
}

export function useImageDimensions(src: string): ImageDimensions | null {
  const [dimensions, setDimensions] = useState<ImageDimensions | null>(null);

  useEffect(() => {
    if (!src) return;

    const img = new Image();
    
    img.onload = () => {
      const aspectRatio = img.width / img.height;
      const orientation = aspectRatio > 1.1 ? 'landscape' : 
                        aspectRatio < 0.9 ? 'portrait' : 'square';
      
      setDimensions({
        width: img.width,
        height: img.height,
        aspectRatio,
        orientation
      });
    };

    img.onerror = () => {
      setDimensions(null);
    };

    img.src = src;
  }, [src]);

  return dimensions;
}

// Função utilitária para calcular classes CSS baseadas na orientação
export function getImageContainerClasses(orientation: string | undefined): string {
  switch (orientation) {
    case 'portrait':
      return 'aspect-[3/4]'; // Retrato: 3:4
    case 'landscape':
      return 'aspect-[4/3]'; // Paisagem: 4:3
    case 'square':
      return 'aspect-square'; // Quadrado: 1:1
    default:
      return 'aspect-[4/3]'; // Padrão: 4:3
  }
}

// Função para calcular altura dinâmica baseada na orientação
export function getModalImageHeight(orientation: string | undefined): string {
  switch (orientation) {
    case 'portrait':
      return 'h-64 sm:h-80 md:h-96 lg:h-[28rem]'; // Mais alto para retrato
    case 'landscape':
      return 'h-48 sm:h-56 md:h-64 lg:h-72'; // Mais baixo para paisagem
    case 'square':
      return 'h-56 sm:h-64 md:h-72 lg:h-80'; // Médio para quadrado
    default:
      return 'h-48 sm:h-64 md:h-80 lg:h-96'; // Padrão
  }
}
