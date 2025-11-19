import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabaseServer";
import { COMPANY_NAME } from "@/data/constants";

const siteBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://asia-ntb.kz";

interface NewsItem {
  id: string;
  title: string;
  description: string;
  content: string;
  date: string;
  category: string;
  images: string[] | null;
  author: string | null;
  is_active: boolean;
}

async function fetchNewsForRSS(): Promise<NewsItem[]> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("news")
    .select("id, title, description, content, date, category, images, author, is_active")
    .eq("is_active", true)
    .order("date", { ascending: false })
    .limit(50); // Ограничиваем до 50 последних новостей

  if (error) {
    console.error("Error fetching news for RSS:", error);
    return [];
  }

  return (data as unknown as NewsItem[]) || [];
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toUTCString();
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const news = await fetchNewsForRSS();

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(COMPANY_NAME)} - Новости</title>
    <link>${siteBaseUrl}</link>
    <description>Актуальные новости и события компании ${escapeXml(COMPANY_NAME)}. Обновления продукции, события отрасли, технические статьи.</description>
    <language>ru-RU</language>
    <lastBuildDate>${formatDate(new Date().toISOString())}</lastBuildDate>
    <atom:link href="${siteBaseUrl}/news/rss.xml" rel="self" type="application/rss+xml"/>
    ${news
      .map((item) => {
        const itemUrl = `${siteBaseUrl}/news/${item.id}`;
        const imageUrl =
          item.images && item.images.length > 0
            ? item.images[0].startsWith("http")
              ? item.images[0]
              : `${siteBaseUrl}${item.images[0]}`
            : null;
        const description = item.description || item.content?.substring(0, 200) || "";
        const content = item.content || item.description || "";

        return `
    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${itemUrl}</link>
      <guid isPermaLink="true">${itemUrl}</guid>
      <description>${escapeXml(description)}</description>
      <content:encoded><![CDATA[${content}]]></content:encoded>
      <pubDate>${formatDate(item.date)}</pubDate>
      ${item.category ? `<category>${escapeXml(item.category)}</category>` : ""}
      ${item.author ? `<author>${escapeXml(item.author)}</author>` : ""}
      ${imageUrl ? `<enclosure url="${imageUrl}" type="image/jpeg"/>` : ""}
    </item>`;
      })
      .join("")}
  </channel>
</rss>`;

  return new NextResponse(rss, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}

