import { load } from "cheerio";

export const TAPLIST_URL = "https://taplist.io/taplist-975059";

export type TaplistPrice = {
  serving: string;
  price: string;
};

export type TaplistItem = {
  id: string;
  name: string;
  producer: string;
  style: string;
  metrics: string[];
  prices: TaplistPrice[];
};

export type TaplistSection = {
  id: string;
  title: string;
  items: TaplistItem[];
};

export type TaplistMenu = {
  sections: TaplistSection[];
  updatedLabel: string | null;
};

function cleanText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function parseTaplistMenu(html: string): TaplistMenu {
  const $ = load(html);
  const sections: TaplistSection[] = [];

  $("h2.fw-bold").each((sectionIndex, heading) => {
    const $heading = $(heading);
    const title = cleanText($heading.text());
    const $card = $heading.nextAll(".card").first();
    const items: TaplistItem[] = [];

    $card.find('[id^="menu-item-"]').each((itemIndex, item) => {
      const $item = $(item);
      const name = cleanText($item.find("h5 .fw-bold").first().text());

      if (!name) return;

      const producer = cleanText($item.find("h5 small").first().text());
      const style = cleanText($item.find('[id="metadata-style"]').first().text());
      const metrics = $item
        .find(".metadata li")
        .toArray()
        .map((metric) => cleanText($(metric).text()))
        .filter((metric) => metric && metric !== style && !metric.startsWith("SRM"));

      const prices = $item
        .find(".prices > div")
        .toArray()
        .map((row) => {
          const $parts = $(row).children("div");
          return {
            serving: cleanText($parts.first().text()),
            price: cleanText($parts.last().text()),
          };
        })
        .filter(({ serving, price }) => serving && price);

      items.push({
        id: $item.attr("id") || `${slugify(name)}-${itemIndex}`,
        name,
        producer,
        style,
        metrics,
        prices,
      });
    });

    if (title && items.length > 0) {
      sections.push({
        id: `${slugify(title)}-${sectionIndex}`,
        title,
        items,
      });
    }
  });

  if (sections.length === 0) {
    throw new Error("Taplist returned no recognizable menu sections.");
  }

  const description = $('meta[property="og:description"]').attr("content") || "";
  const updatedMatch = description.match(/last updated\s+(.+)$/i);

  return {
    sections,
    updatedLabel: updatedMatch ? cleanText(updatedMatch[1]) : null,
  };
}

export async function getTaplistMenu(): Promise<TaplistMenu> {
  const response = await fetch(TAPLIST_URL, {
    headers: {
      Accept: "text/html",
      "User-Agent": "KitsuneBrewingCo.com menu sync",
    },
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error(`Taplist request failed with status ${response.status}.`);
  }

  return parseTaplistMenu(await response.text());
}
