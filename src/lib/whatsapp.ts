export function buildWhatsAppLink(phone: string, message: string) {
  const clean = (phone || '').replace(/\D/g, '');
  return (title: string) => {
    const text = encodeURIComponent(`${message || 'Olá! Tenho interesse.'} - Produto: ${title}`);
    return `https://wa.me/${clean}?text=${text}`;
  };
}
