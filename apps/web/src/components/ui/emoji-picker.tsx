"use client";

import { useState } from "react";

// Emoji presets yang lebih lengkap dan terorganisir
const EMOJI_CATEGORIES = {
  "Makanan & Minuman": [
    "🍔", "🍕", "🍜", "🍱", "🍛", "🍝", "🍲", "🥗", "🍣", "🍤",
    "☕", "🍵", "🧃", "🥤", "🍺", "🍷", "🍰", "🍪", "🍩", "🍦",
    "🍎", "🍊", "🍇", "🥑", "🥕", "🌮", "🥙", "🌯", "🥪", "🍿"
  ],
  "Transportasi": [
    "🚗", "🚕", "🚙", "🚌", "🚎", "🏎️", "🚓", "🚑", "🚒", "🚐",
    "🚛", "🚚", "🚜", "🛵", "🏍️", "🚲", "🛴", "✈️", "🚁", "🚂",
    "🚆", "🚇", "🚊", "🚝", "🚅", "⛵", "🛶", "🚤", "⛴️", "🚢"
  ],
  "Belanja & Fashion": [
    "🛍️", "👕", "👔", "👗", "👠", "👟", "👞", "👡", "👢", "👒",
    "🧢", "👑", "💄", "💅", "👜", "👝", "🎒", "👓", "🕶️", "💍",
    "⌚", "📿", "🧣", "🧤", "🧥", "🩱", "🩳", "🛒", "💳", "🏬"
  ],
  "Rumah & Perabotan": [
    "🏠", "🏡", "🏘️", "🏚️", "🏗️", "🏢", "🔨", "🔧", "🪛", "🪚",
    "🛋️", "🛏️", "🚪", "🪟", "🚿", "🚽", "🧹", "🧺", "🧼", "🧽",
    "🪣", "🧴", "🧻", "💡", "🕯️", "🔌", "📺", "🖥️", "📱", "⚡"
  ],
  "Kesehatan & Olahraga": [
    "💊", "💉", "🩺", "🩹", "🏥", "⚕️", "🧘", "🏃", "🚴", "🏊",
    "⚽", "🏀", "🏈", "⚾", "🎾", "🏐", "🏓", "🏸", "🏒", "🥊",
    "🤸", "🧗", "🏋️", "🤾", "🎽", "🥇", "🏆", "🎖️", "💪", "🧠"
  ],
  "Pendidikan & Kantor": [
    "📚", "📖", "📝", "✏️", "✒️", "🖊️", "🖋️", "📔", "📓", "📒",
    "📕", "📗", "📘", "📙", "📃", "📄", "📑", "🗂️", "📁", "📂",
    "📆", "📅", "📇", "📋", "📊", "📈", "📉", "🖇️", "📌", "📍"
  ],
  "Hiburan & Hobi": [
    "🎮", "🎯", "🎲", "🎰", "🎳", "🎹", "🎸", "🎺", "🎻", "🥁",
    "🎬", "🎭", "🎪", "🎨", "🖼️", "🎤", "🎧", "🎵", "🎶", "📷",
    "📸", "📹", "🎥", "📺", "📻", "🎙️", "🎟️", "🎫", "🎗️", "🏅"
  ],
  "Perjalanan & Liburan": [
    "✈️", "🛫", "🛬", "🗺️", "🧳", "⛱️", "🏖️", "🏝️", "🗾", "🏔️",
    "⛰️", "🏕️", "⛺", "🏞️", "🎒", "🧭", "🗿", "🗼", "🏰", "🏯",
    "🕌", "🕍", "⛩️", "🛕", "🎡", "🎢", "🎠", "🌋", "🗻", "🏜️"
  ],
  "Layanan & Utilitas": [
    "💳", "💰", "💵", "💴", "💶", "💷", "🪙", "💸", "🏦", "🏧",
    "📱", "📞", "☎️", "📟", "📠", "💻", "⌨️", "🖱️", "🖨️", "📡",
    "🔋", "🔌", "💡", "🕯️", "🧯", "🗑️", "🚰", "🚻", "🚹", "🚺"
  ],
  "Lainnya": [
    "❤️", "🎁", "🎉", "🎊", "🎈", "💐", "🌹", "🌸", "🌺", "🌻",
    "🌼", "🌷", "⭐", "✨", "💫", "⚡", "🔥", "💧", "🌈", "☀️",
    "🌙", "⛅", "☁️", "💨", "❄️", "⛄", "🌊", "🐶", "🐱", "🦊"
  ],
};

interface EmojiPickerProps {
  value: string;
  onChange: (emoji: string) => void;
}

export function EmojiPicker({ value, onChange }: EmojiPickerProps) {
  const [activeCategory, setActiveCategory] = useState<string>("Makanan & Minuman");

  const categories = Object.keys(EMOJI_CATEGORIES);
  const emojis = EMOJI_CATEGORIES[activeCategory as keyof typeof EMOJI_CATEGORIES];

  return (
    <div className="flex flex-col gap-3">
      {/* Selected emoji display */}
      <div className="flex items-center gap-3">
        <div className="grid size-16 place-items-center rounded-2xl bg-card-subtle text-4xl">
          {value || "?"}
        </div>
        <div className="flex-1">
          <p className="text-xs font-medium text-muted uppercase tracking-wide">Emoji terpilih</p>
          <p className="text-sm text-foreground">Klik emoji untuk mengubah</p>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              activeCategory === cat
                ? "bg-accent text-white"
                : "bg-card-subtle text-secondary hover:bg-card hover:text-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Emoji grid */}
      <div className="grid grid-cols-8 gap-2 max-h-64 overflow-y-auto p-1 rounded-xl border border-border-subtle bg-card-subtle/30">
        {emojis.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => onChange(emoji)}
            className={`aspect-square rounded-lg text-2xl transition-all hover:scale-110 hover:bg-card ${
              value === emoji ? "bg-accent/20 ring-2 ring-accent" : "bg-card-subtle hover:shadow-sm"
            }`}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
