export interface FoodTruckScheduleEntry {
  date: string;       // "YYYY-MM-DD"
  startTime: string;  // "5:00 PM"
  endTime: string;    // "9:00 PM"
}

export interface FoodTruck {
  id: string;
  name: string;
  cuisine: string;
  description: string;
  imageUrl: string;
  website?: string;
  instagram?: string;
  menuUrl?: string;
  phone?: string;
  schedule: FoodTruckScheduleEntry[];
}

// ─── Mock Food Trucks ─────────────────────────────────────────────────────────

export const foodTrucks: FoodTruck[] = [
  {
    id: "lucky-boy",
    name: "Lucky Boy",
    cuisine: "Mexican Street Food",
    description:
      "Phoenix's favorite street taco truck. Lucky Boy serves authentic Sonoran-style tacos, burritos, and quesadillas made with hand-pressed tortillas and locally sourced ingredients. Their al pastor is legendary in the Valley.",
    imageUrl: "https://placehold.co/800x500/c0392b/ffffff?text=Lucky+Boy",
    instagram: "https://instagram.com/luckyboyaz",
    menuUrl: "#",
    schedule: [
      { date: "2026-06-26", startTime: "5:00 PM", endTime: "9:00 PM" },
      { date: "2026-07-03", startTime: "5:00 PM", endTime: "9:00 PM" },
      { date: "2026-07-10", startTime: "5:00 PM", endTime: "9:00 PM" },
      { date: "2026-07-17", startTime: "5:00 PM", endTime: "9:00 PM" },
    ],
  },
  {
    id: "freak-brothers-pizza",
    name: "Freak Brothers Pizza",
    cuisine: "Wood-Fired Pizza",
    description:
      "Artisan wood-fired pizzas cooked in a custom mobile oven. Freak Brothers brings New York-style pies with a southwest twist. Try the Green Chile Pepperoni or the classic Margherita. They also do amazing calzones.",
    imageUrl: "https://placehold.co/800x500/8b4513/ffffff?text=Freak+Brothers+Pizza",
    website: "https://freakbrotherspizza.com",
    instagram: "https://instagram.com/freakbrotherspizza",
    menuUrl: "#",
    schedule: [
      { date: "2026-06-27", startTime: "6:00 PM", endTime: "10:00 PM" },
      { date: "2026-07-04", startTime: "4:00 PM", endTime: "9:00 PM" },
      { date: "2026-07-11", startTime: "6:00 PM", endTime: "10:00 PM" },
      { date: "2026-07-18", startTime: "6:00 PM", endTime: "10:00 PM" },
      { date: "2026-07-25", startTime: "6:00 PM", endTime: "10:00 PM" },
    ],
  },
  {
    id: "street-bbq",
    name: "Street BBQ",
    cuisine: "BBQ & Smoked Meats",
    description:
      "Low-and-slow BBQ perfection on wheels. Street BBQ smokes their brisket for 16 hours and their ribs are fall-off-the-bone tender. Pair their smoked meats with a Kitsune IPA for the ultimate craft beer and BBQ combo.",
    imageUrl: "https://placehold.co/800x500/2c1810/ff8c00?text=Street+BBQ",
    instagram: "https://instagram.com/streetbbqaz",
    schedule: [
      { date: "2026-06-28", startTime: "5:00 PM", endTime: "9:00 PM" },
      { date: "2026-07-05", startTime: "12:00 PM", endTime: "7:00 PM" },
      { date: "2026-07-12", startTime: "5:00 PM", endTime: "9:00 PM" },
      { date: "2026-07-19", startTime: "5:00 PM", endTime: "9:00 PM" },
      { date: "2026-07-26", startTime: "5:00 PM", endTime: "9:00 PM" },
    ],
  },
  {
    id: "la-pina-loca",
    name: "La Piña Loca",
    cuisine: "Mexican Seafood",
    description:
      "Mariscos unlike anything else in Phoenix. La Piña Loca specializes in Sinaloa-style seafood: ceviche, aguachiles, shrimp cocktails, and their famous Vuelve a la Vida (return to life) seafood cocktail. Fresh, citrusy, and spicy.",
    imageUrl: "https://placehold.co/800x500/1a6b3c/ffffff?text=La+Piña+Loca",
    instagram: "https://instagram.com/lapinaloca_phx",
    menuUrl: "#",
    schedule: [
      { date: "2026-07-01", startTime: "5:00 PM", endTime: "9:00 PM" },
      { date: "2026-07-08", startTime: "5:00 PM", endTime: "9:00 PM" },
      { date: "2026-07-15", startTime: "5:00 PM", endTime: "9:00 PM" },
      { date: "2026-07-22", startTime: "5:00 PM", endTime: "9:00 PM" },
      { date: "2026-07-29", startTime: "5:00 PM", endTime: "9:00 PM" },
    ],
  },
  {
    id: "the-chip",
    name: "The Chip",
    cuisine: "Loaded Fries & Snacks",
    description:
      "Gourmet loaded fries, tater tots, and snacks. The Chip takes the humble potato and elevates it to an art form. Their Mac & Cheese Tots and Green Chile Fries are the perfect pairing with a cold Kitsune lager. Perfect snacking during a long MTG event.",
    imageUrl: "https://placehold.co/800x500/d4a017/000000?text=The+Chip",
    instagram: "https://instagram.com/thechipaz",
    menuUrl: "#",
    schedule: [
      { date: "2026-07-02", startTime: "6:00 PM", endTime: "10:00 PM" },
      { date: "2026-07-09", startTime: "6:00 PM", endTime: "10:00 PM" },
      { date: "2026-07-16", startTime: "6:00 PM", endTime: "10:00 PM" },
      { date: "2026-07-23", startTime: "6:00 PM", endTime: "10:00 PM" },
      { date: "2026-07-30", startTime: "6:00 PM", endTime: "10:00 PM" },
    ],
  },
  {
    id: "pho-real",
    name: "Pho Real",
    cuisine: "Vietnamese",
    description:
      "Authentic Vietnamese street food, fast. Pho Real serves rich, aromatic pho broth simmered for 12 hours alongside banh mi sandwiches, fresh spring rolls, and boba drinks. Their vegan options are some of the best in Phoenix.",
    imageUrl: "https://placehold.co/800x500/2e4a6b/ffffff?text=Pho+Real",
    website: "https://phorealfoodtruck.com",
    instagram: "https://instagram.com/phoreal_phx",
    menuUrl: "#",
    schedule: [
      { date: "2026-07-07", startTime: "5:30 PM", endTime: "9:00 PM" },
      { date: "2026-07-14", startTime: "5:30 PM", endTime: "9:00 PM" },
      { date: "2026-07-21", startTime: "5:30 PM", endTime: "9:00 PM" },
      { date: "2026-07-28", startTime: "5:30 PM", endTime: "9:00 PM" },
    ],
  },
];

// ─── Helper functions ─────────────────────────────────────────────────────────

export function getTodaysTruck(): FoodTruck | null {
  const today = new Date().toISOString().split("T")[0];
  return (
    foodTrucks.find((truck) =>
      truck.schedule.some((entry) => entry.date === today)
    ) ?? null
  );
}

export function getTodaysTruckEntry(truck: FoodTruck): FoodTruckScheduleEntry | null {
  const today = new Date().toISOString().split("T")[0];
  return truck.schedule.find((e) => e.date === today) ?? null;
}

export function getUpcomingTrucks(days = 14): Array<{ truck: FoodTruck; entry: FoodTruckScheduleEntry }> {
  const today = new Date().toISOString().split("T")[0];
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  const futureDateStr = futureDate.toISOString().split("T")[0];

  const results: Array<{ truck: FoodTruck; entry: FoodTruckScheduleEntry }> = [];

  for (const truck of foodTrucks) {
    for (const entry of truck.schedule) {
      if (entry.date > today && entry.date <= futureDateStr) {
        results.push({ truck, entry });
      }
    }
  }

  return results.sort((a, b) => a.entry.date.localeCompare(b.entry.date));
}

export function getWeeklySchedule(): Array<{ date: string; trucks: Array<{ truck: FoodTruck; entry: FoodTruckScheduleEntry }> }> {
  const today = new Date();
  const days: Array<{ date: string; trucks: Array<{ truck: FoodTruck; entry: FoodTruckScheduleEntry }> }> = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    const trucks: Array<{ truck: FoodTruck; entry: FoodTruckScheduleEntry }> = [];

    for (const truck of foodTrucks) {
      const entry = truck.schedule.find((e) => e.date === dateStr);
      if (entry) trucks.push({ truck, entry });
    }

    days.push({ date: dateStr, trucks });
  }

  return days;
}

export function formatScheduleDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function getTruckById(id: string): FoodTruck | undefined {
  return foodTrucks.find((t) => t.id === id);
}
