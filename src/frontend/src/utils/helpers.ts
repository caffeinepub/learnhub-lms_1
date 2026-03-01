export function formatPrice(price: bigint): string {
  if (price === 0n) return "Free";
  return `$${Number(price).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function formatDuration(seconds: bigint): string {
  const total = Number(seconds);
  if (total < 60) return `${total}s`;
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  if (mins < 60) return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`;
}

export function formatDate(timestamp: bigint): string {
  // ICP timestamps are in nanoseconds
  const ms = Number(timestamp) / 1_000_000;
  return new Date(ms).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function getThumbnailUrl(url: string, courseId?: bigint): string {
  if (url && url.trim() !== "") return url;
  // Use a seeded placeholder image based on course ID for consistent display
  const seed = courseId
    ? Number(courseId) % 100
    : Math.floor(Math.random() * 100);
  const themes = [
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=340&fit=crop",
    "https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&h=340&fit=crop",
    "https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=600&h=340&fit=crop",
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=340&fit=crop",
    "https://images.unsplash.com/photo-1542621334-a254cf47733d?w=600&h=340&fit=crop",
    "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&h=340&fit=crop",
    "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=600&h=340&fit=crop",
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=340&fit=crop",
  ];
  return themes[seed % themes.length];
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    "Web Development": "bg-blue-100 text-blue-700",
    "Data Science": "bg-green-100 text-green-700",
    Design: "bg-purple-100 text-purple-700",
    Business: "bg-amber-100 text-amber-700",
    Marketing: "bg-rose-100 text-rose-700",
    "IT & Software": "bg-cyan-100 text-cyan-700",
    "Personal Development": "bg-orange-100 text-orange-700",
    Photography: "bg-pink-100 text-pink-700",
    Music: "bg-indigo-100 text-indigo-700",
  };
  return colors[category] || "bg-slate-100 text-slate-700";
}

export function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  // Support various YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return `https://www.youtube.com/embed/${match[1]}`;
  }
  // If it's already an embed URL or another type, return as-is
  if (url.includes("youtube.com/embed/")) return url;
  return url;
}

export const CATEGORIES = [
  "All",
  "Web Development",
  "Data Science",
  "Design",
  "Business",
  "Marketing",
  "IT & Software",
  "Personal Development",
  "Photography",
  "Music",
];
