import Image from 'next/image';
import Link from 'next/link';

interface EntityCardProps {
  image?: string;
  title: string;
  description?: string;
  href: string;
}

export function EntityCard({ image, title, description, href }: EntityCardProps) {
  return (
    <Link href={href} className="block rounded-lg shadow bg-card hover:shadow-lg transition p-4">
      <div className="w-full h-40 mb-4 rounded overflow-hidden bg-muted flex items-center justify-center">
        {image ? (
          <Image src={image} alt={title} width={320} height={160} className="object-cover w-full h-full" />
        ) : (
          <span className="text-muted-foreground">Нет изображения</span>
        )}
      </div>
      <h2 className="text-lg font-semibold mb-1">{title}</h2>
      {description && <p className="text-sm text-muted-foreground line-clamp-3">{description}</p>}
    </Link>
  );
} 