"use client";

import { useState } from "react";

const EMOJI_CATEGORIES = {
  "🍔 Makan": [
    "🍔", "🍕", "🍜", "🍱", "🍛", "🍝", "🍲", "🥗", "🍣", "🍤",
    "☕", "🍵", "🧃", "🥤", "🍺", "🍷", "🍰", "🍪", "🍩", "🍦",
    "🍎", "🍊", "🍇", "🥑", "🥕", "🌮", "🥙", "🌯", "🥪", "🍿"
  ],
  "🛵 Transpor": [
    "🚗", "🚕", "🚙", "🚌", "🚎", "🏎️", "🚓", "🚑", "🚒", "🚐",
    "🚛", "🚚", "🚜", "🛵", "🏍️", "🚲", "🛴", "✈️", "🚁", "🚂",
    "🚆", "🚇", "🚊", "🚝", "🚅", "⛵", "🛶", "🚤", "⛴️", "🚢"
  ],
  "🛍️ Belanja": [
    "🛍️", "👕", "👔", "👗", "👠", "👟", "👞", "👡", "👢", "👒",
    "🧢", "👑", "💄", "💅", "👜", "👝", "🎒", "👓", "🕶️", "💍",
    "⌚", "📿", "🧣", "🧤", "🧥", "🩱", "🩳", "🛒", "💳", "🏬"
  ],
  "🏠 Rumah": [
    "🏠", "🏡", "🏘️", "🏚️", "🏗️", "🏢", "🔨", "🔧", "🪛", "🪚",
    "🛋️", "🛏️", "🚪", "🪟", "🚿", "🚽", "🧹", "🧺", "🧼", "🧽",
    "🪣", "🧴", "🧻", "💡", "🕯️", "🔌", "📺", "🖥️", "📱", "⚡"
  ],
  "💊 Sehat": [
    "💊", "💉", "🩺", "🩹", "🏥", "⚕️", "🧘", "🏃", "🚴", "🏊",
    "⚽", "🏀", "🏈", "⚾", "🎾", "🏐", "🏓", "🏸", "🏒", "🥊",
    "🤸", "🧗", "🏋️", "🤾", "🎽", "🥇", "🏆", "🎖️", "💪", "🧠"
  ],
  "💼 Kerja": [
    "📚", "📖", "📝", "✏️", "✒️", "🖊️", "🖋️", "📔", "📓", "📒",
    "📕", "📗", "📘", "📙", "📃", "📄", "📑", "🗂️", "📁", "📂",
    "📆", "📅", "📇", "📋", "📊", "📈", "📉", "🖇️", "📌", "📍"
  ],
  "🎮 Hobi": [
    "🎮", "🎯", "🎲", "🎰", "🎳", "🎹", "🎸", "🎺", "🎻", "🥁",
    "🎬", "🎭", "🎪", "🎨", "🖼️", "🎤", "🎧", "🎵", "🎶", "📷",
    "📸", "📹", "🎥", "📺", "📻", "🎙️", "🎟️", "🎫", "🎗️", "🏅"
  ],
  "✈️ Liburan": [
    "✈️", "🛫", "🛬", "🗺️", "🧳", "⛱️", "🏖️", "🏝️", "🗾", "🏔️",
    "⛰️", "🏕️", "⛺", "🏞️", "🎒", "🧭", "🗿", "🗼", "🏰", "🏯",
    "🕌", "🕍", "⛩️", "🛕", "🎡", "🎢", "🎠", "🌋", "🗻", "🏜️"
  ],
  "💸 Layanan": [
    "💳", "💰", "💵", "💴", "💶", "💷", "🪙", "💸", "🏦", "🏧",
    "📱", "📞", "☎️", "📟", "📠", "💻", "⌨️", "🖱️", "🖨️", "📡",
    "🔋", "🔌", "💡", "🕯️", "🧯", "🗑️", "🚰", "🚻", "🚹", "🚺"
  ],
  "📦 Lainnya": [
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
  const [activeCategory, setActiveCategory] = useState<string>("🍔 Makan");

  const categories = Object.keys(EMOJI_CATEGORIES);
  const emojis = EMOJI_CATEGORIES[activeCategory as keyof typeof EMOJI_CATEGORIES];

  return (
    <div className="flex flex-col gap-4">
      {/* Selected emoji display */}
      <div className="flex items-center gap-3 bg-card-subtle/50 px-3.5 py-3 rounded-2xl border border-border-subtle">
        <div className="grid size-14 place-items-center rounded-xl bg-card text-3xl shadow-sm border border-border-subtle animate-pulse-once">
          {value || "?"}
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-semibold text-muted uppercase tracking-wider">Emoji Terpilih</span>
          <span className="text-xs text-secondary">Ketuk salah satu emoji di bawah untuk mengganti</span>
        </div>
      </div>

      {/* Category tabs (no scrollbar) */}
      <div className="flex gap-1.5 overflow-x-auto pb-1.5 -mx-1 px-1 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
              activeCategory === cat
                ? "bg-accent text-white shadow-sm scale-[1.02]"
                : "bg-card-subtle text-secondary hover:bg-card hover:text-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Emoji grid */}
      <div className="grid grid-cols-6 gap-2 max-h-56 overflow-y-auto p-2.5 rounded-2xl border border-border-subtle bg-card-subtle/20 no-scrollbar">
        {emojis.map((emoji) => {
          const isSelected = value === emoji;
          return (
            <button
              key={emoji}
              type="button"
              onClick={() => onChange(emoji)}
              className={`aspect-square rounded-xl text-2xl flex items-center justify-center transition-all duration-200 hover:scale-125 hover:bg-card hover:shadow-md hover:z-10 ${
                isSelected
                  ? "bg-accent-soft text-accent ring-2 ring-accent scale-[1.05]"
                  : "bg-card/40 hover:bg-card border border-transparent hover:border-border-subtle"
              }`}
            >
              {emoji}
            </button>
          );
        })}
      </div>
    </div>
  );
}
