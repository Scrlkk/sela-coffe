export const getInitials = (name?: string): string => {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.substring(0, 2).toUpperCase();
};

export const formatWhatsAppUrl = (phone?: string): string => {
  if (!phone) return "";
  const cleaned = phone.replace(/[^0-9]/g, "");
  return `https://wa.me/${cleaned}`;
};
